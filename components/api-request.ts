const ERRO_GENERICO = "Não foi possível concluir a operação. Tente novamente.";

// Chama uma rota /api do site. Devolve null se deu certo, ou a mensagem de erro para mostrar na tela.
export async function apiRequest(url: string, method: string, body?: unknown): Promise<string | null> {
  try {
    const resposta = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (resposta.ok) return null;
    const corpo = await resposta.json().catch(() => ({}));
    return corpo.error ?? ERRO_GENERICO;
  } catch {
    return ERRO_GENERICO;
  }
}
