import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Painel" };

export default function AdminHome() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Painel do administrador</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/produtos" className="panel block p-5 transition hover:shadow-bs">
          <h2 className="text-lg font-semibold">Produtos</h2>
          <p className="mt-1 text-sm text-muted">Cadastre, edite e exclua produtos e suas imagens.</p>
        </Link>
      </div>
    </section>
  );
}
