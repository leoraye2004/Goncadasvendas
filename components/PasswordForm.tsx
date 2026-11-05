"use client";

import { useState, type SubmitEvent } from "react";
import { apiRequest } from "@/components/api-request";
import FormError from "@/components/FormError";

// RF10 — troca de senha. Pede a senha atual; quem confere é o profile-service (aqui só a confirmação digitada).
export default function PasswordForm() {
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const dados = new FormData(form);
    setError(undefined);
    setSaved(false);
    if (dados.get("newPassword") !== dados.get("confirmation")) return setError("As senhas não conferem");

    setLoading(true);
    const erro = await apiRequest("/api/conta/senha", "PUT", {
      currentPassword: dados.get("currentPassword"),
      newPassword: dados.get("newPassword"),
    });
    setLoading(false);
    if (erro) return setError(erro);
    setSaved(true);
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
      <h2 className="text-xl font-bold">Trocar senha</h2>
      <FormError message={error} />
      {saved && (
        <p role="status" className="form-success">
          Senha alterada.
        </p>
      )}

      <div>
        <label htmlFor="currentPassword" className="form-label">
          Senha atual
        </label>
        <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required className="form-control" />
      </div>
      <div>
        <label htmlFor="newPassword" className="form-label">
          Nova senha
        </label>
        <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required className="form-control" />
      </div>
      <div>
        <label htmlFor="confirmation" className="form-label">
          Confirmar nova senha
        </label>
        <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" required className="form-control" />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Trocando..." : "Trocar senha"}
      </button>
    </form>
  );
}
