import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import type { UserRepository } from "@/repositories/user-repository";
import { createAuthService } from "@/services/auth-service";

const CPF_VALIDO = "52998224725";

const cadastro = {
  name: "Ana Souza",
  email: "ana@example.com",
  cpf: CPF_VALIDO,
  birthDate: "1990-05-20",
  password: "senha1234",
};

function usuario(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    name: "Ana Souza",
    email: "ana@example.com",
    cpf: CPF_VALIDO,
    birthDate: new Date("1990-05-20T00:00:00Z"),
    passwordHash: "hash-que-nao-importa",
    role: "CUSTOMER",
    deletedAt: null,
    ...overrides,
  };
}

let repo: ReturnType<typeof mock<UserRepository>>;

beforeEach(() => {
  repo = mock<UserRepository>();
  repo.findByEmail.mockResolvedValue(null);
  repo.findByCpf.mockResolvedValue(null);
});

afterEach(() => vi.restoreAllMocks());

describe("register", () => {
  it("cadastra com sucesso e guarda a senha como hash bcrypt", async () => {
    repo.create.mockImplementation(async (data) => usuario({ ...data, id: "novo" }));

    const result = await createAuthService(repo).register(cadastro);

    expect(result).toMatchObject({ ok: true, user: { id: "novo", email: "ana@example.com", role: "CUSTOMER" } });
    const gravado = repo.create.mock.calls[0][0];
    expect(gravado.passwordHash).not.toBe("senha1234");
    expect(await bcrypt.compare("senha1234", gravado.passwordHash)).toBe(true);
  });

  it("recusa e-mail já cadastrado e não grava nada", async () => {
    repo.findByEmail.mockResolvedValue(usuario());

    const result = await createAuthService(repo).register(cadastro);

    expect(result).toEqual({ ok: false, code: "EMAIL_IN_USE", message: "E-mail já cadastrado" });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("recusa CPF já cadastrado e não grava nada", async () => {
    repo.findByCpf.mockResolvedValue(usuario({ email: "outra@example.com" }));

    const result = await createAuthService(repo).register(cadastro);

    expect(result).toEqual({ ok: false, code: "CPF_IN_USE", message: "CPF já cadastrado" });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("recusa CPF inválido sem consultar o banco", async () => {
    const result = await createAuthService(repo).register({ ...cadastro, cpf: "52998224726" });

    expect(result).toEqual({ ok: false, code: "INVALID", message: "CPF inválido" });
    expect(repo.findByEmail).not.toHaveBeenCalled();
  });

  it("recusa corpo que não é objeto (ex.: JSON quebrado)", async () => {
    const result = await createAuthService(repo).register(null);

    expect(result).toMatchObject({ ok: false, code: "INVALID" });
  });

  it("trata duas pessoas cadastrando o mesmo e-mail ao mesmo tempo (erro P2002 do banco)", async () => {
    repo.create.mockRejectedValue(Object.assign(new Error("unique"), { code: "P2002", meta: { target: ["email"] } }));

    const result = await createAuthService(repo).register(cadastro);

    expect(result).toMatchObject({ ok: false, code: "EMAIL_IN_USE" });
  });

  it("no P2002 do CPF, avisa que é o CPF", async () => {
    repo.create.mockRejectedValue(Object.assign(new Error("unique"), { code: "P2002", meta: { target: ["cpf"] } }));

    const result = await createAuthService(repo).register(cadastro);

    expect(result).toMatchObject({ ok: false, code: "CPF_IN_USE" });
  });

  it("deixa passar erros inesperados do banco", async () => {
    repo.create.mockRejectedValue(new Error("banco fora do ar"));

    await expect(createAuthService(repo).register(cadastro)).rejects.toThrow("banco fora do ar");
  });
});

describe("authenticate", () => {
  it("entra com e-mail e senha corretos", async () => {
    const passwordHash = await bcrypt.hash("senha1234", 10);
    repo.findByEmail.mockResolvedValue(usuario({ passwordHash, role: "ADMIN" }));

    const user = await createAuthService(repo).authenticate("ana@example.com", "senha1234");

    expect(user).toEqual({ id: "u1", name: "Ana Souza", email: "ana@example.com", role: "ADMIN" });
  });

  it("procura o e-mail sem espaços e em minúsculas", async () => {
    await createAuthService(repo).authenticate("  Ana@Example.COM ", "qualquer");

    expect(repo.findByEmail).toHaveBeenCalledWith("ana@example.com");
  });

  it("recusa senha errada", async () => {
    const passwordHash = await bcrypt.hash("senha1234", 10);
    repo.findByEmail.mockResolvedValue(usuario({ passwordHash }));

    expect(await createAuthService(repo).authenticate("ana@example.com", "errada123")).toBeNull();
  });

  it("recusa usuário apagado (deletedAt), mesmo com a senha certa", async () => {
    const passwordHash = await bcrypt.hash("senha1234", 10);
    repo.findByEmail.mockResolvedValue(usuario({ passwordHash, deletedAt: new Date() }));

    expect(await createAuthService(repo).authenticate("ana@example.com", "senha1234")).toBeNull();
  });
});

describe("authenticate: tempo de resposta igual para e-mail inexistente", () => {
  // Se só os e-mails que existem gastassem tempo no bcrypt, daria para descobrir quem tem
  // cadastro medindo a resposta. Por isso o bcrypt roda SEMPRE, com hash do mesmo custo.
  const custo = (hash: string) => Number(hash.split("$")[2]);

  it("e-mail inexistente também gasta uma comparação bcrypt, com custo 10", async () => {
    const compare = vi.spyOn(bcrypt, "compare");

    const user = await createAuthService(repo).authenticate("ninguem@example.com", "senha1234");

    expect(user).toBeNull();
    expect(compare).toHaveBeenCalledTimes(1);
    expect(custo(compare.mock.calls[0][1] as string)).toBe(10);
  });

  it("usuário apagado também gasta uma comparação bcrypt (não revela que existiu)", async () => {
    repo.findByEmail.mockResolvedValue(usuario({ deletedAt: new Date() }));
    const compare = vi.spyOn(bcrypt, "compare");

    await createAuthService(repo).authenticate("ana@example.com", "senha1234");

    expect(compare).toHaveBeenCalledTimes(1);
    expect(custo(compare.mock.calls[0][1] as string)).toBe(10);
  });

  it("senha errada gasta uma comparação, igual ao caso do e-mail inexistente", async () => {
    repo.findByEmail.mockResolvedValue(usuario({ passwordHash: await bcrypt.hash("outra", 10) }));
    const compare = vi.spyOn(bcrypt, "compare");

    await createAuthService(repo).authenticate("ana@example.com", "senha1234");

    expect(compare).toHaveBeenCalledTimes(1);
  });
});
