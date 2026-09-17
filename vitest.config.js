import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.{js,mjs,ts,tsx}"],
    onConsoleLog() {
      return false;
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    isolate: false,
  },
});
