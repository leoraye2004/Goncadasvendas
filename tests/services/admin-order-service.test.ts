import { beforeEach, describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { OrderRepository } from "@/repositories/order-repository";
import { createAdminOrderService } from "@/services/admin-order-service";

const admin = { id: "a1", role: "ADMIN" } as const;
const cliente = { id: "c1", role: "CUSTOMER" } as const;

const pedido = (over: Record<string, unknown> = {}) =>
  ({
    id: "o1",
    status: "PENDING",
    total: "99.80",
    createdAt: new Date("2026-11-03T15:00:00Z"),
    addressSnapshot: { street: "Rua A" },
    user: { name: "Ana", email: "ana@x.com" },
    _count: { items: 2 },
    items: [{ id: "i1", quantity: 2, unitPrice: "49.90", product: { name: "Camiseta" } }],
    ...over,
  }) as never;

let orders: ReturnType<typeof mock<OrderRepository>>;
let service: ReturnType<typeof createAdminOrderService>;

beforeEach(() => {
  orders = mock<OrderRepository>();
  orders.findById.mockResolvedValue(pedido());
  orders.setStatus.mockResolvedValue(1);
  service = createAdminOrderService(orders);
});

describe("RN05 — só ADMIN vê e muda pedidos de todos", () => {
  it.each([
    ["list", () => service.list(cliente)],
    ["get", () => service.get(cliente, "o1")],
    ["setStatus", () => service.setStatus(cliente, "o1", "CONFIRMED")],
  ])("%s por cliente comum devolve FORBIDDEN e não toca no banco", async (_nome, chamar) => {
    expect(await chamar()).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(orders.listAll).not.toHaveBeenCalled();
    expect(orders.findById).not.toHaveBeenCalled();
    expect(orders.setStatus).not.toHaveBeenCalled();
  });
});

describe("adminOrderService.list", () => {
  it("lista pedidos de todos os clientes com nome, e-mail, total e quantidade de itens", async () => {
    orders.listAll.mockResolvedValue([pedido()]);

    const resultado = await service.list(admin);

    expect(resultado).toEqual({
      ok: true,
      data: [
        {
          id: "o1",
          status: "PENDING",
          total: 99.8,
          createdAt: new Date("2026-11-03T15:00:00Z"),
          items: 2,
          customer: { name: "Ana", email: "ana@x.com" },
        },
      ],
    });
  });
});

describe("adminOrderService.get", () => {
  it("devolve o detalhe com itens, endereço guardado e cliente", async () => {
    const resultado = await service.get(admin, "o1");

    expect(orders.findById).toHaveBeenCalledWith("o1");
    expect(resultado).toMatchObject({ ok: true, data: { id: "o1", status: "PENDING", customer: { name: "Ana" } } });
  });

  it("pedido inexistente vira NOT_FOUND", async () => {
    orders.findById.mockResolvedValue(null);

    expect(await service.get(admin, "x")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});

describe("adminOrderService.setStatus", () => {
  it.each([
    ["PENDING", "CONFIRMED"],
    ["PENDING", "CANCELLED"],
    ["CONFIRMED", "SHIPPED"],
    ["CONFIRMED", "CANCELLED"],
    ["SHIPPED", "DELIVERED"],
  ])("permite %s → %s", async (de, para) => {
    orders.findById.mockResolvedValue(pedido({ status: de }));

    expect((await service.setStatus(admin, "o1", para)).ok).toBe(true);
    expect(orders.setStatus).toHaveBeenCalledWith("o1", de, para);
  });

  it.each([
    ["PENDING", "SHIPPED"],
    ["PENDING", "DELIVERED"],
    ["CONFIRMED", "PENDING"],
    ["SHIPPED", "CANCELLED"],
    ["DELIVERED", "CANCELLED"],
    ["CANCELLED", "PENDING"],
    ["PENDING", "PENDING"],
  ])("recusa %s → %s", async (de, para) => {
    orders.findById.mockResolvedValue(pedido({ status: de }));

    expect(await service.setStatus(admin, "o1", para)).toMatchObject({ ok: false, code: "INVALID" });
    expect(orders.setStatus).not.toHaveBeenCalled();
  });

  it("recusa status que não existe", async () => {
    expect(await service.setStatus(admin, "o1", "PAGO")).toMatchObject({ ok: false, code: "INVALID" });
    expect(orders.findById).not.toHaveBeenCalled();
  });

  it("pedido inexistente vira NOT_FOUND", async () => {
    orders.findById.mockResolvedValue(null);

    expect(await service.setStatus(admin, "x", "CONFIRMED")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("se outro admin mudou o pedido no meio do caminho, pede para atualizar a página", async () => {
    orders.setStatus.mockResolvedValue(0);

    const resultado = await service.setStatus(admin, "o1", "CONFIRMED");

    expect(resultado).toMatchObject({ ok: false, code: "INVALID" });
    expect(resultado.ok === false && resultado.message).toContain("mudou");
  });
});
