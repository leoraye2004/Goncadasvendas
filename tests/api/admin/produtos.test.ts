import { beforeEach, describe, expect, it, vi } from "vitest";

const { currentActor, create, update, remove } = vi.hoisted(() => ({
  currentActor: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/lib/session", () => ({ currentActor }));
vi.mock("@/lib/products", () => ({ productService: { create, update, remove } }));

import { DELETE, PUT } from "@/app/api/admin/produtos/[id]/route";
import { POST } from "@/app/api/admin/produtos/route";

const admin = { id: "a1", role: "ADMIN" };

function pedido(metodo: string, campos: Record<string, string> = {}, ids: string[] = []) {
  const form = new FormData();
  for (const [k, v] of Object.entries(campos)) form.set(k, v);
  for (const id of ids) form.append("removeImageIds", id);
  form.append("imagens", new File([new Uint8Array([1])], "a.png", { type: "image/png" }));
  return new Request("http://localhost/api/admin/produtos", { method: metodo, body: form });
}

const contexto = { params: Promise.resolve({ id: "p1" }) };

beforeEach(() => {
  vi.clearAllMocks();
  currentActor.mockResolvedValue(admin);
});

describe("POST /api/admin/produtos", () => {
  it("cria o produto e responde 201 com o id", async () => {
    create.mockResolvedValue({ ok: true, data: { id: "p9" } });

    const resposta = await POST(pedido("POST", { name: "Boné", category: "Acessórios", price: "39,90" }));

    expect(resposta.status).toBe(201);
    expect(await resposta.json()).toEqual({ id: "p9" });
    const [ator, campos, arquivos] = create.mock.calls[0];
    expect(ator).toEqual(admin);
    expect(campos).toEqual({ name: "Boné", category: "Acessórios", brand: "", price: "39,90" });
    expect(arquivos).toHaveLength(1);
  });

  it("responde 401 sem login e não chama o service", async () => {
    currentActor.mockResolvedValue(null);

    const resposta = await POST(pedido("POST"));

    expect(resposta.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it("traduz a falha do service em status HTTP", async () => {
    create.mockResolvedValue({ ok: false, code: "INVALID", message: "O preço deve ser maior que zero" });

    const resposta = await POST(pedido("POST", { name: "Boné", category: "Acessórios", price: "0" }));

    expect(resposta.status).toBe(400);
    expect(await resposta.json()).toEqual({ error: "O preço deve ser maior que zero" });
  });
});

describe("PUT /api/admin/produtos/[id]", () => {
  it("atualiza com as imagens novas e as marcadas para remover", async () => {
    update.mockResolvedValue({ ok: true, data: { id: "p1" } });

    const resposta = await PUT(pedido("PUT", { name: "Boné", category: "Acessórios", price: "39,90" }, ["i1"]), contexto);

    expect(resposta.status).toBe(200);
    const [, id, , arquivos, remover] = update.mock.calls[0];
    expect(id).toBe("p1");
    expect(arquivos).toHaveLength(1);
    expect(remover).toEqual(["i1"]);
  });

  it("responde 401 sem login e 404 quando o produto não existe", async () => {
    currentActor.mockResolvedValue(null);
    expect((await PUT(pedido("PUT"), contexto)).status).toBe(401);

    currentActor.mockResolvedValue(admin);
    update.mockResolvedValue({ ok: false, code: "NOT_FOUND", message: "Produto não encontrado" });
    expect((await PUT(pedido("PUT"), contexto)).status).toBe(404);
  });
});

describe("DELETE /api/admin/produtos/[id]", () => {
  it("devolve se foi apagado ou só desativado", async () => {
    remove.mockResolvedValue({ ok: true, data: "DEACTIVATED" });

    const resposta = await DELETE(new Request("http://localhost/x", { method: "DELETE" }), contexto);

    expect(await resposta.json()).toEqual({ resultado: "DEACTIVATED" });
    expect(remove).toHaveBeenCalledWith(admin, "p1");
  });

  it("responde 401 sem login e 403 para quem não é admin", async () => {
    const req = () => new Request("http://localhost/x", { method: "DELETE" });
    currentActor.mockResolvedValue(null);
    expect((await DELETE(req(), contexto)).status).toBe(401);

    currentActor.mockResolvedValue({ id: "c1", role: "CUSTOMER" });
    remove.mockResolvedValue({ ok: false, code: "FORBIDDEN", message: "Apenas administradores podem gerenciar produtos" });
    expect((await DELETE(req(), contexto)).status).toBe(403);
  });
});
