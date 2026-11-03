import { beforeEach, describe, expect, it, vi } from "vitest";

const { currentActor, setRole, remove } = vi.hoisted(() => ({ currentActor: vi.fn(), setRole: vi.fn(), remove: vi.fn() }));

vi.mock("@/lib/session", () => ({ currentActor }));
vi.mock("@/lib/users", () => ({ userService: { setRole, remove } }));

import { DELETE, PATCH } from "@/app/api/admin/usuarios/[id]/route";

const admin = { id: "a1", role: "ADMIN" };
const contexto = { params: Promise.resolve({ id: "u2" }) };
const patch = (corpo: unknown) =>
  new Request("http://localhost/api/admin/usuarios/u2", { method: "PATCH", body: JSON.stringify(corpo) });
const apagar = () => new Request("http://localhost/api/admin/usuarios/u2", { method: "DELETE" });

beforeEach(() => {
  vi.clearAllMocks();
  currentActor.mockResolvedValue(admin);
});

describe("PATCH /api/admin/usuarios/[id]", () => {
  it("troca o papel e responde 200", async () => {
    setRole.mockResolvedValue({ ok: true, data: undefined });

    const resposta = await PATCH(patch({ role: "ADMIN" }), contexto);

    expect(resposta.status).toBe(200);
    expect(setRole).toHaveBeenCalledWith(admin, "u2", "ADMIN");
  });

  it("responde 401 sem login e não chama o service", async () => {
    currentActor.mockResolvedValue(null);

    expect((await PATCH(patch({ role: "ADMIN" }), contexto)).status).toBe(401);
    expect(setRole).not.toHaveBeenCalled();
  });

  it("responde 403 quando o service diz que não é admin", async () => {
    setRole.mockResolvedValue({ ok: false, code: "FORBIDDEN", message: "Apenas administradores" });

    expect((await PATCH(patch({ role: "ADMIN" }), contexto)).status).toBe(403);
  });

  it("corpo que não é JSON vira papel indefinido e o service responde 400", async () => {
    setRole.mockResolvedValue({ ok: false, code: "INVALID", message: "Papel inválido" });

    const resposta = await PATCH(new Request("http://localhost/x", { method: "PATCH", body: "nao e json" }), contexto);

    expect(resposta.status).toBe(400);
    expect(setRole).toHaveBeenCalledWith(admin, "u2", undefined);
  });
});

describe("DELETE /api/admin/usuarios/[id]", () => {
  it("apaga (soft delete) e responde 200", async () => {
    remove.mockResolvedValue({ ok: true, data: undefined });

    const resposta = await DELETE(apagar(), contexto);

    expect(resposta.status).toBe(200);
    expect(remove).toHaveBeenCalledWith(admin, "u2");
  });

  it("responde 401 sem login", async () => {
    currentActor.mockResolvedValue(null);

    expect((await DELETE(apagar(), contexto)).status).toBe(401);
    expect(remove).not.toHaveBeenCalled();
  });

  it("responde 404 quando o usuário não existe", async () => {
    remove.mockResolvedValue({ ok: false, code: "NOT_FOUND", message: "Usuário não encontrado" });

    expect((await DELETE(apagar(), contexto)).status).toBe(404);
  });
});
