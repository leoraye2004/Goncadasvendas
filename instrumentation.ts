// O Next.js chama register() uma vez, quando o servidor sobe.
export async function register() {
  // Só no servidor Node (não no edge, onde o middleware roda).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startMonitoring } = await import("./lib/observability");
  await startMonitoring(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING);
}
