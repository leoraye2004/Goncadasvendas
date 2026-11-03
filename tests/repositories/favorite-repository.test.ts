import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { createFavoriteRepository } from "@/repositories/favorite-repository";

function setup() {
  const db = mockDeep<PrismaClient>();
  return { db, repo: createFavoriteRepository(db) };
}

describe("favoriteRepository", () => {
  it("list traz só os favoritos do usuário, com produto e imagens", async () => {
    const { db, repo } = setup();

    await repo.list("u1");

    expect(db.favorite.findMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
      include: { product: { include: { images: true } } },
      orderBy: { id: "desc" },
    });
  });

  it("add usa upsert na chave única, então favoritar duas vezes não duplica", async () => {
    const { db, repo } = setup();

    await repo.add("u1", "p1");

    expect(db.favorite.upsert).toHaveBeenCalledWith({
      where: { userId_productId: { userId: "u1", productId: "p1" } },
      update: {},
      create: { userId: "u1", productId: "p1" },
    });
  });

  it("remove apaga só o favorito daquele usuário e devolve quantos apagou", async () => {
    const { db, repo } = setup();
    db.favorite.deleteMany.mockResolvedValue({ count: 1 });

    expect(await repo.remove("u1", "p1")).toBe(1);
    expect(db.favorite.deleteMany).toHaveBeenCalledWith({ where: { userId: "u1", productId: "p1" } });
  });

  it("exists diz se o usuário favoritou o produto", async () => {
    const { db, repo } = setup();
    db.favorite.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);

    expect(await repo.exists("u1", "p1")).toBe(true);
    expect(await repo.exists("u1", "p1")).toBe(false);
    expect(db.favorite.count).toHaveBeenCalledWith({ where: { userId: "u1", productId: "p1" } });
  });
});
