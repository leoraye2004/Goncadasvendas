import type { Metadata } from "next";
import AddressForm from "@/components/AddressForm";

export const metadata: Metadata = { title: "Novo endereço" };

// Rota protegida pelo middleware (RN01). Quem confere o login de novo ao salvar é o address-service.
export default function NovoEnderecoPage() {
  return (
    <main className="mx-auto w-full max-w-[640px] px-4 py-10">
      <h1 className="mb-1 text-[2rem] font-bold leading-tight">Novo endereço</h1>
      <p className="mb-6 text-sm text-muted">Digite o CEP e completamos o resto para você.</p>
      <AddressForm />
    </main>
  );
}
