"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import FormError from "@/components/FormError";
import { useToast } from "@/components/ToastProvider";

const campo = "form-control";
const MENSAGEM_ERRO = "Não foi possível concluir o cadastro. Tente novamente.";

// UC01 — cadastro. As regras ficam no servidor (auth-service); aqui só enviamos e mostramos o erro.
export default function CadastroForm() {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const falhar = (mensagem: string) => {
    toast.error(mensagem);
    setError(mensagem);
  };

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const dados = Object.fromEntries(new FormData(event.currentTarget));
    setError(undefined);
    setLoading(true);
    try {
      const resposta = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => ({}));
        falhar(corpo.error ?? MENSAGEM_ERRO);
        return;
      }
      toast.success("Cadastro concluído! Entre com seu e-mail e senha.");
      router.push("/login?cadastro=ok");
    } catch {
      falhar(MENSAGEM_ERRO);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel w-full max-w-sm space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Criar conta</h1>

      <div>
        <label htmlFor="name" className="form-label">
          Nome completo
        </label>
        <input id="name" name="name" autoComplete="name" required className={campo} />
      </div>

      <div>
        <label htmlFor="email" className="form-label">
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={campo} />
      </div>

      <div>
        <label htmlFor="cpf" className="form-label">
          CPF
        </label>
        <input id="cpf" name="cpf" inputMode="numeric" placeholder="000.000.000-00" required className={campo} />
      </div>

      <div>
        <label htmlFor="birthDate" className="form-label">
          Data de nascimento
        </label>
        <input id="birthDate" name="birthDate" type="date" autoComplete="bday" required className={campo} />
      </div>

      <div>
        <label htmlFor="password" className="form-label">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          aria-describedby="senha-ajuda"
          className={campo}
        />
        <p id="senha-ajuda" className="mt-1 text-xs text-neutral-500">
          Mínimo de 8 caracteres.
        </p>
      </div>

      <FormError message={error} />

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? "Cadastrando..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
