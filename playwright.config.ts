import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:8787",
    locale: "hu-HU",
    serviceWorkers: "block",
    extraHTTPHeaders: {
      "accept-language": "hu-HU,hu;q=0.9"
    },
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium"
      }
    }
  ],
  webServer: {
    command: "npm run preview:e2e",
    url: "http://127.0.0.1:8787",
    reuseExistingServer: true,
    timeout: 180000
  }
});
