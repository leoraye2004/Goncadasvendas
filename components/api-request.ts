const ERRO_GENERICO = "Não foi possível concluir a operação. Tente novamente.";

// Chama uma rota /api do site. Dá certo: { data } com o JSON da resposta. Dá errado: { error } com a mensagem
// para mostrar na tela.
export async function apiCall(
  url: string,
  method: string,
  body?: unknown,
): Promise<{ error: string; data?: undefined } | { error?: undefined; data: Record<string, unknown> }> {
  try {
    const resposta = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const corpo = await resposta.json().catch(() => ({}));
    return resposta.ok ? { data: corpo } : { error: corpo.error ?? ERRO_GENERICO };
  } catch {
    return { error: ERRO_GENERICO };
  }
}

// Versão para quem só quer saber se deu certo: devolve null, ou a mensagem de erro.
export async function apiRequest(url: string, method: string, body?: unknown): Promise<string | null> {
  return (await apiCall(url, method, body)).error ?? null;
}
