import { beforeEach, describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { UserRepository } from "@/repositories/user-repository";
import { createUserService } from "@/services/user-service";

const admin = { id: "a1", role: "ADMIN" } as const;
const cliente = { id: "c1", role: "CUSTOMER" } as const;

const usuario = (id: string, over: Record<string, unknown> = {}) =>
  ({ id, name: "Ana", email: `${id}@x.com`, role: "CUSTOMER", _count: { orders: 2 }, ...over }) as never;

let users: ReturnType<typeof mock<UserRepository>>;
let service: ReturnType<typeof createUserService>;

beforeEach(() => {
  users = mock<UserRepository>();
  users.setRole.mockResolvedValue(1);
  users.softDelete.mockResolvedValue(1);
  service = createUserService(users);
});

describe("RN05 — só ADMIN administra usuários", () => {
  it.each([
    ["list", () => service.list(cliente)],
    ["setRole", () => service.setRole(cliente, "u2", "ADMIN")],
    ["remove", () => service.remove(cliente, "u2")],
  ])("%s por cliente comum devolve FORBIDDEN e não toca no banco", async (_nome, chamar) => {
    expect(await chamar()).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(users.listActive).not.toHaveBeenCalled();
    expect(users.setRole).not.toHaveBeenCalled();
    expect(users.softDelete).not.toHaveBeenCalled();
  });
});

describe("userService.list", () => {
  it("lista os usuários ativos com a quantidade de pedidos, sem dados sensíveis", async () => {
    users.listActive.mockResolvedValue([usuario("u1", { passwordHash: "segredo", cpf: "123" })]);

    const resultado = await service.list(admin);

    expect(resultado).toEqual({
      ok: true,
      data: [{ id: "u1", name: "Ana", email: "u1@x.com", role: "CUSTOMER", orders: 2 }],
    });
  });
});

describe("userService.setRole", () => {
  it("troca o papel de outro usuário", async () => {
    expect((await service.setRole(admin, "u2", "ADMIN")).ok).toBe(true);
    expect(users.setRole).toHaveBeenCalledWith("u2", "ADMIN");
  });

  it("recusa papel que não existe", async () => {
    expect(await service.setRole(admin, "u2", "SUPER")).toMatchObject({ ok: false, code: "INVALID" });
    expect(users.setRole).not.toHaveBeenCalled();
  });

  it("o admin não pode mudar o próprio papel (evita ficar sem admin)", async () => {
    expect(await service.setRole(admin, "a1", "CUSTOMER")).toMatchObject({ ok: false, code: "INVALID" });
    expect(users.setRole).not.toHaveBeenCalled();
  });

  it("usuário inexistente ou já apagado vira NOT_FOUND", async () => {
    users.setRole.mockResolvedValue(0);

    expect(await service.setRole(admin, "u2", "ADMIN")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});

describe("userService.remove (RN04 — soft delete)", () => {
  it("marca o usuário como apagado (deletedAt) em vez de excluir a linha", async () => {
    expect((await service.remove(admin, "u2")).ok).toBe(true);
    expect(users.softDelete).toHaveBeenCalledWith("u2");
  });

  it("não existe operação de apagar de verdade, então os pedidos continuam ligados ao usuário", () => {
    expect(Object.keys(users).filter((nome) => /^(delete|remove)$/.test(nome))).toEqual([]);
    expect(Object.keys(service).sort((a, b) => a.localeCompare(b))).toEqual(["list", "remove", "setRole"]);
  });

  it("o admin não pode apagar a própria conta", async () => {
    expect(await service.remove(admin, "a1")).toMatchObject({ ok: false, code: "INVALID" });
    expect(users.softDelete).not.toHaveBeenCalled();
  });

  it("usuário inexistente ou já apagado vira NOT_FOUND", async () => {
    users.softDelete.mockResolvedValue(0);

    expect(await service.remove(admin, "u2")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});
