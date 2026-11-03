import type { AddressRepository } from "@/repositories/address-repository";
import type { CartRepository } from "@/repositories/cart-repository";
import type { OrderRepository } from "@/repositories/order-repository";
import type { Actor } from "@/services/product-service";
import { falha, SEM_LOGIN } from "@/services/result";

const emCentavos = (preco: unknown) => Math.round(Number(preco) * 100);

// RN03: produto inativo ou sem preço não entra no pedido.
const compravel = (produto: { price: unknown; active: boolean }) => produto.active && Number(produto.price) > 0;

// Regras de UC06 (finalizar pedido) e RN01 (só logado). O userId vem sempre do Actor (a sessão).
export function createOrderService(cart: CartRepository, addresses: AddressRepository, orders: OrderRepository) {
  return {
    async checkout(actor: Actor | null, addressId: unknown) {
      if (!actor) return SEM_LOGIN;
      if (typeof addressId !== "string" || addressId === "") return falha("INVALID", "Escolha um endereço de entrega");

      const linhas = await cart.list(actor.id);
      const itens = linhas.filter((linha) => compravel(linha.product));
      if (itens.length === 0) return falha("INVALID", "Seu carrinho está vazio");

      const endereco = await addresses.findOwned(actor.id, addressId);
      if (!endereco) return falha("NOT_FOUND", "Endereço não encontrado");

      // O preço é copiado do produto AGORA para o item do pedido (unitPrice): mudar o preço depois não altera
      // pedidos já feitos. O endereço também é copiado, porque o original pode ser editado ou excluído.
      const centavos = itens.reduce((soma, item) => soma + emCentavos(item.product.price) * item.quantity, 0);
      const { cep, street, number, district, city, state } = endereco;

      const pedido = await orders.place({
        userId: actor.id,
        addressId: endereco.id,
        addressSnapshot: { cep, street, number, district, city, state },
        total: centavos / 100,
        cartItemCount: linhas.length,
        items: itens.map((item) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          unitPrice: Number(item.product.price),
        })),
      });
      if (!pedido) return falha("INVALID", "Seu carrinho mudou. Confira os itens e tente de novo.");

      return { ok: true, data: { id: pedido.id } } as const;
    },

    async list(actor: Actor | null) {
      if (!actor) return SEM_LOGIN;
      return { ok: true, data: await orders.listByUser(actor.id) } as const;
    },

    async get(actor: Actor | null, id: string) {
      if (!actor) return SEM_LOGIN;
      const pedido = await orders.findOwned(actor.id, id);
      return pedido ? ({ ok: true, data: pedido } as const) : falha("NOT_FOUND", "Pedido não encontrado");
    },
  };
}

export type OrderService = ReturnType<typeof createOrderService>;
