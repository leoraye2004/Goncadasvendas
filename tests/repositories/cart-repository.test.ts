import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { createCartRepository } from "@/repositories/cart-repository";

function setup() {
  const db = mockDeep<PrismaClient>();
  return { db, repo: createCartRepository(db) };
}

describe("cartRepository", () => {
  it("list traz só os itens do usuário, com produto e imagens", async () => {
    const { db, repo } = setup();

    await repo.list("u1");

    expect(db.cartItem.findMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
      include: { product: { include: { images: true } } },
      orderBy: { id: "asc" },
    });
  });

  it("findByProduct procura pela chave única (usuário + produto + tamanho vazio)", async () => {
    const { db, repo } = setup();

    await repo.findByProduct("u1", "p1");

    expect(db.cartItem.findUnique).toHaveBeenCalledWith({
      where: { userId_productId_size: { userId: "u1", productId: "p1", size: "" } },
    });
  });

  it("save grava a quantidade com upsert (cria ou atualiza)", async () => {
    const { db, repo } = setup();

    await repo.save("u1", "p1", 3);

    expect(db.cartItem.upsert).toHaveBeenCalledWith({
      where: { userId_productId_size: { userId: "u1", productId: "p1", size: "" } },
      update: { quantity: 3 },
      create: { userId: "u1", productId: "p1", size: "", quantity: 3 },
    });
  });

  it("setQuantity só altera item que é do usuário e devolve quantos mudaram", async () => {
    const { db, repo } = setup();
    db.cartItem.updateMany.mockResolvedValue({ count: 1 });

    expect(await repo.setQuantity("u1", "i1", 4)).toBe(1);
    expect(db.cartItem.updateMany).toHaveBeenCalledWith({ where: { id: "i1", userId: "u1" }, data: { quantity: 4 } });
  });

  it("remove só apaga item que é do usuário e devolve quantos apagou", async () => {
    const { db, repo } = setup();
    db.cartItem.deleteMany.mockResolvedValue({ count: 0 });

    expect(await repo.remove("u1", "i1")).toBe(0);
    expect(db.cartItem.deleteMany).toHaveBeenCalledWith({ where: { id: "i1", userId: "u1" } });
  });

  it("clear apaga todos os itens do usuário", async () => {
    const { db, repo } = setup();

    await repo.clear("u1");

    expect(db.cartItem.deleteMany).toHaveBeenCalledWith({ where: { userId: "u1" } });
  });
});
