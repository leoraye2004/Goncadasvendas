import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import OrderStatusForm from "@/components/OrderStatusForm";
import { adminOrderService } from "@/lib/admin-orders";
import { formatBRL, formatDateTime, orderCode, STATUS_LABEL } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Pedido" };
export const dynamic = "force-dynamic";

type Endereco = { cep: string; street: string; number: string; district: string; city: string; state: string };

// UC10 — detalhe de um pedido para o admin: cliente, itens com o preço congelado, endereço da compra e status.
export default async function AdminPedidoPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const resultado = await adminOrderService.get(await requireAdmin(), (await params).id);
  if (!resultado.ok) return resultado.code === "NOT_FOUND" ? notFound() : redirect("/");

  const pedido = resultado.data;
  const endereco = pedido.addressSnapshot as Endereco;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold">Pedido {orderCode(pedido.id)}</h1>
        <p className="text-sm text-muted">
          {formatDateTime(pedido.createdAt)} — {STATUS_LABEL[pedido.status]}
        </p>
      </div>

      <div className="panel p-5">
        <h2 className="mb-1 text-lg font-bold">Cliente</h2>
        <p>{pedido.customer.name}</p>
        <p className="text-sm text-muted">{pedido.customer.email}</p>
      </div>

      <section aria-label="Itens do pedido" className="panel p-5">
        <ul className="divide-y divide-line">
          {pedido.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3">
              <span>
                {item.quantity} × {item.product.name}
                <span className="block text-sm text-muted">{formatBRL(item.unitPrice)} cada</span>
              </span>
              <span className="font-medium">{formatBRL(Number(item.unitPrice) * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
          <span className="text-sm font-semibold uppercase">Valor total</span>
          <span className="text-2xl font-bold">{formatBRL(pedido.total)}</span>
        </div>
      </section>

      <div className="panel p-5">
        <h2 className="mb-1 text-lg font-bold">Entrega em</h2>
        <p>
          {endereco.street}, {endereco.number} — {endereco.district}
        </p>
        <p className="text-muted">
          {endereco.city}/{endereco.state} — CEP {endereco.cep}
        </p>
      </div>

      <div className="panel p-5">
        <h2 className="mb-3 text-lg font-bold">Status</h2>
        <OrderStatusForm id={pedido.id} status={pedido.status} />
      </div>

      <Link href="/admin/pedidos" className="inline-block text-sm font-medium text-brand hover:underline">
        ← Todos os pedidos
      </Link>
    </section>
  );
}
