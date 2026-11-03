import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminOrderService } from "@/lib/admin-orders";
import { formatBRL, formatDateTime, orderCode, STATUS_LABEL } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Pedidos" };
export const dynamic = "force-dynamic";

// UC10 — todos os pedidos, do mais novo para o mais antigo (RN05: requireAdmin).
export default async function AdminPedidosPage() {
  const result = await adminOrderService.list(await requireAdmin());
  if (!result.ok) redirect("/");

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Pedidos</h1>

      <div className="panel overflow-x-auto">
        <table className="bs-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted">
                  Nenhum pedido ainda.
                </td>
              </tr>
            )}
            {result.data.map((pedido) => (
              <tr key={pedido.id}>
                <td className="font-medium">{orderCode(pedido.id)}</td>
                <td>{formatDateTime(pedido.createdAt)}</td>
                <td>
                  {pedido.customer.name}
                  <span className="block text-xs text-muted">{pedido.customer.email}</span>
                </td>
                <td>{pedido.items}</td>
                <td>{formatBRL(pedido.total)}</td>
                <td>{STATUS_LABEL[pedido.status]}</td>
                <td className="text-right">
                  <Link href={`/admin/pedidos/${pedido.id}`} className="btn btn-outline-primary btn-sm">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
