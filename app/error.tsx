"use client";

// Se uma página quebrar de surpresa (ex.: banco fora do ar), mostra isto em vez de uma tela em branco.
export default function ErroDaPagina({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <main className="bs-container flex flex-1 flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-bold">Algo deu errado</h1>
      <p className="mt-2 text-muted">Não conseguimos carregar esta página agora. Tente de novo em instantes.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">
        Tentar novamente
      </button>
    </main>
  );
}
