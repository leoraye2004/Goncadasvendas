import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import type { HealthRepository } from "@/repositories/health-repository";
import { createHealthService } from "@/services/health-service";

let repo: ReturnType<typeof mock<HealthRepository>>;

beforeEach(() => {
  repo = mock<HealthRepository>();
});

afterEach(() => vi.useRealTimers());

describe("healthService.check", () => {
  it("devolve ok quando o app e o banco estão de pé", async () => {
    repo.ping.mockResolvedValue(undefined);

    const report = await createHealthService(repo).check();

    expect(report).toEqual({ status: "ok", checks: { app: "up", database: "up" } });
  });

  it("devolve erro (mas não quebra) quando o banco não responde", async () => {
    repo.ping.mockRejectedValue(new Error("Can't reach database server"));

    const report = await createHealthService(repo).check();

    expect(report).toEqual({ status: "error", checks: { app: "up", database: "down" } });
  });

  it("não mostra detalhes do erro do banco (nada de host, senha ou stack na resposta)", async () => {
    repo.ping.mockRejectedValue(new Error("password authentication failed for user postgres at 10.0.0.5"));

    const texto = JSON.stringify(await createHealthService(repo).check());

    expect(texto).not.toContain("password");
    expect(texto).not.toContain("10.0.0.5");
  });

  it("considera o banco fora do ar se ele travar por mais de 3 segundos", async () => {
    vi.useFakeTimers();
    repo.ping.mockReturnValue(new Promise(() => {})); // nunca responde

    const pendente = createHealthService(repo).check();
    await vi.advanceTimersByTimeAsync(3000);

    expect(await pendente).toEqual({ status: "error", checks: { app: "up", database: "down" } });
  });
});
