import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { createProductRepository } from "@/repositories/product-repository";

function setup() {
  const db = mockDeep<PrismaClient>();
  return { db, repo: createProductRepository(db) };
}

describe("productRepository", () => {
  it("list traz só os ativos, com imagens, em ordem alfabética", async () => {
    const { db, repo } = setup();

    await repo.list();

    expect(db.product.findMany).toHaveBeenCalledWith({
      where: { active: true },
      include: { images: true },
      orderBy: { name: "asc" },
    });
  });

  it("findById busca o produto com as imagens", async () => {
    const { db, repo } = setup();

    await repo.findById("p1");

    expect(db.product.findUnique).toHaveBeenCalledWith({ where: { id: "p1" }, include: { images: true } });
  });

  it("create grava o produto e as imagens juntos", async () => {
    const { db, repo } = setup();

    await repo.create({ name: "Boné", category: "Acessórios", brand: undefined, price: 39.9, imageUrls: ["u1", "u2"] });

    expect(db.product.create).toHaveBeenCalledWith({
      data: {
        name: "Boné",
        category: "Acessórios",
        brand: undefined,
        price: 39.9,
        images: { create: [{ url: "u1" }, { url: "u2" }] },
      },
      include: { images: true },
    });
  });

  it("update troca os dados, acrescenta imagens novas e remove as marcadas", async () => {
    const { db, repo } = setup();

    await repo.update("p1", { name: "Boné", category: "Acessórios", brand: "GV", price: 39.9, imageUrls: ["u3"], removeImageIds: ["i1"] });

    expect(db.product.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: {
        name: "Boné",
        category: "Acessórios",
        brand: "GV",
        price: 39.9,
        images: { create: [{ url: "u3" }], deleteMany: { id: { in: ["i1"] } } },
      },
      include: { images: true },
    });
  });

  it("countOrderItems conta quantas vezes o produto já foi pedido", async () => {
    const { db, repo } = setup();
    db.orderItem.count.mockResolvedValue(3);

    expect(await repo.countOrderItems("p1")).toBe(3);
    expect(db.orderItem.count).toHaveBeenCalledWith({ where: { productId: "p1" } });
  });

  it("remove apaga de vez e deactivate só marca como inativo", async () => {
    const { db, repo } = setup();

    await repo.remove("p1");
    await repo.deactivate("p2");

    expect(db.product.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
    expect(db.product.update).toHaveBeenCalledWith({ where: { id: "p2" }, data: { active: false } });
  });
});
