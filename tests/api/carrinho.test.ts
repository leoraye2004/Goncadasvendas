import { beforeEach, describe, expect, it, vi } from "vitest";

const { currentActor, add, setQuantity, remove, clear } = vi.hoisted(() => ({
  currentActor: vi.fn(),
  add: vi.fn(),
  setQuantity: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
}));

vi.mock("@/lib/session", () => ({ currentActor }));
vi.mock("@/lib/cart", () => ({ cartService: { add, setQuantity, remove, clear } }));

import { DELETE as limpar, POST } from "@/app/api/carrinho/route";
import { DELETE as excluir, PATCH } from "@/app/api/carrinho/[id]/route";

const cliente = { id: "u1", role: "CUSTOMER" };
const contexto = { params: Promise.resolve({ id: "i1" }) };
const json = (metodo: string, corpo: unknown) =>
  new Request("http://localhost/api/carrinho", { method: metodo, body: JSON.stringify(corpo) });

beforeEach(() => {
  vi.clearAllMocks();
  currentActor.mockResolvedValue(cliente);
});

describe("POST /api/carrinho", () => {
  it("adiciona o produto para o usuário logado e responde 201", async () => {
    add.mockResolvedValue({ ok: true, data: undefined });

    const resposta = await POST(json("POST", { productId: "p1", quantity: 2 }));

    expect(resposta.status).toBe(201);
    expect(add).toHaveBeenCalledWith(cliente, "p1", 2);
  });

  it("sem login o service recusa e a rota responde 401", async () => {
    currentActor.mockResolvedValue(null);
    add.mockResolvedValue({ ok: false, code: "UNAUTHENTICATED", message: "Faça login para usar o carrinho" });

    const resposta = await POST(json("POST", { productId: "p1", quantity: 1 }));

    expect(resposta.status).toBe(401);
    expect(add).toHaveBeenCalledWith(null, "p1", 1);
  });

  it("corpo que não é JSON vira pedido inválido, sem quebrar", async () => {
    add.mockResolvedValue({ ok: false, code: "INVALID", message: "Informe uma quantidade" });

    const resposta = await POST(new Request("http://localhost/api/carrinho", { method: "POST", body: "isso não é json" }));

    expect(resposta.status).toBe(400);
    expect(add).toHaveBeenCalledWith(cliente, "", undefined);
  });

  it("produto que não pode ser comprado responde 404", async () => {
    add.mockResolvedValue({ ok: false, code: "NOT_FOUND", message: "Produto não encontrado" });

    expect((await POST(json("POST", { productId: "x", quantity: 1 }))).status).toBe(404);
  });
});

describe("DELETE /api/carrinho", () => {
  it("esvazia o carrinho do usuário", async () => {
    clear.mockResolvedValue({ ok: true, data: undefined });

    const resposta = await limpar();

    expect(resposta.status).toBe(200);
    expect(clear).toHaveBeenCalledWith(cliente);
  });

  it("sem login responde 401", async () => {
    currentActor.mockResolvedValue(null);
    clear.mockResolvedValue({ ok: false, code: "UNAUTHENTICATED", message: "Faça login" });

    expect((await limpar()).status).toBe(401);
  });
});

describe("PATCH /api/carrinho/[id]", () => {
  it("altera a quantidade do item", async () => {
    setQuantity.mockResolvedValue({ ok: true, data: undefined });

    const resposta = await PATCH(json("PATCH", { quantity: 5 }), contexto);

    expect(resposta.status).toBe(200);
    expect(setQuantity).toHaveBeenCalledWith(cliente, "i1", 5);
  });

  it("quantidade inválida responde 400 com a mensagem", async () => {
    setQuantity.mockResolvedValue({ ok: false, code: "INVALID", message: "Quantidade inválida" });

    const resposta = await PATCH(json("PATCH", { quantity: 0 }), contexto);

    expect(resposta.status).toBe(400);
    expect(await resposta.json()).toEqual({ error: "Quantidade inválida" });
  });

  it("corpo que não é JSON não quebra a rota", async () => {
    setQuantity.mockResolvedValue({ ok: false, code: "INVALID", message: "Quantidade inválida" });

    const resposta = await PATCH(new Request("http://localhost/x", { method: "PATCH", body: "{" }), contexto);

    expect(resposta.status).toBe(400);
    expect(setQuantity).toHaveBeenCalledWith(cliente, "i1", undefined);
  });
});

describe("DELETE /api/carrinho/[id]", () => {
  it("remove o item", async () => {
    remove.mockResolvedValue({ ok: true, data: undefined });

    expect((await excluir(new Request("http://localhost/x", { method: "DELETE" }), contexto)).status).toBe(200);
    expect(remove).toHaveBeenCalledWith(cliente, "i1");
  });

  it("item de outro usuário responde 404", async () => {
    remove.mockResolvedValue({ ok: false, code: "NOT_FOUND", message: "Item não encontrado no carrinho" });

    expect((await excluir(new Request("http://localhost/x", { method: "DELETE" }), contexto)).status).toBe(404);
  });
});
