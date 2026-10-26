"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import FormError from "@/components/FormError";

const campo = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";

// UC02 — login. A mensagem de erro é sempre a mesma, para não revelar se o e-mail existe.
export default function LoginForm({ justRegistered = false }: { justRegistered?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold">Entrar</h1>

      {justRegistered && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          Cadastro concluído! Entre com seu e-mail e senha.
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={campo} />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Senha
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={campo} />
      </div>

      <FormError message={error} />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
