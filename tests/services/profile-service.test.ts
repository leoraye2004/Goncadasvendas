import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { UserRepository } from "@/repositories/user-repository";
import { createProfileService } from "@/services/profile-service";

const ana = { id: "u1", role: "CUSTOMER" } as const;
const dados = { name: "  Ana Souza ", email: "ANA.Nova@Example.com ", birthDate: "1990-05-20" };

const usuario = (over: Record<string, unknown> = {}) =>
  ({
    id: "u1",
    name: "Ana",
    email: "ana@example.com",
    cpf: "52998224725",
    birthDate: new Date("1990-05-20T00:00:00Z"),
    passwordHash: "x",
    role: "CUSTOMER",
    deletedAt: null,
    ...over,
  }) as never;

let users: ReturnType<typeof mock<UserRepository>>;
let service: ReturnType<typeof createProfileService>;

beforeEach(() => {
  users = mock<UserRepository>();
  users.findById.mockResolvedValue(usuario());
  users.findByEmail.mockResolvedValue(null);
  users.updateProfile.mockResolvedValue(1);
  users.setPasswordHash.mockResolvedValue(1);
  service = createProfileService(users);
});

describe("RN01 — perfil só para usuário autenticado", () => {
  it.each([
    ["get", () => service.get(null)],
    ["update", () => service.update(null, dados)],
    ["changePassword", () => service.changePassword(null, { currentPassword: "a", newPassword: "senha1234" })],
  ])("%s sem login devolve UNAUTHENTICATED e não toca no banco", async (_nome, chamar) => {
    expect(await chamar()).toMatchObject({ ok: false, code: "UNAUTHENTICATED" });
    expect(users.findById).not.toHaveBeenCalled();
    expect(users.updateProfile).not.toHaveBeenCalled();
    expect(users.setPasswordHash).not.toHaveBeenCalled();
  });
});

describe("profileService.get", () => {
  it("devolve nome, e-mail e data de nascimento (AAAA-MM-DD), sem CPF nem hash", async () => {
    expect(await service.get(ana)).toEqual({
      ok: true,
      data: { name: "Ana", email: "ana@example.com", birthDate: "1990-05-20" },
    });
    expect(users.findById).toHaveBeenCalledWith("u1");
  });

  it("usuário apagado ou inexistente vira NOT_FOUND", async () => {
    users.findById.mockResolvedValueOnce(usuario({ deletedAt: new Date() }));
    expect(await service.get(ana)).toMatchObject({ ok: false, code: "NOT_FOUND" });

    users.findById.mockResolvedValueOnce(null);
    expect(await service.get(ana)).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});

describe("profileService.update", () => {
  it("grava nome sem espaços, e-mail em minúsculas e data, usando o id do Actor", async () => {
    expect((await service.update(ana, dados)).ok).toBe(true);
    expect(users.updateProfile).toHaveBeenCalledWith("u1", {
      name: "Ana Souza",
      email: "ana.nova@example.com",
      birthDate: new Date("1990-05-20T00:00:00Z"),
    });
  });

  it("recusa dados inválidos com a mensagem do Zod", async () => {
    for (const ruim of [{ ...dados, name: " " }, { ...dados, email: "sem-arroba" }, { ...dados, birthDate: "2999-01-01" }]) {
      expect(await service.update(ana, ruim)).toMatchObject({ ok: false, code: "INVALID" });
    }
    expect(users.updateProfile).not.toHaveBeenCalled();
  });

  it("ignora campos extras como role e cpf (não dá para se promover pelo perfil)", async () => {
    await service.update(ana, { ...dados, role: "ADMIN", cpf: "11144477735" });

    expect(users.updateProfile).toHaveBeenCalledWith("u1", expect.not.objectContaining({ role: expect.anything() }));
    expect(users.updateProfile).toHaveBeenCalledWith("u1", expect.not.objectContaining({ cpf: expect.anything() }));
  });

  it("RN06: e-mail de outra pessoa vira CONFLICT", async () => {
    users.findByEmail.mockResolvedValue(usuario({ id: "u2" }));

    expect(await service.update(ana, dados)).toMatchObject({ ok: false, code: "CONFLICT" });
    expect(users.updateProfile).not.toHaveBeenCalled();
  });

  it("manter o próprio e-mail não é conflito", async () => {
    users.findByEmail.mockResolvedValue(usuario({ id: "u1" }));

    expect((await service.update(ana, dados)).ok).toBe(true);
  });

  it("RN06: corrida entre dois pedidos (erro P2002 do banco) também vira CONFLICT", async () => {
    users.updateProfile.mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));

    expect(await service.update(ana, dados)).toMatchObject({ ok: false, code: "CONFLICT" });
  });

  it("outros erros do banco continuam sendo erros", async () => {
    users.updateProfile.mockRejectedValue(new Error("banco fora do ar"));

    await expect(service.update(ana, dados)).rejects.toThrow("banco fora do ar");
  });

  it("usuário apagado no meio do caminho vira NOT_FOUND", async () => {
    users.updateProfile.mockResolvedValue(0);

    expect(await service.update(ana, dados)).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});

describe("profileService.changePassword", () => {
  let hashAtual: string;

  beforeEach(async () => {
    hashAtual = await bcrypt.hash("senhaAntiga1", 4);
    users.findById.mockResolvedValue(usuario({ passwordHash: hashAtual }));
  });

  it("com a senha atual certa, grava o HASH da nova (nunca a senha pura)", async () => {
    const resultado = await service.changePassword(ana, { currentPassword: "senhaAntiga1", newPassword: "novaSenha99" });

    expect(resultado.ok).toBe(true);
    const [id, hash] = users.setPasswordHash.mock.calls[0];
    expect(id).toBe("u1");
    expect(hash).not.toBe("novaSenha99");
    expect(await bcrypt.compare("novaSenha99", hash)).toBe(true);
  });

  it("senha atual errada é rejeitada e nada é gravado", async () => {
    const resultado = await service.changePassword(ana, { currentPassword: "errada123", newPassword: "novaSenha99" });

    expect(resultado).toMatchObject({ ok: false, code: "INVALID", message: "Senha atual incorreta" });
    expect(users.setPasswordHash).not.toHaveBeenCalled();
  });

  it("recusa nova senha curta, longa demais ou igual à atual", async () => {
    for (const nova of ["curta", "a".repeat(73), "senhaAntiga1"]) {
      expect(await service.changePassword(ana, { currentPassword: "senhaAntiga1", newPassword: nova })).toMatchObject({
        ok: false,
        code: "INVALID",
      });
    }
    expect(users.setPasswordHash).not.toHaveBeenCalled();
  });

  it("recusa corpo sem a senha atual ou sem a nova, com mensagem em português", async () => {
    expect(await service.changePassword(ana, { newPassword: "novaSenha99" })).toMatchObject({
      ok: false,
      code: "INVALID",
      message: "Informe a senha atual",
    });
    expect(await service.changePassword(ana, { currentPassword: "senhaAntiga1" })).toMatchObject({
      ok: false,
      code: "INVALID",
      message: "Informe a senha",
    });
    expect(await service.changePassword(ana, undefined)).toMatchObject({ ok: false, code: "INVALID" });
  });

  it("usuário apagado ou inexistente vira NOT_FOUND", async () => {
    users.findById.mockResolvedValue(null);

    expect(
      await service.changePassword(ana, { currentPassword: "senhaAntiga1", newPassword: "novaSenha99" }),
    ).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("usuário apagado no meio do caminho (0 linhas) vira NOT_FOUND", async () => {
    users.setPasswordHash.mockResolvedValue(0);

    expect(
      await service.changePassword(ana, { currentPassword: "senhaAntiga1", newPassword: "novaSenha99" }),
    ).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});
