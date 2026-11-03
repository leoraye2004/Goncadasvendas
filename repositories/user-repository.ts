import type { PrismaClient, Role } from "@prisma/client";

export type NewUser = {
  name: string;
  email: string;
  cpf: string;
  birthDate: Date;
  passwordHash: string;
};

// Único lugar do cadastro/login que fala com o banco. Só busca e grava, sem regra de negócio.
// Os métodos devolvem o usuário mesmo se estiver apagado (deletedAt): quem decide é o service.
export function createUserRepository(db: PrismaClient) {
  return {
    findByEmail: (email: string) => db.user.findUnique({ where: { email } }),
    findByCpf: (cpf: string) => db.user.findUnique({ where: { cpf } }),
    findById: (id: string) => db.user.findUnique({ where: { id } }),
    create: (data: NewUser) => db.user.create({ data }),

    // Administração (UC09). Traz só o que a tela mostra: nada de CPF nem hash da senha.
    listActive: () =>
      db.user.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, email: true, role: true, _count: { select: { orders: true } } },
        orderBy: { name: "asc" },
      }),

    // Devolvem quantos usuários mudaram: 0 significa que não existe ou já foi apagado.
    setRole: async (id: string, role: Role) =>
      (await db.user.updateMany({ where: { id, deletedAt: null }, data: { role } })).count,

    // RN04: só preenche deletedAt. A linha continua no banco, então os pedidos continuam ligados ao usuário.
    softDelete: async (id: string) =>
      (await db.user.updateMany({ where: { id, deletedAt: null }, data: { deletedAt: new Date() } })).count,
  };
}

export type UserRepository = ReturnType<typeof createUserRepository>;
