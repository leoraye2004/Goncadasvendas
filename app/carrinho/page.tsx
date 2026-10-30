import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CartItemRow from "@/components/CartItemRow";
import ClearCartButton from "@/components/ClearCartButton";
import { cartService } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { currentActor } from "@/lib/session";

export const metadata: Metadata = { title: "Carrinho" };
export const dynamic = "force-dynamic";

// UC05 — carrinho do usuário logado (RN01). Os dados vêm do banco, então continuam depois de sair e voltar (RN02).
export default async function CarrinhoPage() {
  const actor = await currentActor();
  if (!actor) redirect("/login");

  const resultado = await cartService.view(actor);
  if (!resultado.ok) redirect("/login");
  const { items, total, count } = resultado.data;

  return (
    <main className="bs-container py-10">
      <h1 className="mb-6 text-[2rem] font-bold leading-tight">Carrinho de compras</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <p className="text-lg font-semibold">Seu carrinho está vazio</p>
          <p className="mt-1 text-muted">Adicione produtos para finalizar o pedido.</p>
          <Link href="/" className="btn btn-primary mt-5">
            Continuar comprando
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section aria-label="Itens do carrinho" className="panel">
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line p-5">
              <Link href="/" className="text-sm font-medium text-brand hover:underline">
                ← Continuar comprando
              </Link>
              <ClearCartButton />
            </div>
          </section>

          <aside className="panel self-start p-6">
            <h2 className="mb-5 text-xl font-bold">Resumo</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted">
                  {count} {count === 1 ? "item" : "itens"}
                </dt>
                <dd className="font-medium">{formatBRL(total)}</dd>
              </div>
              <div className="flex items-end justify-between border-t border-line pt-4">
                <dt className="text-sm font-semibold uppercase">Valor total</dt>
                <dd className="text-2xl font-bold">{formatBRL(total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </main>
  );
}
