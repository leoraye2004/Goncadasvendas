import type { PrismaClient } from "@prisma/client";

// Único lugar dos favoritos que fala com o banco. Todo acesso filtra pelo userId: ninguém mexe nos favoritos dos outros.
export function createFavoriteRepository(db: PrismaClient) {
  return {
    list: (userId: string) =>
      db.favorite.findMany({
        where: { userId },
        include: { product: { include: { images: true } } },
        orderBy: { id: "desc" },
      }),

    // upsert na chave única (userId + productId): favoritar duas vezes não cria duplicata.
    add: (userId: string, productId: string) =>
      db.favorite.upsert({
        where: { userId_productId: { userId, productId } },
        update: {},
        create: { userId, productId },
      }),

    // Devolve quantos favoritos apagou (0 se o produto não era favorito).
    remove: async (userId: string, productId: string) => (await db.favorite.deleteMany({ where: { userId, productId } })).count,

    exists: async (userId: string, productId: string) => (await db.favorite.count({ where: { userId, productId } })) > 0,
  };
}

export type FavoriteRepository = ReturnType<typeof createFavoriteRepository>;
