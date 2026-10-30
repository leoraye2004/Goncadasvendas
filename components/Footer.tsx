import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-header text-white/70">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <p className="text-lg font-semibold text-white">GoncadasVendas</p>
          <p className="mt-2 max-w-sm text-sm">Plataforma web de gestão de vendas para pequenos comércios.</p>
        </div>
        <nav aria-label="Rodapé" className="text-sm">
          <p className="mb-3 font-semibold text-white">Navegue</p>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="transition hover:text-white">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition hover:text-white">
                Entrar
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} GoncadasVendas. Projeto de Portfólio da Católica SC.
      </div>
    </footer>
  );
}
