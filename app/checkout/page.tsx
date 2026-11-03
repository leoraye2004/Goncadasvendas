import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { addressService } from "@/lib/addresses";
import { cartService } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { currentActor } from "@/lib/session";

export const metadata: Metadata = { title: "Finalizar pedido" };
export const dynamic = "force-dynamic";

// UC06 — revisão do carrinho, escolha do endereço e confirmação. Só logado (RN01); carrinho vazio volta ao carrinho.
export default async function CheckoutPage() {
  const actor = await currentActor();
  const [carrinho, enderecos] = await Promise.all([cartService.view(actor), addressService.list(actor)]);
  if (!carrinho.ok || !enderecos.ok) redirect("/login");
  if (carrinho.data.items.length === 0) redirect("/carrinho");

  const { items, total } = carrinho.data;

  return (
    <main className="bs-container py-10">
      <h1 className="mb-6 text-[2rem] font-bold leading-tight">Finalizar pedido</h1>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section aria-label="Resumo do pedido" className="panel self-start p-6">
          <h2 className="mb-4 text-xl font-bold">Itens</h2>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span className="font-medium">{formatBRL(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
            <span className="text-sm font-semibold uppercase">Valor total</span>
            <span className="text-2xl font-bold">{formatBRL(total)}</span>
          </div>
          <Link href="/carrinho" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            ← Voltar ao carrinho
          </Link>
        </section>

        <aside className="panel self-start p-6">
          <CheckoutForm
            addresses={enderecos.data.map((e) => ({
              id: e.id,
              label: `${e.street}, ${e.number} — ${e.district}, ${e.city}/${e.state} — CEP ${e.cep}`,
            }))}
          />
        </aside>
      </div>
    </main>
  );
}
