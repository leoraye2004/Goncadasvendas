import { describe, expect, it, vi } from "vitest";
import { startMonitoring } from "@/lib/observability";

const CONNECTION_STRING = "InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://exemplo.invalid/";

describe("startMonitoring", () => {
  it("não liga nada (e nem carrega a biblioteca) quando não há connection string", async () => {
    const load = vi.fn();

    expect(await startMonitoring(undefined, load)).toBe(false);
    expect(await startMonitoring("", load)).toBe(false);
    expect(await startMonitoring("   ", load)).toBe(false);
    expect(load).not.toHaveBeenCalled();
  });

  it("liga o Application Insights com a connection string recebida", async () => {
    const useAzureMonitor = vi.fn();
    const load = vi.fn().mockResolvedValue({ useAzureMonitor });

    expect(await startMonitoring(CONNECTION_STRING, load)).toBe(true);
    expect(useAzureMonitor).toHaveBeenCalledWith({
      azureMonitorExporterOptions: { connectionString: CONNECTION_STRING },
    });
  });

  it("deixa um aviso no log quando liga, para dar para conferir em produção", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const load = vi.fn().mockResolvedValue({ useAzureMonitor: vi.fn() });

    await startMonitoring(CONNECTION_STRING, load);

    expect(info).toHaveBeenCalledWith("Application Insights ligado.");
    expect(JSON.stringify(info.mock.calls)).not.toContain("InstrumentationKey");
  });

  it("não derruba o app se a biblioteca de monitoramento falhar", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const load = vi.fn().mockRejectedValue(new Error("falha ao carregar"));

    expect(await startMonitoring(CONNECTION_STRING, load)).toBe(false);
  });
});
