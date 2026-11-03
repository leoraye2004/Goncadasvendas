import { NEXT_STATUS } from "@/lib/order-status";
import { orderStatusSchema } from "@/lib/validation/order-status";
import type { OrderRepository } from "@/repositories/order-repository";
import type { Actor } from "@/services/product-service";
import { falha, OK, type Result } from "@/services/result";

const SEM_PERMISSAO = falha("FORBIDDEN", "Apenas administradores podem gerenciar pedidos");
const NAO_ENCONTRADO = falha("NOT_FOUND", "Pedido não encontrado");

// Regras de UC10 (admin vê todos os pedidos e muda o status) e RN05 (só ADMIN). Fica separado do order-service
// porque aquele só enxerga os pedidos do próprio usuário.
export function createAdminOrderService(orders: OrderRepository) {
  const isAdmin = (actor: Actor) => actor.role === "ADMIN";

  return {
    async list(actor: Actor) {
      if (!isAdmin(actor)) return SEM_PERMISSAO;
      const pedidos = await orders.listAll();

      return {
        ok: true,
        data: pedidos.map((p) => ({
          id: p.id,
          status: p.status,
          total: Number(p.total),
          createdAt: p.createdAt,
          items: p._count.items,
          customer: { name: p.user.name, email: p.user.email },
        })),
      } as const;
    },

    async get(actor: Actor, id: string) {
      if (!isAdmin(actor)) return SEM_PERMISSAO;
      const pedido = await orders.findById(id);
      return pedido ? ({ ok: true, data: { ...pedido, customer: pedido.user } } as const) : NAO_ENCONTRADO;
    },

    async setStatus(actor: Actor, id: string, status: unknown): Promise<Result<void>> {
      if (!isAdmin(actor)) return SEM_PERMISSAO;
      const novo = orderStatusSchema.safeParse(status);
      if (!novo.success) return falha("INVALID", novo.error.issues[0].message);

      const pedido = await orders.findById(id);
      if (!pedido) return NAO_ENCONTRADO;
      if (!NEXT_STATUS[pedido.status].includes(novo.data)) {
        return falha("INVALID", "Este pedido não pode ir para esse status");
      }

      // 0 linhas mudadas = outro admin mexeu no pedido depois que lemos o status.
      const mudou = await orders.setStatus(id, pedido.status, novo.data);
      return mudou === 0 ? falha("INVALID", "O pedido mudou enquanto você olhava. Atualize a página.") : OK;
    },
  };
}

export type AdminOrderService = ReturnType<typeof createAdminOrderService>;
