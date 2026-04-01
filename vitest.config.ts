import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    passWithNoTests: true,
    exclude: [
      "node_modules/**",
      ".next/**",
      ".open-next/**",
      "playwright-report/**",
      "test-results/**",
      "tests/e2e/**"
    ]
  }
});
