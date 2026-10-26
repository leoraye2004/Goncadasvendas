type Monitor = typeof import("@azure/monitor-opentelemetry");

/**
 * Liga o Application Insights só se houver a connection string. Sem ela (desenvolvimento,
 * testes) não carrega a biblioteca e o app roda normalmente. Se a biblioteca falhar, o app
 * sobe mesmo assim: monitoramento nunca pode derrubar a loja.
 */
export async function startMonitoring(
  connectionString: string | undefined,
  load: () => Promise<Pick<Monitor, "useAzureMonitor">> = () => import("@azure/monitor-opentelemetry")
): Promise<boolean> {
  if (!connectionString?.trim()) return false;

  try {
    // Chamada como método (e não solta) porque, pelo nome, o ESLint confundiria com um hook do React.
    const monitor = await load();
    monitor.useAzureMonitor({ azureMonitorExporterOptions: { connectionString } });
    // Sem a connection string no texto: ela é segredo e o log pode ser lido por mais gente.
    console.info("Application Insights ligado.");
    return true;
  } catch (error) {
    console.error("Application Insights não iniciou; seguindo sem monitoramento.", error);
    return false;
  }
}
