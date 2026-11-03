import type { PrismaClient } from "@prisma/client";

export type NewOrder = {
  userId: string;
  addressId: string;
  addressSnapshot: { cep: string; street: string; number: string; district: string; city: string; state: string };
  total: number;
  // Quantas linhas o carrinho tinha quando o service o leu. Serve para detectar duplo clique (ver place).
  cartItemCount: number;
  items: { productId: string; size: string; quantity: number; unitPrice: number }[];
};

class CarrinhoMudou extends Error {}

// Único lugar dos pedidos que fala com o banco. Leituras sempre filtram por userId.
export function createOrderRepository(db: PrismaClient) {
  return {
    // Esvazia o carrinho e cria o pedido na MESMA transação: ou acontece tudo ou nada. Apagar primeiro serve de
    // trava: se dois cliques chegarem juntos, o segundo apaga 0 linhas, vê que o carrinho já foi levado e desfaz.
    async place({ cartItemCount, items, ...pedido }: NewOrder) {
      try {
        return await db.$transaction(async (tx) => {
          const apagados = await tx.cartItem.deleteMany({ where: { userId: pedido.userId } });
          if (apagados.count !== cartItemCount) throw new CarrinhoMudou();

          return tx.order.create({ data: { ...pedido, items: { create: items } } });
        });
      } catch (erro) {
        if (erro instanceof CarrinhoMudou) return null;
        throw erro;
      }
    },

    listByUser: (userId: string) =>
      db.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { items: true } } },
      }),

    findOwned: (userId: string, id: string) =>
      db.order.findFirst({
        where: { id, userId },
        include: { items: { include: { product: { select: { name: true } } }, orderBy: { id: "asc" } } },
      }),
  };
}

export type OrderRepository = ReturnType<typeof createOrderRepository>;
