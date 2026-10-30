import path from "node:path";
import { defineConfig } from "vitest/config";

// Testes do backend: services/, repositories/, lib/ e as rotas de app/api/. Cobertura mínima de 75% das linhas.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "node",
    include: [
      "tests/services/**/*.test.ts",
      "tests/repositories/**/*.test.ts",
      "tests/lib/**/*.test.ts",
      "tests/api/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      include: ["services/**/*.ts", "repositories/**/*.ts", "lib/**/*.ts", "app/api/**/route.ts"],
      exclude: [
        // Só liga o Prisma ao banco, não tem regra de negócio.
        "lib/prisma.ts",
        // Só entrega o NextAuth às rotas dele; a regra de login está em services/auth-service.ts.
        "app/api/auth/**",
      ],
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage/backend",
      thresholds: { lines: 75 },
    },
  },
});
