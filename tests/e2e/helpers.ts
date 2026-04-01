import { expect, type Page } from "@playwright/test";

export type TestCredentials = {
  email: string;
  passphrase: string;
};

const LOGIN_HEADING = /Biztonságos belépés emaillel vagy passkey-jel/i;
const HOME_HEADING = /Meleg, letisztult tér a 12 lépés megismerésére/i;

export function uniqueCredentials(prefix: string): TestCredentials {
  const suffix = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toLowerCase();

  return {
    email: `${suffix}@example.com`,
    passphrase: `BiztonsagosJelszo!${suffix}`
  };
}

export async function expectLoginPage(page: Page) {
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: LOGIN_HEADING })).toBeVisible();
}

export async function expectHomePage(page: Page) {
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: HOME_HEADING })).toBeVisible();
  await expect(page.getByText("Empatikus, de fegyelmezett kísérés")).toBeVisible();
}

export async function openRegistrationMode(page: Page) {
  await page.getByRole("button", { name: "Fiók létrehozása" }).click();
  await expect(page.getByRole("heading", { name: /Hozd létre a saját helyedet/i })).toBeVisible();
}

export async function fillAuthForm(page: Page, credentials: TestCredentials) {
  await page.getByPlaceholder("Email cím").fill(credentials.email);
  await page.getByPlaceholder("Legalább 12 karakteres jelszó").fill(credentials.passphrase);
}

export async function registerUser(page: Page, credentials: TestCredentials) {
  await page.goto("/login");
  await expectLoginPage(page);
  await openRegistrationMode(page);
  await fillAuthForm(page, credentials);

  const responsePromise = page.waitForResponse((response) => {
    return new URL(response.url()).pathname === "/api/auth/register" && response.request().method() === "POST";
  });

  await page.getByRole("button", { name: "Létrehozom a fiókot" }).click();

  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  await expectHomePage(page);
}

export async function loginUser(page: Page, credentials: TestCredentials) {
  await page.goto("/login");
  await expectLoginPage(page);
  await fillAuthForm(page, credentials);

  const responsePromise = page.waitForResponse((response) => {
    return new URL(response.url()).pathname === "/api/auth/login" && response.request().method() === "POST";
  });

  await page.getByRole("button", { name: "Belépek emaillel" }).click();

  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  await expectHomePage(page);
}

export async function logoutUser(page: Page) {
  const responsePromise = page.waitForResponse((response) => {
    return new URL(response.url()).pathname === "/api/auth/logout" && response.request().method() === "POST";
  });

  await page.getByRole("button", { name: "Kilépés" }).click();

  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  await expectLoginPage(page);
}

export function expectNextTodaySave(page: Page) {
  return (async () => {
    const response = await page.waitForResponse((nextResponse) => {
      return new URL(nextResponse.url()).pathname === "/api/today" && nextResponse.request().method() === "POST";
    });

    expect(response.ok()).toBeTruthy();
    await expect(page.getByText("A mai állapotod el lett mentve D1-be.")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Elmentve")).toBeVisible();
  })();
}
