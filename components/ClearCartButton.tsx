"use client";

import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/api-request";
import { useToast } from "@/components/ToastProvider";

// Pede confirmação e esvazia o carrinho inteiro.
export default function ClearCartButton() {
  const router = useRouter();
  const toast = useToast();

  async function esvaziar() {
    if (!window.confirm("Remover todos os produtos do carrinho?")) return;
    const erro = await apiRequest("/api/carrinho", "DELETE");
    if (erro) return toast.error(erro);
    toast.success("Carrinho esvaziado");
    router.refresh();
  }

  return (
    <button type="button" onClick={esvaziar} className="text-sm font-medium text-muted hover:text-danger hover:underline">
      Esvaziar carrinho
    </button>
  );
}
