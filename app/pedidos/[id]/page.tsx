import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatBRL, formatDateTime, orderCode, STATUS_LABEL } from "@/lib/format";
import { orderService } from "@/lib/orders";
import { currentActor } from "@/lib/session";

export const metadata: Metadata = { title: "Pedido" };
export const dynamic = "force-dynamic";

type Props = Readonly<{ params: Promise<{ id: string }>; searchParams: Promise<{ confirmado?: string }> }>;

type Endereco = { cep: string; street: string; number: string; district: string; city: string; state: string };

// UC06 — confirmação e detalhe de um pedido. Mostra o preço e o endereço do momento da compra.
// Pedido de outra pessoa (ou inexistente) vira 404: o service só enxerga os do usuário logado.
export default async function PedidoPage({ params, searchParams }: Props) {
  const [{ id }, { confirmado }] = await Promise.all([params, searchParams]);
  const resultado = await orderService.get(await currentActor(), id);
  if (!resultado.ok) return resultado.code === "UNAUTHENTICATED" ? redirect("/login") : notFound();

  const pedido = resultado.data;
  const endereco = pedido.addressSnapshot as Endereco;

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-10">
      {confirmado && (
        <p role="status" className="form-success mb-6">
          Pedido confirmado! Guardamos os itens e o endereço de entrega abaixo.
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-[2rem] font-bold leading-tight">Pedido {orderCode(pedido.id)}</h1>
        <p className="text-sm text-muted">
          {formatDateTime(pedido.createdAt)} — {STATUS_LABEL[pedido.status]}
        </p>
      </div>

      <section aria-label="Itens do pedido" className="panel p-6">
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

      <section aria-label="Endereço de entrega" className="panel mt-4 p-6">
        <h2 className="mb-2 text-lg font-bold">Entrega em</h2>
        <p>
          {endereco.street}, {endereco.number} — {endereco.district}
        </p>
        <p className="text-muted">
          {endereco.city}/{endereco.state} — CEP {endereco.cep}
        </p>
      </section>

      <Link href="/pedidos" className="mt-6 inline-block text-sm font-medium text-brand hover:underline">
        ← Meus pedidos
      </Link>
    </main>
  );
}
