import { beforeEach, describe, expect, it, vi } from "vitest";

const { currentActor, create, update, remove } = vi.hoisted(() => ({
  currentActor: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/lib/session", () => ({ currentActor }));
vi.mock("@/lib/addresses", () => ({ addressService: { create, update, remove } }));

import { DELETE, PUT } from "@/app/api/enderecos/[id]/route";
import { POST } from "@/app/api/enderecos/route";

const cliente = { id: "u1", role: "CUSTOMER" };
const contexto = { params: Promise.resolve({ id: "a1" }) };
const dados = { cep: "89201-000", street: "Rua A", number: "1", district: "Centro", city: "Joinville", state: "SC" };
const json = (metodo: string, corpo: unknown) =>
  new Request("http://localhost/api/enderecos", { method: metodo, body: typeof corpo === "string" ? corpo : JSON.stringify(corpo) });

beforeEach(() => {
  vi.clearAllMocks();
  currentActor.mockResolvedValue(cliente);
});

describe("POST /api/enderecos", () => {
  it("cria para o usuário logado e responde 201 com o id", async () => {
    create.mockResolvedValue({ ok: true, data: { id: "a9" } });

    const resposta = await POST(json("POST", dados));

    expect(resposta.status).toBe(201);
    expect(await resposta.json()).toEqual({ id: "a9" });
    expect(create).toHaveBeenCalledWith(cliente, dados);
  });

  it("sem login responde 401", async () => {
    currentActor.mockResolvedValue(null);
    create.mockResolvedValue({ ok: false, code: "UNAUTHENTICATED", message: "Faça login para continuar" });

    expect((await POST(json("POST", dados))).status).toBe(401);
    expect(create).toHaveBeenCalledWith(null, dados);
  });

  it("dados inválidos respondem 400 com a mensagem", async () => {
    create.mockResolvedValue({ ok: false, code: "INVALID", message: "CEP inválido (use 8 números)" });

    const resposta = await POST(json("POST", { ...dados, cep: "1" }));

    expect(resposta.status).toBe(400);
    expect(await resposta.json()).toEqual({ error: "CEP inválido (use 8 números)" });
  });

  it("corpo que não é JSON não quebra a rota", async () => {
    create.mockResolvedValue({ ok: false, code: "INVALID", message: "Informe a rua" });

    expect((await POST(json("POST", "isso não é json"))).status).toBe(400);
    expect(create).toHaveBeenCalledWith(cliente, null);
  });
});

describe("PUT /api/enderecos/[id]", () => {
  it("altera o endereço", async () => {
    update.mockResolvedValue({ ok: true, data: undefined });

    expect((await PUT(json("PUT", dados), contexto)).status).toBe(200);
    expect(update).toHaveBeenCalledWith(cliente, "a1", dados);
  });

  it("endereço de outro usuário responde 404", async () => {
    update.mockResolvedValue({ ok: false, code: "NOT_FOUND", message: "Endereço não encontrado" });

    expect((await PUT(json("PUT", dados), contexto)).status).toBe(404);
  });
});

describe("DELETE /api/enderecos/[id]", () => {
  it("remove o endereço", async () => {
    remove.mockResolvedValue({ ok: true, data: undefined });

    expect((await DELETE(new Request("http://localhost/x", { method: "DELETE" }), contexto)).status).toBe(200);
    expect(remove).toHaveBeenCalledWith(cliente, "a1");
  });

  it("endereço de outro usuário responde 404", async () => {
    remove.mockResolvedValue({ ok: false, code: "NOT_FOUND", message: "Endereço não encontrado" });

    expect((await DELETE(new Request("http://localhost/x", { method: "DELETE" }), contexto)).status).toBe(404);
  });
});
