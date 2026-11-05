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

  it("findById busca pelo id", async () => {
    const db = mockDeep<PrismaClient>();

    await createUserRepository(db).findById("u1");

    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { id: "u1" } });
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

  it("listActive traz só os não apagados, com a contagem de pedidos e só os campos necessários", async () => {
    const db = mockDeep<PrismaClient>();

    await createUserRepository(db).listActive();

    expect(db.user.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      select: { id: true, name: true, email: true, role: true, _count: { select: { orders: true } } },
      orderBy: { name: "asc" },
    });
  });

  it("setRole só muda usuário não apagado e devolve quantos mudou", async () => {
    const db = mockDeep<PrismaClient>();
    db.user.updateMany.mockResolvedValue({ count: 1 });

    expect(await createUserRepository(db).setRole("u1", "ADMIN")).toBe(1);
    expect(db.user.updateMany).toHaveBeenCalledWith({ where: { id: "u1", deletedAt: null }, data: { role: "ADMIN" } });
  });

  it("softDelete grava deletedAt (nunca apaga a linha, então os pedidos ficam)", async () => {
    const db = mockDeep<PrismaClient>();
    db.user.updateMany.mockResolvedValue({ count: 1 });

    expect(await createUserRepository(db).softDelete("u1")).toBe(1);
    expect(db.user.updateMany).toHaveBeenCalledWith({
      where: { id: "u1", deletedAt: null },
      data: { deletedAt: expect.any(Date) },
    });
    expect(db.user.delete).not.toHaveBeenCalled();
    expect(db.user.deleteMany).not.toHaveBeenCalled();
  });
});

describe("userRepository — perfil", () => {
  it("updateProfile muda nome, e-mail e nascimento só de usuário não apagado e devolve quantos mudou", async () => {
    const db = mockDeep<PrismaClient>();
    db.user.updateMany.mockResolvedValue({ count: 1 });
    const dados = { name: "Ana", email: "ana@x.com", birthDate: new Date("1990-05-20T00:00:00Z") };

    expect(await createUserRepository(db).updateProfile("u1", dados)).toBe(1);
    expect(db.user.updateMany).toHaveBeenCalledWith({ where: { id: "u1", deletedAt: null }, data: dados });
  });

  it("setPasswordHash grava só o hash, de usuário não apagado", async () => {
    const db = mockDeep<PrismaClient>();
    db.user.updateMany.mockResolvedValue({ count: 1 });

    expect(await createUserRepository(db).setPasswordHash("u1", "hash-novo")).toBe(1);
    expect(db.user.updateMany).toHaveBeenCalledWith({
      where: { id: "u1", deletedAt: null },
      data: { passwordHash: "hash-novo" },
    });
  });
});
