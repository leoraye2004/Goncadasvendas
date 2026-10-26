import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { registerUserSchema } from "@/lib/validation/user";
import type { UserRepository } from "@/repositories/user-repository";

const CUSTO_BCRYPT = 10;

// Hash de uma senha descartável, com o MESMO custo (10) dos hashes reais. Quando o e-mail não
// existe, comparamos a senha com ele só para gastar o mesmo tempo: sem isso, a resposta mais
// rápida denunciaria quais e-mails têm cadastro.
const HASH_DESCARTAVEL = "$2b$10$c4fznCl2cf8Dc431XoheROsJTLdXijt2HadqtbMaqtny9Bf/2rsnC";

export type SessionUser = { id: string; name: string; email: string; role: Role };

export type RegisterResult =
  | { ok: true; user: SessionUser }
  | { ok: false; code: "INVALID" | "EMAIL_IN_USE" | "CPF_IN_USE"; message: string };

const EMAIL_EM_USO = { ok: false, code: "EMAIL_IN_USE", message: "E-mail já cadastrado" } as const;
const CPF_EM_USO = { ok: false, code: "CPF_IN_USE", message: "CPF já cadastrado" } as const;

function toSessionUser(user: SessionUser): SessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// Dois cadastros ao mesmo tempo podem passar pela checagem e bater na regra única do banco.
function resultadoDeDuplicidade(error: unknown): RegisterResult | null {
  const { code, meta } = error as { code?: string; meta?: { target?: string[] } };
  if (code !== "P2002") return null;
  return meta?.target?.includes("cpf") ? CPF_EM_USO : EMAIL_EM_USO;
}

// Regras de UC01 (cadastro), UC02 (login) e RN06 (e-mail e CPF únicos).
export function createAuthService(users: UserRepository) {
  async function register(input: unknown): Promise<RegisterResult> {
    const parsed = registerUserSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, code: "INVALID", message: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }
    const { password, ...dados } = parsed.data;

    if (await users.findByEmail(dados.email)) return EMAIL_EM_USO;
    if (await users.findByCpf(dados.cpf)) return CPF_EM_USO;

    const passwordHash = await bcrypt.hash(password, CUSTO_BCRYPT);
    try {
      const user = await users.create({ ...dados, passwordHash });
      return { ok: true, user: toSessionUser(user) };
    } catch (error) {
      const duplicado = resultadoDeDuplicidade(error);
      if (duplicado) return duplicado;
      throw error;
    }
  }

  // Devolve o usuário da sessão ou null. Usuário apagado (deletedAt) não entra.
  async function authenticate(email: string, password: string): Promise<SessionUser | null> {
    const user = await users.findByEmail(email.trim().toLowerCase());
    const ativo = user && !user.deletedAt ? user : null;

    // Roda o bcrypt SEMPRE, exista o usuário ou não, para o tempo de resposta ser igual.
    const senhaCerta = await bcrypt.compare(password, ativo?.passwordHash ?? HASH_DESCARTAVEL);

    return ativo && senhaCerta ? toSessionUser(ativo) : null;
  }

  return { register, authenticate };
}

export type AuthService = ReturnType<typeof createAuthService>;
