import { MAX_QUANTITY, quantitySchema } from "@/lib/validation/cart";
import type { CartRepository } from "@/repositories/cart-repository";
import type { ProductRepository } from "@/repositories/product-repository";
import type { Actor } from "@/services/product-service";
import { falha, OK, SEM_LOGIN, type Result } from "@/services/result";

const PRODUTO_NAO_ENCONTRADO = falha("NOT_FOUND", "Produto não encontrado");
const ITEM_NAO_ENCONTRADO = falha("NOT_FOUND", "Item não encontrado no carrinho");

type Produto = { price: unknown; active: boolean };
// RN03: produto inativo ou sem preço não pode ser comprado.
const compravel = (produto: Produto) => produto.active && Number(produto.price) > 0;

const emCentavos = (preco: unknown) => Math.round(Number(preco) * 100);

// Regras de UC05 (carrinho), RN01 (só logado) e RN02 (persistido por usuário). O userId vem sempre do Actor,
// nunca de algo que o navegador manda, e o repository só mexe em itens daquele userId.
export function createCartService(cart: CartRepository, products: Pick<ProductRepository, "findById">) {
  async function view(actor: Actor | null) {
    if (!actor) return SEM_LOGIN;
    const itens = (await cart.list(actor.id)).filter((item) => compravel(item.product));

    // Soma em centavos para não acumular erro de ponto flutuante (3 × 19,90 = 59,70).
    const linhas = itens.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      unitPrice: Number(item.product.price),
      quantity: item.quantity,
      lineTotal: (emCentavos(item.product.price) * item.quantity) / 100,
      imageUrl: item.product.images[0]?.url,
    }));
    const centavos = itens.reduce((soma, item) => soma + emCentavos(item.product.price) * item.quantity, 0);

    return {
      ok: true,
      data: { items: linhas, total: centavos / 100, count: itens.reduce((soma, item) => soma + item.quantity, 0) },
    } as const;
  }

  return {
    view,

    // Número que aparece no cabeçalho. Visitante não tem carrinho: 0.
    async count(actor: Actor | null) {
      const resultado = await view(actor);
      return resultado.ok ? resultado.data.count : 0;
    },

    async add(actor: Actor | null, productId: string, quantity: unknown): Promise<Result<void>> {
      if (!actor) return SEM_LOGIN;
      const qtd = quantitySchema.safeParse(quantity);
      if (!qtd.success) return falha("INVALID", qtd.error.issues[0].message);

      const produto = await products.findById(productId);
      if (!produto || !compravel(produto)) return PRODUTO_NAO_ENCONTRADO;

      // Já estava no carrinho: soma a quantidade (RN02), respeitando o máximo.
      const existente = await cart.findByProduct(actor.id, productId);
      const total = (existente?.quantity ?? 0) + qtd.data;
      if (total > MAX_QUANTITY) return falha("INVALID", `O máximo é ${MAX_QUANTITY} unidades por produto`);

      await cart.save(actor.id, productId, total);
      return OK;
    },

    async setQuantity(actor: Actor | null, itemId: string, quantity: unknown): Promise<Result<void>> {
      if (!actor) return SEM_LOGIN;
      const qtd = quantitySchema.safeParse(quantity);
      if (!qtd.success) return falha("INVALID", qtd.error.issues[0].message);

      return (await cart.setQuantity(actor.id, itemId, qtd.data)) === 0 ? ITEM_NAO_ENCONTRADO : OK;
    },

    async remove(actor: Actor | null, itemId: string): Promise<Result<void>> {
      if (!actor) return SEM_LOGIN;
      return (await cart.remove(actor.id, itemId)) === 0 ? ITEM_NAO_ENCONTRADO : OK;
    },

    async clear(actor: Actor | null): Promise<Result<void>> {
      if (!actor) return SEM_LOGIN;
      await cart.clear(actor.id);
      return OK;
    },
  };
}

export type CartService = ReturnType<typeof createCartService>;
