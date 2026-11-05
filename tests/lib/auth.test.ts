import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authenticate, register, sessionUser } = vi.hoisted(() => ({
  authenticate: vi.fn(),
  register: vi.fn(),
  sessionUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/services/auth-service", () => ({
  createAuthService: () => ({ authenticate, register, sessionUser }),
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

  it("jwt nas requisições seguintes atualiza o papel com o que está no banco (admin rebaixado perde o acesso)", async () => {
    sessionUser.mockResolvedValue({ id: "u1", role: "CUSTOMER" });

    const token = await authOptions.callbacks!.jwt!({ token: { id: "u1", role: "ADMIN" } as JWT } as never);

    expect(sessionUser).toHaveBeenCalledWith("u1");
    expect(token).toMatchObject({ id: "u1", role: "CUSTOMER" });
  });

  it("jwt também atualiza nome e e-mail, então o cabeçalho mostra o nome novo depois de editar o perfil", async () => {
    sessionUser.mockResolvedValue({ id: "u1", role: "CUSTOMER", name: "Ana Souza", email: "nova@x.com" });

    const token = await authOptions.callbacks!.jwt!({ token: { id: "u1", name: "Ana", email: "velha@x.com" } as JWT } as never);

    expect(token).toMatchObject({ name: "Ana Souza", email: "nova@x.com" });
  });

  it("jwt de usuário apagado esvazia o id, então a sessão deixa de valer (RN04)", async () => {
    sessionUser.mockResolvedValue(null);

    const token = await authOptions.callbacks!.jwt!({ token: { id: "u1", role: "ADMIN" } as JWT } as never);

    expect(token).toMatchObject({ id: "" });
  });

  it("jwt no login não consulta o banco de novo", async () => {
    await authOptions.callbacks!.jwt!({ token: {} as JWT, user: { id: "u1", role: "ADMIN" } as User } as never);

    expect(sessionUser).not.toHaveBeenCalled();
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
