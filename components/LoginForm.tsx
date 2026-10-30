"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type SubmitEvent } from "react";
import FormError from "@/components/FormError";

const campo = "form-control";

// UC02 — login. A mensagem de erro é sempre a mesma, para não revelar se o e-mail existe.
export default function LoginForm({ justRegistered = false }: Readonly<{ justRegistered?: boolean }>) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const dados = new FormData(event.currentTarget);
    setError(undefined);
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: dados.get("email"),
        password: dados.get("password"),
        redirect: false,
      });
      if (!result || result.error) {
        setError("E-mail ou senha inválidos");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Não foi possível entrar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel w-full max-w-sm space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Entrar</h1>

      {justRegistered && (
        <output className="form-success block">
          Cadastro concluído! Entre com seu e-mail e senha.
        </output>
      )}

      <div>
        <label htmlFor="email" className="form-label">
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={campo} />
      </div>

      <div>
        <label htmlFor="password" className="form-label">
          Senha
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={campo} />
      </div>

      <FormError message={error} />

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-brand hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
