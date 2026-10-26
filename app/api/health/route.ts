import { NextResponse } from "next/server";
import { healthService } from "@/lib/health";

// Sempre consulta o banco na hora (nunca devolve resposta guardada em cache).
export const dynamic = "force-dynamic";

// Fina de propósito: 200 se app e banco estão de pé, 503 se o banco não responde.
export async function GET() {
  const report = await healthService.check();

  return NextResponse.json(report, {
    status: report.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
