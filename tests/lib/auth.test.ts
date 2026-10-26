import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authenticate, register } = vi.hoisted(() => ({ authenticate: vi.fn(), register: vi.fn() }));

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/services/auth-service", () => ({
  createAuthService: () => ({ authenticate, register }),
}));

import { authOptions, authorizeCredentials, authService } from "@/lib/auth";

beforeEach(() => vi.clearAllMocks());

describe("authorizeCredentials", () => {
  it("entrega e-mail e senha ao service e devolve o usuário", async () => {
    const usuario = { id: "u1", name: "Ana", email: "ana@example.com", role: "CUSTOMER" };
    authenticate.mockResolvedValue(usuario);

    const result = await authorizeCredentials({ email: "ana@example.com", password: "senha1234" });

    expect(authenticate).toHaveBeenCalledWith("ana@example.com", "senha1234");
    expect(result).toEqual(usuario);
  });

  it("devolve null quando o service recusa o login", async () => {
    authenticate.mockResolvedValue(null);

    expect(await authorizeCredentials({ email: "ana@example.com", password: "errada" })).toBeNull();
  });

  it("nem consulta o service quando falta e-mail ou senha", async () => {
    expect(await authorizeCredentials(undefined)).toBeNull();
    expect(await authorizeCredentials({ email: "", password: "senha1234" })).toBeNull();
    expect(await authorizeCredentials({ email: "ana@example.com", password: "" })).toBeNull();
    expect(authenticate).not.toHaveBeenCalled();
  });
});

describe("authOptions", () => {
  it("usa sessão JWT e a tela /login", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
    expect(authOptions.pages?.signIn).toBe("/login");
  });

  it("tem só o login por e-mail e senha (credentials)", () => {
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.providers[0].id).toBe("credentials");
  });

  it("jwt guarda id e role do usuário no login", async () => {
    const user = { id: "u1", role: "ADMIN" } as User;

    const token = await authOptions.callbacks!.jwt!({ token: {} as JWT, user } as never);

    expect(token).toMatchObject({ id: "u1", role: "ADMIN" });
  });

  it("jwt não mexe no token nas requisições seguintes (sem usuário)", async () => {
    const original = { id: "u1", role: "CUSTOMER" } as JWT;

    const token = await authOptions.callbacks!.jwt!({ token: original } as never);

    expect(token).toEqual({ id: "u1", role: "CUSTOMER" });
  });

  it("session expõe id e role do token", async () => {
    const session = { user: { name: "Ana" }, expires: "" } as Session;
    const token = { id: "u1", role: "ADMIN" } as JWT;

    const result = await authOptions.callbacks!.session!({ session, token } as never);

    expect(result.user).toMatchObject({ id: "u1", role: "ADMIN", name: "Ana" });
  });

  it("session sem usuário continua sem usuário", async () => {
    const session = { expires: "" } as Session;

    const result = await authOptions.callbacks!.session!({ session, token: {} as JWT } as never);

    expect(result.user).toBeUndefined();
  });
});

describe("authService", () => {
  it("é o service ligado ao repositório, exportado para as páginas usarem", () => {
    expect(authService.register).toBe(register);
  });
});
