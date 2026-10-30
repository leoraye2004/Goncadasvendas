import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import type { HeaderUser } from "@/lib/session";

const link = "rounded-full px-3 py-2 text-sm text-white/90 transition hover:bg-white/10 hover:text-white md:px-4";

// Cabeçalho do site: marca à esquerda; à direita, Entrar e Cadastrar (visitante) ou nome, Administração e Sair.
export default function SiteHeader({ user }: Readonly<{ user: HeaderUser | null }>) {
  return (
    <header className="sticky top-0 z-40 bg-header text-white shadow-bs-sm">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Goncadas<span className="text-brand-accent">Vendas</span>
          <span className="sr-only"> — página inicial</span>
        </Link>

        <nav aria-label="Conta" className="flex items-center gap-1 md:gap-2">
          {user ? (
            <>
              <span className="hidden max-w-[160px] truncate px-2 text-sm text-white/80 sm:block">
                Olá, <strong className="font-semibold text-white">{user.name}</strong>
              </span>
              {user.isAdmin && (
                <Link href="/admin" className={link}>
                  Administração
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className={link}>
                Entrar
              </Link>
              <Link href="/cadastro" className="rounded-full border border-white/40 px-3 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-header md:px-4">
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
