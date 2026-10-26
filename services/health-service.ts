import type { HealthRepository } from "@/repositories/health-repository";

// Acima disso o banco é tratado como fora do ar. Sem limite, um banco travado deixaria
// a própria checagem de saúde travada (e o monitoramento sem resposta).
const LIMITE_DO_BANCO_MS = 3000;

export type HealthReport = {
  status: "ok" | "error";
  checks: { app: "up"; database: "up" | "down" };
};

function depoisDe(ms: number): Promise<"down"> {
  return new Promise((resolve) => setTimeout(() => resolve("down"), ms));
}

// Estado do app e do banco, usado pelo /api/health (monitoramento e smoke test do deploy).
// Nunca devolve o texto do erro do banco: ele pode ter host e usuário.
export function createHealthService(health: HealthRepository) {
  async function check(): Promise<HealthReport> {
    const database = await Promise.race([
      health.ping().then(
        () => "up" as const,
        () => "down" as const
      ),
      depoisDe(LIMITE_DO_BANCO_MS),
    ]);

    return { status: database === "up" ? "ok" : "error", checks: { app: "up", database } };
  }

  return { check };
}

export type HealthService = ReturnType<typeof createHealthService>;
