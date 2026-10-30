import type { PrismaClient } from "@prisma/client";
import type { AddressInput } from "@/lib/validation/address";

// Único lugar dos endereços que fala com o banco. Todo acesso filtra pelo userId: ninguém vê ou muda o endereço dos outros.
export function createAddressRepository(db: PrismaClient) {
  return {
    list: (userId: string) => db.address.findMany({ where: { userId }, orderBy: { id: "asc" } }),

    findOwned: (userId: string, id: string) => db.address.findFirst({ where: { id, userId } }),

    create: (userId: string, dados: AddressInput) => db.address.create({ data: { ...dados, userId } }),

    // Devolvem quantos endereços mudaram: 0 significa que não existe ou é de outro usuário.
    update: async (userId: string, id: string, dados: AddressInput) =>
      (await db.address.updateMany({ where: { id, userId }, data: dados })).count,

    // Pedidos antigos continuam intactos: o pedido guarda uma cópia do endereço e o vínculo vira nulo.
    remove: async (userId: string, id: string) => (await db.address.deleteMany({ where: { id, userId } })).count,
  };
}

export type AddressRepository = ReturnType<typeof createAddressRepository>;
