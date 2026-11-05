import bcrypt from "bcryptjs";
import { changePasswordSchema, profileSchema } from "@/lib/validation/user";
import type { UserRepository } from "@/repositories/user-repository";
import { CUSTO_BCRYPT } from "@/services/auth-service";
import type { Actor } from "@/services/product-service";
import { falha, OK, SEM_LOGIN, type Result } from "@/services/result";

const NAO_ENCONTRADO = falha("NOT_FOUND", "Usuário não encontrado");
const EMAIL_EM_USO = falha("CONFLICT", "E-mail já cadastrado");

// Regras de RF10 (perfil e troca de senha), RN01 (só logado) e RN06 (e-mail único). O id vem sempre do Actor
// (a sessão), nunca do corpo da requisição: cada usuário só edita a si mesmo.
export function createProfileService(users: UserRepository) {
  return {
    async get(actor: Actor | null) {
      if (!actor) return SEM_LOGIN;
      const user = await users.findById(actor.id);
      if (!user || user.deletedAt) return NAO_ENCONTRADO;

      // Só o que a tela edita: nada de CPF nem hash da senha.
      return {
        ok: true,
        data: { name: user.name, email: user.email, birthDate: user.birthDate.toISOString().slice(0, 10) },
      } as const;
    },

    async update(actor: Actor | null, input: unknown): Promise<Result<void>> {
      if (!actor) return SEM_LOGIN;
      const dados = profileSchema.safeParse(input);
      if (!dados.success) return falha("INVALID", dados.error.issues[0].message);

      const dono = await users.findByEmail(dados.data.email);
      if (dono && dono.id !== actor.id) return EMAIL_EM_USO;

      try {
        return (await users.updateProfile(actor.id, dados.data)) === 0 ? NAO_ENCONTRADO : OK;
      } catch (error) {
        // Duas pessoas trocando para o mesmo e-mail ao mesmo tempo: o banco barra com P2002.
        if ((error as { code?: string }).code === "P2002") return EMAIL_EM_USO;
        throw error;
      }
    },

    async changePassword(actor: Actor | null, input: unknown): Promise<Result<void>> {
      if (!actor) return SEM_LOGIN;
      const dados = changePasswordSchema.safeParse(input);
      if (!dados.success) return falha("INVALID", dados.error.issues[0].message);
      const { currentPassword, newPassword } = dados.data;

      const user = await users.findById(actor.id);
      if (!user || user.deletedAt) return NAO_ENCONTRADO;
      if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return falha("INVALID", "Senha atual incorreta");
      if (newPassword === currentPassword) return falha("INVALID", "A nova senha deve ser diferente da atual");

      const mudou = await users.setPasswordHash(actor.id, await bcrypt.hash(newPassword, CUSTO_BCRYPT));
      return mudou === 0 ? NAO_ENCONTRADO : OK;
    },
  };
}

export type ProfileService = ReturnType<typeof createProfileService>;
