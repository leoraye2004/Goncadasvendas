import { beforeEach, describe, expect, it, vi } from "vitest";

const { currentActor, update, changePassword } = vi.hoisted(() => ({
  currentActor: vi.fn(),
  update: vi.fn(),
  changePassword: vi.fn(),
}));

vi.mock("@/lib/session", () => ({ currentActor }));
vi.mock("@/lib/profile", () => ({ profileService: { update, changePassword } }));

import { PUT as perfil } from "@/app/api/conta/perfil/route";
import { PUT as senha } from "@/app/api/conta/senha/route";

const ana = { id: "u1", role: "CUSTOMER" };
const put = (corpo: unknown) => new Request("http://localhost/api/conta", { method: "PUT", body: JSON.stringify(corpo) });
const lixo = () => new Request("http://localhost/api/conta", { method: "PUT", body: "nao e json" });

beforeEach(() => {
  vi.clearAllMocks();
  currentActor.mockResolvedValue(ana);
});

describe("PUT /api/conta/perfil", () => {
  it("atualiza o perfil do usuário logado e responde 200", async () => {
    update.mockResolvedValue({ ok: true, data: undefined });
    const corpo = { name: "Ana", email: "a@x.com", birthDate: "1990-01-01" };

    const resposta = await perfil(put(corpo));

    expect(resposta.status).toBe(200);
    expect(update).toHaveBeenCalledWith(ana, corpo);
  });

  it("sem login o service recusa e a rota responde 401", async () => {
    currentActor.mockResolvedValue(null);
    update.mockResolvedValue({ ok: false, code: "UNAUTHENTICATED", message: "Faça login para continuar" });

    expect((await perfil(put({}))).status).toBe(401);
    expect(update).toHaveBeenCalledWith(null, {});
  });

  it("e-mail repetido vira 409 e dado inválido vira 400", async () => {
    update.mockResolvedValueOnce({ ok: false, code: "CONFLICT", message: "E-mail já cadastrado" });
    expect((await perfil(put({}))).status).toBe(409);

    update.mockResolvedValueOnce({ ok: false, code: "INVALID", message: "E-mail inválido" });
    expect((await perfil(put({}))).status).toBe(400);
  });

  it("corpo que não é JSON vira objeto vazio", async () => {
    update.mockResolvedValue({ ok: false, code: "INVALID", message: "Informe o nome" });

    await perfil(lixo());

    expect(update).toHaveBeenCalledWith(ana, {});
  });
});

describe("PUT /api/conta/senha", () => {
  it("troca a senha e responde 200", async () => {
    changePassword.mockResolvedValue({ ok: true, data: undefined });
    const corpo = { currentPassword: "antiga123", newPassword: "nova12345" };

    const resposta = await senha(put(corpo));

    expect(resposta.status).toBe(200);
    expect(changePassword).toHaveBeenCalledWith(ana, corpo);
  });

  it("sem login o service recusa e a rota responde 401", async () => {
    currentActor.mockResolvedValue(null);
    changePassword.mockResolvedValue({ ok: false, code: "UNAUTHENTICATED", message: "Faça login para continuar" });

    expect((await senha(put({}))).status).toBe(401);
    expect(changePassword).toHaveBeenCalledWith(null, {});
  });

  it("senha atual errada responde 400 com a mensagem", async () => {
    changePassword.mockResolvedValue({ ok: false, code: "INVALID", message: "Senha atual incorreta" });

    const resposta = await senha(put({ currentPassword: "x", newPassword: "nova12345" }));

    expect(resposta.status).toBe(400);
    expect(await resposta.json()).toEqual({ error: "Senha atual incorreta" });
  });

  it("corpo que não é JSON vira objeto vazio", async () => {
    changePassword.mockResolvedValue({ ok: false, code: "INVALID", message: "Informe a senha atual" });

    await senha(lixo());

    expect(changePassword).toHaveBeenCalledWith(ana, {});
  });
});
