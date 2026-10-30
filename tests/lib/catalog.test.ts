import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { catalogService } from "@/lib/catalog";

describe("catalogService (ligação com o banco)", () => {
  it("expõe a listagem e o detalhe", () => {
    expect(typeof catalogService.browse).toBe("function");
    expect(typeof catalogService.detail).toBe("function");
  });
});
