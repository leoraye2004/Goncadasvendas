"use client";

import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/api-request";

// Pede confirmação, apaga o endereço e recarrega a lista. Pedidos antigos guardam uma cópia e não são afetados.
export default function DeleteAddressButton({ id }: Readonly<{ id: string }>) {
  const router = useRouter();

  async function excluir() {
    if (!window.confirm("Excluir este endereço?")) return;
    const erro = await apiRequest(`/api/enderecos/${id}`, "DELETE");
    if (erro) return window.alert(erro);
    router.refresh();
  }

  return (
    <button type="button" onClick={excluir} className="btn btn-outline-danger btn-sm">
      Excluir
    </button>
  );
}
