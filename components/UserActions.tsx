"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/components/api-request";
import FormError from "@/components/FormError";
import { useToast } from "@/components/ToastProvider";

type Props = Readonly<{ id: string; name: string; role: "ADMIN" | "CUSTOMER"; self: boolean }>;

// UC09 — ações de uma linha da lista de usuários: trocar o papel e excluir. Na própria linha do admin não há
// ações (o service também recusa, isto só evita o botão inútil).
export default function UserActions({ id, name, role, self }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [papel, setPapel] = useState(role);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  if (self) return <span className="text-sm text-muted">Você</span>;

  async function executar(chamada: () => Promise<string | null>, sucesso: string, aoFalhar?: () => void) {
    setError(undefined);
    setLoading(true);
    const erro = await chamada();
    setLoading(false);
    if (erro) {
      aoFalhar?.();
      toast.error(erro);
      return setError(erro);
    }
    toast.success(sucesso);
    router.refresh();
  }

  const trocarPapel = (novo: "ADMIN" | "CUSTOMER") => {
    setPapel(novo);
    return executar(() => apiRequest(`/api/admin/usuarios/${id}`, "PATCH", { role: novo }), "Papel atualizado", () => setPapel(role));
  };

  const excluir = () => {
    if (!window.confirm(`Excluir o usuário "${name}"? Os pedidos dele continuam guardados.`)) return;
    return executar(() => apiRequest(`/api/admin/usuarios/${id}`, "DELETE"), "Usuário excluído");
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <FormError message={error} />
      <div className="flex items-center gap-2">
        <label htmlFor={`papel-${id}`} className="sr-only">
          Papel de {name}
        </label>
        <select
          id={`papel-${id}`}
          value={papel}
          disabled={loading}
          onChange={(event) => trocarPapel(event.target.value as "ADMIN" | "CUSTOMER")}
          className="form-control w-auto"
        >
          <option value="CUSTOMER">Cliente</option>
          <option value="ADMIN">Administrador</option>
        </select>
        <button type="button" onClick={excluir} disabled={loading} className="btn btn-outline-danger btn-sm">
          Excluir
        </button>
      </div>
    </div>
  );
}
