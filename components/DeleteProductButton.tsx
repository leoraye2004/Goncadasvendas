"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Pede confirmação, chama DELETE e atualiza a lista. Produto já pedido só é desativado (o service decide).
export default function DeleteProductButton({ id, name }: Readonly<{ id: string; name: string }>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function excluir() {
    if (!window.confirm(`Excluir o produto "${name}"?`)) return;
    setLoading(true);
    try {
      const resposta = await fetch(`/api/admin/produtos/${id}`, { method: "DELETE" });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        window.alert(corpo.error ?? "Não foi possível excluir o produto.");
        return;
      }
      if (corpo.resultado === "DEACTIVATED") {
        window.alert("Este produto já tem pedidos, então foi desativado em vez de excluído.");
      }
      router.refresh();
    } catch {
      window.alert("Não foi possível excluir o produto.");
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
