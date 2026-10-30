import { beforeEach, describe, expect, it, vi } from "vitest";

const { register, check } = vi.hoisted(() => ({ register: vi.fn(), check: vi.fn() }));

vi.mock("@/lib/auth", () => ({ authService: { register } }));
vi.mock("@/lib/health", () => ({ healthService: { check } }));

import { GET } from "@/app/api/health/route";
import { POST } from "@/app/api/cadastro/route";

beforeEach(() => vi.clearAllMocks());

const json = (corpo: unknown) =>
  new Request("http://localhost/api/cadastro", { method: "POST", body: JSON.stringify(corpo) });

describe("POST /api/cadastro", () => {
  it("responde 201 com o id quando o cadastro dá certo", async () => {
    register.mockResolvedValue({ ok: true, user: { id: "u1" } });

    const resposta = await POST(json({ name: "Ana" }));

    expect(resposta.status).toBe(201);
    expect(await resposta.json()).toEqual({ id: "u1" });
  });

  it.each([
    ["INVALID", 400],
    ["EMAIL_IN_USE", 409],
    ["CPF_IN_USE", 409],
  ] as const)("%s vira HTTP %i", async (code, status) => {
    register.mockResolvedValue({ ok: false, code, message: "erro" });

    expect((await POST(json({}))).status).toBe(status);
  });

  it("trata corpo que não é JSON como dado inválido", async () => {
    register.mockResolvedValue({ ok: false, code: "INVALID", message: "Dados inválidos" });

    const resposta = await POST(new Request("http://localhost/api/cadastro", { method: "POST", body: "isto não é json" }));

    expect(register).toHaveBeenCalledWith(null);
    expect(resposta.status).toBe(400);
  });
});

describe("GET /api/health", () => {
  it("200 quando app e banco estão de pé, sem cache", async () => {
    check.mockResolvedValue({ status: "ok", checks: { app: "up", database: "up" } });

    const resposta = await GET();

    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("Cache-Control")).toBe("no-store");
  });

  it("503 quando o banco não responde", async () => {
    check.mockResolvedValue({ status: "error", checks: { app: "up", database: "down" } });

    expect((await GET()).status).toBe(503);
  });
});
