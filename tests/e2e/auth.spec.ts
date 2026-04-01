import { expect, test } from "@playwright/test";
import {
  expectHomePage,
  expectLoginPage,
  fillAuthForm,
  loginUser,
  logoutUser,
  openRegistrationMode,
  registerUser,
  uniqueCredentials
} from "./helpers";

test.describe("Authentication", () => {
  test("redirects unauthenticated visitors and completes the email auth lifecycle", async ({ page }) => {
    const credentials = uniqueCredentials("auth-lifecycle");

    await page.goto("/");
    await expectLoginPage(page);

    await registerUser(page, credentials);

    await page.goto("/login");
    await expectHomePage(page);

    await logoutUser(page);

    await page.goto("/");
    await expectLoginPage(page);

    await loginUser(page, credentials);
  });

  test("shows auth and passkey login errors, then lets the user recover with email login", async ({ page }) => {
    const credentials = uniqueCredentials("auth-errors");

    await page.route("**/api/auth/passkey/authenticate/options", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "A passkey bejelentkezés indítása most nem elérhető."
        })
      });
    });

    await page.goto("/login");
    await expectLoginPage(page);
    await page.getByRole("button", { name: "Belépés passkey-jel" }).click();
    await expect(page.getByText("A passkey bejelentkezés indítása most nem elérhető.")).toBeVisible();

    await registerUser(page, credentials);
    await logoutUser(page);

    await openRegistrationMode(page);
    await fillAuthForm(page, credentials);

    const duplicateResponsePromise = page.waitForResponse((response) => {
      return new URL(response.url()).pathname === "/api/auth/register" && response.request().method() === "POST";
    });

    await page.getByRole("button", { name: "Létrehozom a fiókot" }).click();

    const duplicateResponse = await duplicateResponsePromise;
    expect(duplicateResponse.status()).toBe(409);
    await expect(page.getByText("Ehhez az emailhez már tartozik fiók.")).toBeVisible();

    await page.getByRole("button", { name: "Belépés", exact: true }).click();
    await fillAuthForm(page, {
      email: credentials.email,
      passphrase: `${credentials.passphrase}-hibas`
    });

    const invalidLoginResponsePromise = page.waitForResponse((response) => {
      return new URL(response.url()).pathname === "/api/auth/login" && response.request().method() === "POST";
    });

    await page.getByRole("button", { name: "Belépek emaillel" }).click();

    const invalidLoginResponse = await invalidLoginResponsePromise;
    expect(invalidLoginResponse.status()).toBe(401);
    await expect(page.getByText("Hibás email vagy jelszó.")).toBeVisible();

    await fillAuthForm(page, credentials);

    const validLoginResponsePromise = page.waitForResponse((response) => {
      return new URL(response.url()).pathname === "/api/auth/login" && response.request().method() === "POST";
    });

    await page.getByRole("button", { name: "Belépek emaillel" }).click();

    const validLoginResponse = await validLoginResponsePromise;
    expect(validLoginResponse.ok()).toBeTruthy();
    await expectHomePage(page);
  });
});
