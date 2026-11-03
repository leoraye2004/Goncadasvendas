import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { createAddressRepository } from "@/repositories/address-repository";

const dados = { cep: "89201-000", street: "Rua A", number: "1", district: "Centro", city: "Joinville", state: "SC" };

function setup() {
  const db = mockDeep<PrismaClient>();
  return { db, repo: createAddressRepository(db) };
}

describe("addressRepository", () => {
  it("list traz só os endereços do usuário", async () => {
    const { db, repo } = setup();

    await repo.list("u1");

    expect(db.address.findMany).toHaveBeenCalledWith({ where: { userId: "u1" }, orderBy: { id: "asc" } });
  });

  it("findOwned procura pelo id E pelo usuário", async () => {
    const { db, repo } = setup();

    await repo.findOwned("u1", "a1");

    expect(db.address.findFirst).toHaveBeenCalledWith({ where: { id: "a1", userId: "u1" } });
  });

  it("create grava o endereço ligado ao usuário", async () => {
    const { db, repo } = setup();

    await repo.create("u1", dados);

    expect(db.address.create).toHaveBeenCalledWith({ data: { ...dados, userId: "u1" } });
  });

  it("update só altera endereço do usuário e devolve quantos mudaram", async () => {
    const { db, repo } = setup();
    db.address.updateMany.mockResolvedValue({ count: 1 });

    expect(await repo.update("u1", "a1", dados)).toBe(1);
    expect(db.address.updateMany).toHaveBeenCalledWith({ where: { id: "a1", userId: "u1" }, data: dados });
  });

  it("remove só apaga endereço do usuário e devolve quantos apagou", async () => {
    const { db, repo } = setup();
    db.address.deleteMany.mockResolvedValue({ count: 0 });

    expect(await repo.remove("u1", "a1")).toBe(0);
    expect(db.address.deleteMany).toHaveBeenCalledWith({ where: { id: "a1", userId: "u1" } });
  });
});
