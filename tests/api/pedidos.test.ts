import { beforeEach, describe, expect, it, vi } from "vitest";

const { currentActor, checkout } = vi.hoisted(() => ({ currentActor: vi.fn(), checkout: vi.fn() }));

vi.mock("@/lib/session", () => ({ currentActor }));
vi.mock("@/lib/orders", () => ({ orderService: { checkout } }));

import { POST } from "@/app/api/pedidos/route";

const cliente = { id: "u1", role: "CUSTOMER" };
const pedido = (corpo: string) => new Request("http://localhost/api/pedidos", { method: "POST", body: corpo });

beforeEach(() => {
  vi.clearAllMocks();
  currentActor.mockResolvedValue(cliente);
});

describe("POST /api/pedidos", () => {
  it("finaliza o pedido do usuário logado e responde 201 com o id", async () => {
    checkout.mockResolvedValue({ ok: true, data: { id: "o1" } });

    const resposta = await POST(pedido(JSON.stringify({ addressId: "a1" })));

    expect(resposta.status).toBe(201);
    expect(await resposta.json()).toEqual({ id: "o1" });
    expect(checkout).toHaveBeenCalledWith(cliente, "a1");
  });

  it("sem login responde 401", async () => {
    currentActor.mockResolvedValue(null);
    checkout.mockResolvedValue({ ok: false, code: "UNAUTHENTICATED", message: "Faça login para continuar" });

    expect((await POST(pedido("{}"))).status).toBe(401);
    expect(checkout).toHaveBeenCalledWith(null, undefined);
  });

  it.each([
    ["INVALID", 400],
    ["NOT_FOUND", 404],
  ] as const)("falha %s do service vira HTTP %i com a mensagem", async (code, status) => {
    checkout.mockResolvedValue({ ok: false, code, message: "algo deu errado" });

    const resposta = await POST(pedido(JSON.stringify({ addressId: "a1" })));

    expect(resposta.status).toBe(status);
    expect(await resposta.json()).toEqual({ error: "algo deu errado" });
  });

  it("corpo que não é JSON não quebra a rota", async () => {
    checkout.mockResolvedValue({ ok: false, code: "INVALID", message: "Escolha um endereço de entrega" });

    expect((await POST(pedido("não é json"))).status).toBe(400);
    expect(checkout).toHaveBeenCalledWith(cliente, undefined);
  });
});
