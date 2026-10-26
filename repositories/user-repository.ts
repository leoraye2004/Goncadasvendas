import type { PrismaClient } from "@prisma/client";

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
    create: (data: NewUser) => db.user.create({ data }),
  };
}

export type UserRepository = ReturnType<typeof createUserRepository>;
