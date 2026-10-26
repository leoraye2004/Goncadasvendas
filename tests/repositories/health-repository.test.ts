import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { createHealthRepository } from "@/repositories/health-repository";

describe("healthRepository.ping", () => {
  it("faz uma consulta simples no banco e termina sem erro quando ele responde", async () => {
    const db = mockDeep<PrismaClient>();
    db.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    await expect(createHealthRepository(db).ping()).resolves.toBeUndefined();
    expect(db.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("deixa o erro subir quando o banco não responde (quem decide o que fazer é o service)", async () => {
    const db = mockDeep<PrismaClient>();
    db.$queryRaw.mockRejectedValue(new Error("Can't reach database server"));

    await expect(createHealthRepository(db).ping()).rejects.toThrow("Can't reach database server");
  });
});
