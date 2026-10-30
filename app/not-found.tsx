import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bs-container flex flex-1 flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-muted">O endereço não existe ou o produto não está mais disponível.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Ver o catálogo
      </Link>
    </main>
  );
}
