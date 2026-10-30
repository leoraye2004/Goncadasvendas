import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, redirect } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  redirect: vi.fn((destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  }),
}));

vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { currentActor, currentUser, requireAdmin } from "@/lib/session";

beforeEach(() => vi.clearAllMocks());

describe("currentActor", () => {
  it("devolve id e papel do token", async () => {
    getServerSession.mockResolvedValue({ user: { id: "u1", role: "ADMIN", name: "Ana" } });

    expect(await currentActor()).toEqual({ id: "u1", role: "ADMIN" });
  });

  it("devolve null sem login", async () => {
    getServerSession.mockResolvedValue(null);

    expect(await currentActor()).toBeNull();
  });
});

describe("currentUser", () => {
  it("devolve o nome e se é admin", async () => {
    getServerSession.mockResolvedValue({ user: { id: "u1", role: "ADMIN", name: "Ana" } });

    expect(await currentUser()).toEqual({ name: "Ana", isAdmin: true });
  });

  it("cliente comum não é admin e nome ausente vira texto vazio", async () => {
    getServerSession.mockResolvedValue({ user: { id: "u2", role: "CUSTOMER" } });

    expect(await currentUser()).toEqual({ name: "", isAdmin: false });
  });

  it("devolve null sem login", async () => {
    getServerSession.mockResolvedValue(null);

    expect(await currentUser()).toBeNull();
  });
});

describe("requireAdmin (RN05)", () => {
  it("deixa o ADMIN passar", async () => {
    getServerSession.mockResolvedValue({ user: { id: "a1", role: "ADMIN" } });

    expect(await requireAdmin()).toEqual({ id: "a1", role: "ADMIN" });
  });

  it("manda quem não está logado para /login", async () => {
    getServerSession.mockResolvedValue(null);

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
  });

  it("manda cliente comum para a home", async () => {
    getServerSession.mockResolvedValue({ user: { id: "c1", role: "CUSTOMER" } });

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/");
  });
});
