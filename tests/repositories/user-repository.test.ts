import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { createUserRepository } from "@/repositories/user-repository";

describe("userRepository", () => {
  it("findByEmail busca pelo e-mail", async () => {
    const db = mockDeep<PrismaClient>();
    db.user.findUnique.mockResolvedValue(null);

    await createUserRepository(db).findByEmail("ana@example.com");

    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { email: "ana@example.com" } });
  });

  it("findByCpf busca pelo CPF", async () => {
    const db = mockDeep<PrismaClient>();
    db.user.findUnique.mockResolvedValue(null);

    await createUserRepository(db).findByCpf("52998224725");

    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { cpf: "52998224725" } });
  });

  it("create grava os dados recebidos", async () => {
    const db = mockDeep<PrismaClient>();
    const novo = {
      name: "Ana",
      email: "ana@example.com",
      cpf: "52998224725",
      birthDate: new Date("1990-05-20T00:00:00Z"),
      passwordHash: "hash",
    };

    await createUserRepository(db).create(novo);

    expect(db.user.create).toHaveBeenCalledWith({ data: novo });
  });
});
