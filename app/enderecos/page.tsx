import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteAddressButton from "@/components/DeleteAddressButton";
import { addressService } from "@/lib/addresses";
import { currentActor } from "@/lib/session";

export const metadata: Metadata = { title: "Meus endereços" };
export const dynamic = "force-dynamic";

// UC08 — lista de endereços de entrega do usuário logado (RN01).
export default async function EnderecosPage() {
  const resultado = await addressService.list(await currentActor());
  if (!resultado.ok) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[2rem] font-bold leading-tight">Meus endereços</h1>
        <Link href="/enderecos/novo" className="btn btn-primary">
          Novo endereço
        </Link>
      </div>

      {resultado.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <p className="text-lg font-semibold">Você ainda não cadastrou nenhum endereço</p>
          <p className="mt-1 text-muted">Precisamos de um endereço para entregar o seu pedido.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {resultado.data.map((endereco) => (
            <li key={endereco.id} className="panel flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold">
                  {endereco.street}, {endereco.number}
                </p>
                <p className="text-sm text-muted">
                  {endereco.district} — {endereco.city}/{endereco.state} — CEP {endereco.cep}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/enderecos/${endereco.id}`} className="btn btn-outline-primary btn-sm">
                  Editar
                </Link>
                <DeleteAddressButton id={endereco.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
