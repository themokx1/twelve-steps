import { expect, test } from "@playwright/test";

test("renders the ACA companion home", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /12 lépés megismerésére/i })).toBeVisible();
  await expect(page.getByText("ACA mini gyűlés")).toBeVisible();
  await expect(page.getByText("Empatikus, de fegyelmezett kísérés")).toBeVisible();
});

test("lets the user switch steps", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /4\. lépés/i }).click();
  await expect(page.getByText("Őszinte és gyengéd leltárt készítek magamról")).toBeVisible();
});

