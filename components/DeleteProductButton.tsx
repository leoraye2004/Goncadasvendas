"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

// Pede confirmação, chama DELETE e atualiza a lista. Produto já pedido só é desativado (o service decide).
export default function DeleteProductButton({ id, name }: Readonly<{ id: string; name: string }>) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function excluir() {
    if (!window.confirm(`Excluir o produto "${name}"?`)) return;
    setLoading(true);
    try {
      const resposta = await fetch(`/api/admin/produtos/${id}`, { method: "DELETE" });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        toast.error(corpo.error ?? "Não foi possível excluir o produto.");
        return;
      }
      toast.success(
        corpo.resultado === "DEACTIVATED"
          ? "Este produto já tem pedidos, então foi desativado em vez de excluído."
          : "Produto excluído",
      );
      router.refresh();
    } catch {
      toast.error("Não foi possível excluir o produto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={excluir} disabled={loading} className="btn btn-outline-danger btn-sm">
      {loading ? "Excluindo..." : "Excluir"}
    </button>
  );
}
