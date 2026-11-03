import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { addressService } from "@/lib/addresses";

describe("addressService (ligação)", () => {
  it("expõe as operações de endereço", () => {
    expect(Object.keys(addressService).sort((a, b) => a.localeCompare(b))).toEqual(
      ["create", "get", "list", "remove", "update"],
    );
  });
});
