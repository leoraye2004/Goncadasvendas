import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { favoriteService } from "@/lib/favorites";

describe("favoriteService (ligação)", () => {
  it("expõe as operações de favoritos", () => {
    expect(Object.keys(favoriteService).sort((a, b) => a.localeCompare(b))).toEqual(["add", "isFavorite", "list", "remove"]);
  });
});
