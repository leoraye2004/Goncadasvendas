import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { createOrderRepository } from "@/repositories/order-repository";

const endereco = { cep: "89201-000", street: "Rua A", number: "10", district: "Centro", city: "Joinville", state: "SC" };

const pedido = {
  userId: "u1",
  addressId: "a1",
  addressSnapshot: endereco,
  total: 99.6,
  cartItemCount: 2,
  items: [
    { productId: "p1", size: "", quantity: 3, unitPrice: 19.9 },
    { productId: "p2", size: "", quantity: 1, unitPrice: 39.9 },
  ],
};

function setup(apagados: number) {
  const db = mockDeep<PrismaClient>();
  // Roda o corpo da transação usando o próprio mock, como o Prisma faz com o cliente da transação.
  db.$transaction.mockImplementation(async (corpo: unknown) => (corpo as (tx: unknown) => unknown)(db) as never);
  db.cartItem.deleteMany.mockResolvedValue({ count: apagados });
  db.order.create.mockResolvedValue({ id: "o1" } as never);
  return { db, repo: createOrderRepository(db) };
}

describe("orderRepository.place", () => {
  it("apaga o carrinho e cria o pedido com os itens e o preço congelado, na mesma transação", async () => {
    const { db, repo } = setup(2);

    expect(await repo.place(pedido)).toEqual({ id: "o1" });

    expect(db.cartItem.deleteMany).toHaveBeenCalledWith({ where: { userId: "u1" } });
    expect(db.order.create).toHaveBeenCalledWith({
      data: {
        userId: "u1",
        addressId: "a1",
        addressSnapshot: endereco,
        total: 99.6,
        items: {
          create: [
            { productId: "p1", size: "", quantity: 3, unitPrice: 19.9 },
            { productId: "p2", size: "", quantity: 1, unitPrice: 39.9 },
          ],
        },
      },
    });
    const ordemDasChamadas = [db.cartItem.deleteMany, db.order.create].map((f) => f.mock.invocationCallOrder[0]);
    expect(ordemDasChamadas[0]).toBeLessThan(ordemDasChamadas[1]);
  });

  it("se o carrinho não tem mais os itens esperados, desfaz tudo e devolve null", async () => {
    const { db, repo } = setup(0); // outra requisição já levou o carrinho

    expect(await repo.place(pedido)).toBeNull();
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it("erros de verdade do banco continuam sendo lançados", async () => {
    const { db, repo } = setup(2);
    db.order.create.mockRejectedValue(new Error("banco caiu"));

    await expect(repo.place(pedido)).rejects.toThrow("banco caiu");
  });
});

describe("orderRepository — leitura", () => {
  it("listByUser traz só os pedidos do usuário, do mais novo para o mais antigo", async () => {
    const { db, repo } = setup(0);

    await repo.listByUser("u1");

    expect(db.order.findMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    });
  });

  it("findOwned busca o pedido pelo id E pelo usuário, com os itens e o nome dos produtos", async () => {
    const { db, repo } = setup(0);

    await repo.findOwned("u1", "o1");

    expect(db.order.findFirst).toHaveBeenCalledWith({
      where: { id: "o1", userId: "u1" },
      include: { items: { include: { product: { select: { name: true } } }, orderBy: { id: "asc" } } },
    });
  });
});

describe("orderRepository — administração (UC10)", () => {
  it("listAll traz os pedidos de todos, do mais novo para o mais antigo, com cliente e contagem de itens", async () => {
    const { db, repo } = setup(0);

    await repo.listAll();

    expect(db.order.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, _count: { select: { items: true } } },
    });
  });

  it("findById traz o pedido com cliente, itens e nome dos produtos", async () => {
    const { db, repo } = setup(0);

    await repo.findById("o1");

    expect(db.order.findUnique).toHaveBeenCalledWith({
      where: { id: "o1" },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } }, orderBy: { id: "asc" } },
      },
    });
  });

  it("setStatus só muda se o pedido ainda está no status de origem e devolve quantos mudou", async () => {
    const { db, repo } = setup(0);
    db.order.updateMany.mockResolvedValue({ count: 1 });

    expect(await repo.setStatus("o1", "PENDING", "CONFIRMED")).toBe(1);
    expect(db.order.updateMany).toHaveBeenCalledWith({
      where: { id: "o1", status: "PENDING" },
      data: { status: "CONFIRMED" },
    });
  });
});
