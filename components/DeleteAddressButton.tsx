"use client";

import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/api-request";
import { useToast } from "@/components/ToastProvider";

// Pede confirmação, apaga o endereço e recarrega a lista. Pedidos antigos guardam uma cópia e não são afetados.
export default function DeleteAddressButton({ id }: Readonly<{ id: string }>) {
  const router = useRouter();
  const toast = useToast();

  async function excluir() {
    if (!window.confirm("Excluir este endereço?")) return;
    const erro = await apiRequest(`/api/enderecos/${id}`, "DELETE");
    if (erro) return toast.error(erro);
    toast.success("Endereço excluído");
    router.refresh();
  }

  return (
    <button type="button" onClick={excluir} className="btn btn-outline-danger btn-sm">
      Excluir
    </button>
  );
}
