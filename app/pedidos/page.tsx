import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatBRL, formatDateTime, orderCode, STATUS_LABEL } from "@/lib/format";
import { orderService } from "@/lib/orders";
import { currentActor } from "@/lib/session";

export const metadata: Metadata = { title: "Meus pedidos" };
export const dynamic = "force-dynamic";

// UC06 — histórico de pedidos do usuário logado (RN01), do mais novo para o mais antigo.
export default async function PedidosPage() {
  const resultado = await orderService.list(await currentActor());
  if (!resultado.ok) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-10">
      <h1 className="mb-6 text-[2rem] font-bold leading-tight">Meus pedidos</h1>

      {resultado.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <p className="text-lg font-semibold">Você ainda não fez nenhum pedido</p>
          <Link href="/" className="btn btn-primary mt-5">
            Ver o catálogo
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {resultado.data.map((pedido) => (
            <li key={pedido.id}>
              <Link href={`/pedidos/${pedido.id}`} className="panel flex flex-wrap items-center justify-between gap-3 p-5 transition hover:border-brand">
                <div>
                  <p className="font-semibold">Pedido {orderCode(pedido.id)}</p>
                  <p className="text-sm text-muted">
                    {formatDateTime(pedido.createdAt)} — {pedido._count.items} {pedido._count.items === 1 ? "item" : "itens"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatBRL(pedido.total)}</p>
                  <p className="text-sm text-muted">{STATUS_LABEL[pedido.status]}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
