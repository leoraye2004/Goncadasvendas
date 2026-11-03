import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { userService } from "@/lib/users";

describe("userService (ligação)", () => {
  it("expõe as operações de administração de usuários", () => {
    expect(Object.keys(userService).sort((a, b) => a.localeCompare(b))).toEqual(["list", "remove", "setRole"]);
  });
});
