import { beforeEach, describe, expect, it, vi } from "vitest";

const { currentActor, setStatus } = vi.hoisted(() => ({ currentActor: vi.fn(), setStatus: vi.fn() }));

vi.mock("@/lib/session", () => ({ currentActor }));
vi.mock("@/lib/admin-orders", () => ({ adminOrderService: { setStatus } }));

import { PATCH } from "@/app/api/admin/pedidos/[id]/route";

const admin = { id: "a1", role: "ADMIN" };
const contexto = { params: Promise.resolve({ id: "o1" }) };
const patch = (corpo: unknown) =>
  new Request("http://localhost/api/admin/pedidos/o1", { method: "PATCH", body: JSON.stringify(corpo) });

beforeEach(() => {
  vi.clearAllMocks();
  currentActor.mockResolvedValue(admin);
});

describe("PATCH /api/admin/pedidos/[id]", () => {
  it("muda o status e responde 200", async () => {
    setStatus.mockResolvedValue({ ok: true, data: undefined });

    const resposta = await PATCH(patch({ status: "CONFIRMED" }), contexto);

    expect(resposta.status).toBe(200);
    expect(setStatus).toHaveBeenCalledWith(admin, "o1", "CONFIRMED");
  });

  it("responde 401 sem login e não chama o service", async () => {
    currentActor.mockResolvedValue(null);

    expect((await PATCH(patch({ status: "CONFIRMED" }), contexto)).status).toBe(401);
    expect(setStatus).not.toHaveBeenCalled();
  });

  it("responde 403 quando não é admin", async () => {
    setStatus.mockResolvedValue({ ok: false, code: "FORBIDDEN", message: "Apenas administradores" });

    expect((await PATCH(patch({ status: "CONFIRMED" }), contexto)).status).toBe(403);
  });

  it("responde 400 em transição inválida e 404 em pedido inexistente", async () => {
    setStatus.mockResolvedValueOnce({ ok: false, code: "INVALID", message: "Transição inválida" });
    expect((await PATCH(patch({ status: "DELIVERED" }), contexto)).status).toBe(400);

    setStatus.mockResolvedValueOnce({ ok: false, code: "NOT_FOUND", message: "Pedido não encontrado" });
    expect((await PATCH(patch({ status: "CONFIRMED" }), contexto)).status).toBe(404);
  });

  it("corpo que não é JSON vira status indefinido", async () => {
    setStatus.mockResolvedValue({ ok: false, code: "INVALID", message: "Status inválido" });

    await PATCH(new Request("http://localhost/x", { method: "PATCH", body: "nao e json" }), contexto);

    expect(setStatus).toHaveBeenCalledWith(admin, "o1", undefined);
  });
});
