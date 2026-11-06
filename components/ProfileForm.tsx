"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { apiRequest } from "@/components/api-request";
import FormError from "@/components/FormError";
import { useToast } from "@/components/ToastProvider";

type Profile = { name: string; email: string; birthDate: string };

// RF10 — edita nome, e-mail e nascimento. As regras (e-mail único, datas) ficam no profile-service.
export default function ProfileForm({ profile }: Readonly<{ profile: Profile }>) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const dados = Object.fromEntries(new FormData(event.currentTarget));
    setError(undefined);
    setSaved(false);
    setLoading(true);
    const erro = await apiRequest("/api/conta/perfil", "PUT", dados);
    setLoading(false);
    if (erro) {
      toast.error(erro);
      return setError(erro);
    }
    toast.success("Dados atualizados");
    setSaved(true);
    router.refresh(); // o nome no cabeçalho vem da sessão, que o servidor atualiza a cada requisição
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
      <h2 className="text-xl font-bold">Meus dados</h2>
      <FormError message={error} />
      {saved && (
        <p role="status" className="form-success">
          Dados atualizados.
        </p>
      )}

      <div>
        <label htmlFor="name" className="form-label">
          Nome completo
        </label>
        <input id="name" name="name" defaultValue={profile.name} autoComplete="name" required className="form-control" />
      </div>
      <div>
        <label htmlFor="email" className="form-label">
          E-mail
        </label>
        <input id="email" name="email" type="email" defaultValue={profile.email} autoComplete="email" required className="form-control" />
      </div>
      <div>
        <label htmlFor="birthDate" className="form-label">
          Data de nascimento
        </label>
        <input id="birthDate" name="birthDate" type="date" defaultValue={profile.birthDate} autoComplete="bday" required className="form-control" />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Salvando..." : "Salvar dados"}
      </button>
    </form>
  );
}
