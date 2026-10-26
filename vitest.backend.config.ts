import path from "node:path";
import { defineConfig } from "vitest/config";

// Testes do backend: services/, repositories/ e lib/. Cobertura mínima de 75% das linhas.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "node",
    include: [
      "tests/services/**/*.test.ts",
      "tests/repositories/**/*.test.ts",
      "tests/lib/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      include: ["services/**/*.ts", "repositories/**/*.ts", "lib/**/*.ts"],
      exclude: [
        // Só liga o Prisma ao banco, não tem regra de negócio.
        "lib/prisma.ts",
        // TODO(#5): sai desta lista quando o auth passar a usar o auth-service (com testes).
        "lib/auth.ts",
      ],
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage/backend",
      thresholds: { lines: 75 },
    },
  },
});
