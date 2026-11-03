import { beforeEach, describe, expect, it, vi } from "vitest";

const { currentActor, add, remove } = vi.hoisted(() => ({ currentActor: vi.fn(), add: vi.fn(), remove: vi.fn() }));

vi.mock("@/lib/session", () => ({ currentActor }));
vi.mock("@/lib/favorites", () => ({ favoriteService: { add, remove } }));

import { POST } from "@/app/api/favoritos/route";
import { DELETE } from "@/app/api/favoritos/[productId]/route";

const cliente = { id: "u1", role: "CUSTOMER" };
const json = (corpo: unknown) => new Request("http://localhost/api/favoritos", { method: "POST", body: JSON.stringify(corpo) });
const contexto = { params: Promise.resolve({ productId: "p1" }) };
const apagar = () => new Request("http://localhost/api/favoritos/p1", { method: "DELETE" });

beforeEach(() => {
  vi.clearAllMocks();
  currentActor.mockResolvedValue(cliente);
});

describe("POST /api/favoritos", () => {
  it("favorita o produto para o usuário logado e responde 201", async () => {
    add.mockResolvedValue({ ok: true, data: undefined });

    const resposta = await POST(json({ productId: "p1" }));

    expect(resposta.status).toBe(201);
    expect(add).toHaveBeenCalledWith(cliente, "p1");
  });

  it("sem login o service recusa e a rota responde 401", async () => {
    currentActor.mockResolvedValue(null);
    add.mockResolvedValue({ ok: false, code: "UNAUTHENTICATED", message: "Faça login para continuar" });

    expect((await POST(json({ productId: "p1" }))).status).toBe(401);
    expect(add).toHaveBeenCalledWith(null, "p1");
  });

  it("corpo que não é JSON vira productId vazio e o service responde 404", async () => {
    add.mockResolvedValue({ ok: false, code: "NOT_FOUND", message: "Produto não encontrado" });

    const resposta = await POST(new Request("http://localhost/api/favoritos", { method: "POST", body: "nao e json" }));

    expect(resposta.status).toBe(404);
    expect(add).toHaveBeenCalledWith(cliente, "");
  });
});

describe("DELETE /api/favoritos/[productId]", () => {
  it("desfavorita e responde 200", async () => {
    remove.mockResolvedValue({ ok: true, data: undefined });

    const resposta = await DELETE(apagar(), contexto);

    expect(resposta.status).toBe(200);
    expect(remove).toHaveBeenCalledWith(cliente, "p1");
  });

  it("sem login responde 401", async () => {
    currentActor.mockResolvedValue(null);
    remove.mockResolvedValue({ ok: false, code: "UNAUTHENTICATED", message: "Faça login para continuar" });

    expect((await DELETE(apagar(), contexto)).status).toBe(401);
  });
});
