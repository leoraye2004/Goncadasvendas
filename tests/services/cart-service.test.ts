import { beforeEach, describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { CartRepository } from "@/repositories/cart-repository";
import type { ProductRepository } from "@/repositories/product-repository";
import { createCartService } from "@/services/cart-service";

const cliente = { id: "u1", role: "CUSTOMER" } as const;

const produto = (over: Record<string, unknown> = {}) =>
  ({ id: "p1", name: "Camiseta", price: 49.9, active: true, images: [{ url: "https://blob/a.png" }], ...over }) as never;
const item = (id: string, quantity: number, over: Record<string, unknown> = {}) =>
  ({ id, userId: "u1", productId: "p1", size: "", quantity, product: produto(over) }) as never;

let cart: ReturnType<typeof mock<CartRepository>>;
let products: ReturnType<typeof mock<Pick<ProductRepository, "findById">>>;
let service: ReturnType<typeof createCartService>;

beforeEach(() => {
  cart = mock<CartRepository>();
  products = mock<Pick<ProductRepository, "findById">>();
  products.findById.mockResolvedValue(produto());
  cart.findByProduct.mockResolvedValue(null);
  service = createCartService(cart, products);
});

describe("RN01 — carrinho só para usuário autenticado", () => {
  it.each([
    ["view", () => service.view(null)],
    ["add", () => service.add(null, "p1", 1)],
    ["setQuantity", () => service.setQuantity(null, "i1", 1)],
    ["remove", () => service.remove(null, "i1")],
    ["clear", () => service.clear(null)],
  ])("%s sem login devolve UNAUTHENTICATED e não toca no banco", async (_nome, chamar) => {
    const resultado = await chamar();

    expect(resultado).toMatchObject({ ok: false, code: "UNAUTHENTICATED" });
    expect(cart.list).not.toHaveBeenCalled();
    expect(cart.save).not.toHaveBeenCalled();
    expect(cart.remove).not.toHaveBeenCalled();
    expect(cart.clear).not.toHaveBeenCalled();
  });

  it("count sem login é 0", async () => {
    expect(await service.count(null)).toBe(0);
  });
});

describe("cartService.add", () => {
  it("coloca um produto novo no carrinho do usuário logado", async () => {
    const resultado = await service.add(cliente, "p1", 2);

    expect(resultado.ok).toBe(true);
    expect(cart.save).toHaveBeenCalledWith("u1", "p1", 2);
  });

  it("soma a quantidade quando o produto já está no carrinho (RN02)", async () => {
    cart.findByProduct.mockResolvedValue(item("i1", 2));

    await service.add(cliente, "p1", 3);

    expect(cart.save).toHaveBeenCalledWith("u1", "p1", 5);
  });

  it("não deixa passar de 99 unidades do mesmo produto", async () => {
    cart.findByProduct.mockResolvedValue(item("i1", 98));

    const resultado = await service.add(cliente, "p1", 2);

    expect(resultado).toMatchObject({ ok: false, code: "INVALID" });
    expect(cart.save).not.toHaveBeenCalled();
  });

  it.each([0, -2, 1.5, 100, "x"])("recusa quantidade %s", async (quantidade) => {
    const resultado = await service.add(cliente, "p1", quantidade);

    expect(resultado).toMatchObject({ ok: false, code: "INVALID" });
    expect(cart.save).not.toHaveBeenCalled();
  });

  it("produto que não existe dá NOT_FOUND", async () => {
    products.findById.mockResolvedValue(null);

    expect(await service.add(cliente, "x", 1)).toMatchObject({ ok: false, code: "NOT_FOUND" });
    expect(cart.save).not.toHaveBeenCalled();
  });

  it.each([
    ["inativo", { active: false }],
    ["com preço zero", { price: 0 }],
  ])("produto %s não pode ser comprado (RN03)", async (_nome, over) => {
    products.findById.mockResolvedValue(produto(over));

    expect(await service.add(cliente, "p1", 1)).toMatchObject({ ok: false, code: "NOT_FOUND" });
    expect(cart.save).not.toHaveBeenCalled();
  });
});

describe("cartService.setQuantity", () => {
  it("troca a quantidade do item do próprio usuário", async () => {
    cart.setQuantity.mockResolvedValue(1);

    expect((await service.setQuantity(cliente, "i1", 4)).ok).toBe(true);
    expect(cart.setQuantity).toHaveBeenCalledWith("u1", "i1", 4);
  });

  it("item que não é do usuário (ou não existe) dá NOT_FOUND", async () => {
    cart.setQuantity.mockResolvedValue(0);

    expect(await service.setQuantity(cliente, "i-de-outro", 4)).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("quantidade inválida nem chega ao banco", async () => {
    expect(await service.setQuantity(cliente, "i1", 0)).toMatchObject({ ok: false, code: "INVALID" });
    expect(cart.setQuantity).not.toHaveBeenCalled();
  });
});

describe("cartService.remove e clear", () => {
  it("remove o item do próprio usuário", async () => {
    cart.remove.mockResolvedValue(1);

    expect((await service.remove(cliente, "i1")).ok).toBe(true);
    expect(cart.remove).toHaveBeenCalledWith("u1", "i1");
  });

  it("remover item de outro usuário dá NOT_FOUND", async () => {
    cart.remove.mockResolvedValue(0);

    expect(await service.remove(cliente, "i-de-outro")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("clear esvazia o carrinho do usuário", async () => {
    expect((await service.clear(cliente)).ok).toBe(true);
    expect(cart.clear).toHaveBeenCalledWith("u1");
  });
});

describe("cartService.view", () => {
  it("monta as linhas com subtotal e o total do carrinho", async () => {
    cart.list.mockResolvedValue([
      item("i1", 3, { price: 19.9 }),
      item("i2", 1, { id: "p2", name: "Boné", price: 39.9, images: [] }),
    ]);

    const resultado = await service.view(cliente);

    expect(cart.list).toHaveBeenCalledWith("u1");
    expect(resultado).toEqual({
      ok: true,
      data: {
        items: [
          { id: "i1", productId: "p1", name: "Camiseta", unitPrice: 19.9, quantity: 3, lineTotal: 59.7, imageUrl: "https://blob/a.png" },
          { id: "i2", productId: "p1", name: "Boné", unitPrice: 39.9, quantity: 1, lineTotal: 39.9, imageUrl: undefined },
        ],
        total: 99.6,
        count: 4,
      },
    });
  });

  it("carrinho vazio tem total 0", async () => {
    cart.list.mockResolvedValue([]);

    expect(await service.view(cliente)).toEqual({ ok: true, data: { items: [], total: 0, count: 0 } });
  });

  it("deixa de fora produto que ficou inativo ou com preço zero (RN03)", async () => {
    cart.list.mockResolvedValue([item("i1", 1), item("i2", 1, { active: false }), item("i3", 1, { price: 0 })]);

    const resultado = await service.view(cliente);

    expect(resultado.ok && resultado.data.items.map((i) => i.id)).toEqual(["i1"]);
  });

  it("count soma as quantidades", async () => {
    cart.list.mockResolvedValue([item("i1", 2), item("i2", 5)]);

    expect(await service.count(cliente)).toBe(7);
  });
});
