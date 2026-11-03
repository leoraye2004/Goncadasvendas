import { roleSchema } from "@/lib/validation/role";
import type { UserRepository } from "@/repositories/user-repository";
import type { Actor } from "@/services/product-service";
import { falha, OK, type Result } from "@/services/result";

const SEM_PERMISSAO = falha("FORBIDDEN", "Apenas administradores podem gerenciar usuários");
const NAO_ENCONTRADO = falha("NOT_FOUND", "Usuário não encontrado");

// Regras de UC09 (administrar usuários), RN04 (excluir não apaga pedidos) e RN05 (só ADMIN). O service confere o
// papel mesmo com o middleware na frente.
export function createUserService(users: UserRepository) {
  const isAdmin = (actor: Actor) => actor.role === "ADMIN";

  return {
    async list(actor: Actor) {
      if (!isAdmin(actor)) return SEM_PERMISSAO;
      const lista = await users.listActive();

      return {
        ok: true,
        // Campo a campo, de propósito: CPF e hash da senha nunca saem daqui, mesmo que o repository traga a mais.
        data: lista.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, orders: u._count.orders })),
      } as const;
    },

    async setRole(actor: Actor, id: string, role: unknown): Promise<Result<void>> {
      if (!isAdmin(actor)) return SEM_PERMISSAO;
      const papel = roleSchema.safeParse(role);
      if (!papel.success) return falha("INVALID", papel.error.issues[0].message);
      // Sem isto o último admin poderia se rebaixar e ninguém mais entraria na administração.
      if (id === actor.id) return falha("INVALID", "Você não pode mudar o seu próprio papel");

      return (await users.setRole(id, papel.data)) === 0 ? NAO_ENCONTRADO : OK;
    },

    // RN04: soft delete. O repository só preenche deletedAt; os pedidos do usuário continuam no banco.
    async remove(actor: Actor, id: string): Promise<Result<void>> {
      if (!isAdmin(actor)) return SEM_PERMISSAO;
      if (id === actor.id) return falha("INVALID", "Você não pode excluir a sua própria conta");

      return (await users.softDelete(id)) === 0 ? NAO_ENCONTRADO : OK;
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;
