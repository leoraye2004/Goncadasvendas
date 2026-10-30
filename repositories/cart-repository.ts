import type { PrismaClient } from "@prisma/client";

// Os produtos não têm tamanho no escopo da RFC, mas a chave única do banco inclui o campo. Usamos sempre "".
const SEM_TAMANHO = "";

const chave = (userId: string, productId: string) => ({ userId_productId_size: { userId, productId, size: SEM_TAMANHO } });

// Único lugar do carrinho que fala com o banco. Todo acesso filtra pelo userId: ninguém mexe no carrinho dos outros.
export function createCartRepository(db: PrismaClient) {
  return {
    list: (userId: string) =>
      db.cartItem.findMany({
        where: { userId },
        include: { product: { include: { images: true } } },
        orderBy: { id: "asc" },
      }),

    findByProduct: (userId: string, productId: string) => db.cartItem.findUnique({ where: chave(userId, productId) }),

    save: (userId: string, productId: string, quantity: number) =>
      db.cartItem.upsert({
        where: chave(userId, productId),
        update: { quantity },
        create: { userId, productId, size: SEM_TAMANHO, quantity },
      }),

    // Devolvem quantos itens mudaram: 0 significa que o item não existe ou é de outro usuário.
    setQuantity: async (userId: string, id: string, quantity: number) =>
      (await db.cartItem.updateMany({ where: { id, userId }, data: { quantity } })).count,

    remove: async (userId: string, id: string) => (await db.cartItem.deleteMany({ where: { id, userId } })).count,

    clear: (userId: string) => db.cartItem.deleteMany({ where: { userId } }),
  };
}

export type CartRepository = ReturnType<typeof createCartRepository>;
