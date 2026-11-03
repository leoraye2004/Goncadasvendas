import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AddressForm from "@/components/AddressForm";
import { addressService } from "@/lib/addresses";
import { currentActor } from "@/lib/session";

export const metadata: Metadata = { title: "Editar endereço" };
export const dynamic = "force-dynamic";

// UC08 — editar. Endereço que não é do usuário (ou não existe) vira 404: o service só enxerga os dele.
export default async function EditarEnderecoPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const resultado = await addressService.get(await currentActor(), id);
  if (!resultado.ok) return resultado.code === "UNAUTHENTICATED" ? redirect("/login") : notFound();

  return (
    <main className="mx-auto w-full max-w-[640px] px-4 py-10">
      <h1 className="mb-6 text-[2rem] font-bold leading-tight">Editar endereço</h1>
      <AddressForm address={resultado.data} />
    </main>
  );
}
