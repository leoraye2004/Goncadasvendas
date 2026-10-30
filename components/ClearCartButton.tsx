"use client";

import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/api-request";

// Pede confirmação e esvazia o carrinho inteiro.
export default function ClearCartButton() {
  const router = useRouter();

  async function esvaziar() {
    if (!window.confirm("Remover todos os produtos do carrinho?")) return;
    const erro = await apiRequest("/api/carrinho", "DELETE");
    if (erro) return window.alert(erro);
    router.refresh();
  }

  return (
    <button type="button" onClick={esvaziar} className="text-sm font-medium text-muted hover:text-danger hover:underline">
      Esvaziar carrinho
    </button>
  );
}
