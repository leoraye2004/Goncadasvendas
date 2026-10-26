import path from "node:path";
import { defineConfig } from "vitest/config";

// Testes do frontend: components/ (jsdom). Cobertura mínima de 25% das linhas.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "jsdom",
    include: ["tests/components/**/*.test.tsx"],
    setupFiles: ["tests/setup-frontend.ts"],
    coverage: {
      provider: "v8",
      include: ["components/**/*.{ts,tsx}"],
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage/frontend",
      thresholds: { lines: 25 },
    },
  },
});
