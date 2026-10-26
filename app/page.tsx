import Link from "next/link";

const botao = "rounded-md px-5 py-2.5 text-sm font-medium";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">GoncadasVendas</h1>
      <p className="max-w-md text-lg text-neutral-600 dark:text-neutral-400">
        Plataforma web de gestão de vendas para pequenos comércios.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/login" className={`${botao} bg-foreground text-background hover:opacity-80`}>
          Entrar
        </Link>
        <Link href="/cadastro" className={`${botao} border border-neutral-400 hover:bg-neutral-500/10`}>
          Criar conta
        </Link>
      </div>
    </main>
  );
}
