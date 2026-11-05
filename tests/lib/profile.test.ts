import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { profileService } from "@/lib/profile";

describe("profileService (ligação)", () => {
  it("expõe as operações do perfil", () => {
    expect(Object.keys(profileService).sort((a, b) => a.localeCompare(b))).toEqual(["changePassword", "get", "update"]);
  });
});
