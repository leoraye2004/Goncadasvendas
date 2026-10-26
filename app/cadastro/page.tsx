import type { Metadata } from "next";
import CadastroForm from "@/components/CadastroForm";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <CadastroForm />
    </main>
  );
}
