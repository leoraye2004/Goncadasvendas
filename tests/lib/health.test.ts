import { describe, expect, it, vi } from "vitest";

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn() }));

vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: queryRaw } }));

import { healthService } from "@/lib/health";

describe("healthService (ligado ao repositório e ao Prisma)", () => {
  it("responde ok quando o banco responde", async () => {
    queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    expect(await healthService.check()).toEqual({ status: "ok", checks: { app: "up", database: "up" } });
  });

  it("responde erro quando o banco falha", async () => {
    queryRaw.mockRejectedValue(new Error("fora do ar"));

    expect(await healthService.check()).toEqual({ status: "error", checks: { app: "up", database: "down" } });
  });
});
