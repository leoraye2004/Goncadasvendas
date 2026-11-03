import { beforeEach, describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { AddressRepository } from "@/repositories/address-repository";
import type { CartRepository } from "@/repositories/cart-repository";
import type { OrderRepository } from "@/repositories/order-repository";
import { createOrderService } from "@/services/order-service";

const cliente = { id: "u1", role: "CUSTOMER" } as const;

const endereco = { id: "a1", userId: "u1", cep: "89201-000", street: "Rua A", number: "10", district: "Centro", city: "Joinville", state: "SC" };
const snapshot = { cep: "89201-000", street: "Rua A", number: "10", district: "Centro", city: "Joinville", state: "SC" };

const linha = (id: string, quantity: number, product: Record<string, unknown> = {}) =>
  ({ id, userId: "u1", productId: `p-${id}`, size: "", quantity, product: { name: `Produto ${id}`, price: 19.9, active: true, images: [], ...product } }) as never;

let cart: ReturnType<typeof mock<CartRepository>>;
let addresses: ReturnType<typeof mock<AddressRepository>>;
let orders: ReturnType<typeof mock<OrderRepository>>;
let service: ReturnType<typeof createOrderService>;

beforeEach(() => {
  cart = mock<CartRepository>();
  addresses = mock<AddressRepository>();
  orders = mock<OrderRepository>();
  cart.list.mockResolvedValue([linha("i1", 3), linha("i2", 1, { price: 39.9 })]);
  addresses.findOwned.mockResolvedValue(endereco as never);
  orders.place.mockResolvedValue({ id: "o1" } as never);
  service = createOrderService(cart, addresses, orders);
});

describe("RN01 — pedido só para usuário autenticado", () => {
  it.each([
    ["checkout", () => service.checkout(null, "a1")],
    ["list", () => service.list(null)],
    ["get", () => service.get(null, "o1")],
  ])("%s sem login devolve UNAUTHENTICATED e não toca no banco", async (_nome, chamar) => {
    expect(await chamar()).toMatchObject({ ok: false, code: "UNAUTHENTICATED" });
    expect(cart.list).not.toHaveBeenCalled();
    expect(orders.place).not.toHaveBeenCalled();
    expect(orders.listByUser).not.toHaveBeenCalled();
  });
});

describe("orderService.checkout", () => {
  it("cria o pedido com preço congelado, total certo e cópia do endereço", async () => {
    const resultado = await service.checkout(cliente, "a1");

    expect(resultado).toEqual({ ok: true, data: { id: "o1" } });
    expect(addresses.findOwned).toHaveBeenCalledWith("u1", "a1");
    expect(orders.place).toHaveBeenCalledWith({
      userId: "u1",
      addressId: "a1",
      addressSnapshot: snapshot,
      total: 99.6, // 3 × 19,90 + 1 × 39,90
      cartItemCount: 2,
      items: [
        { productId: "p-i1", size: "", quantity: 3, unitPrice: 19.9 },
        { productId: "p-i2", size: "", quantity: 1, unitPrice: 39.9 },
      ],
    });
  });

  it("carrinho vazio dá INVALID e não cria pedido", async () => {
    cart.list.mockResolvedValue([]);

    expect(await service.checkout(cliente, "a1")).toMatchObject({ ok: false, code: "INVALID", message: "Seu carrinho está vazio" });
    expect(orders.place).not.toHaveBeenCalled();
  });

  it("carrinho só com produto escondido (RN03) conta como vazio", async () => {
    cart.list.mockResolvedValue([linha("i1", 1, { active: false }), linha("i2", 1, { price: 0 })]);

    expect(await service.checkout(cliente, "a1")).toMatchObject({ ok: false, code: "INVALID" });
    expect(orders.place).not.toHaveBeenCalled();
  });

  it("produto escondido fica de fora do pedido, mas sai do carrinho junto", async () => {
    cart.list.mockResolvedValue([linha("i1", 2), linha("i2", 1, { active: false })]);

    await service.checkout(cliente, "a1");

    const pedido = orders.place.mock.calls[0][0];
    expect(pedido.items.map((i) => i.productId)).toEqual(["p-i1"]);
    expect(pedido.total).toBe(39.8);
    expect(pedido.cartItemCount).toBe(2);
  });

  it.each([undefined, "", 123])("sem escolher endereço (%j) dá INVALID", async (id) => {
    expect(await service.checkout(cliente, id)).toMatchObject({ ok: false, code: "INVALID", message: "Escolha um endereço de entrega" });
    expect(orders.place).not.toHaveBeenCalled();
  });

  it("endereço que não é do usuário (ou não existe) dá NOT_FOUND", async () => {
    addresses.findOwned.mockResolvedValue(null);

    expect(await service.checkout(cliente, "a-de-outro")).toMatchObject({ ok: false, code: "NOT_FOUND" });
    expect(orders.place).not.toHaveBeenCalled();
  });

  it("se o carrinho mudou durante a compra (ex.: duplo clique), recusa", async () => {
    orders.place.mockResolvedValue(null);

    expect(await service.checkout(cliente, "a1")).toMatchObject({ ok: false, code: "INVALID" });
  });
});

describe("orderService.list e get", () => {
  it("list traz os pedidos do usuário logado", async () => {
    orders.listByUser.mockResolvedValue([{ id: "o1" }] as never);

    expect(await service.list(cliente)).toEqual({ ok: true, data: [{ id: "o1" }] });
    expect(orders.listByUser).toHaveBeenCalledWith("u1");
  });

  it("get devolve o pedido do próprio usuário", async () => {
    orders.findOwned.mockResolvedValue({ id: "o1" } as never);

    expect(await service.get(cliente, "o1")).toEqual({ ok: true, data: { id: "o1" } });
    expect(orders.findOwned).toHaveBeenCalledWith("u1", "o1");
  });

  it("pedido de outro usuário dá NOT_FOUND", async () => {
    orders.findOwned.mockResolvedValue(null);

    expect(await service.get(cliente, "o-de-outro")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});
