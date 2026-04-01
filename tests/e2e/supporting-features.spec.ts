import { expect, test } from "@playwright/test";
import { expectHomePage, registerUser, uniqueCredentials } from "./helpers";

test.describe("Supporting features", () => {
  test("keeps the AI companion usable through quick prompts, manual input, and reload", async ({ page }) => {
    const credentials = uniqueCredentials("companion");
    let replyCount = 0;

    await page.route("**/api/ai/companion", async (route) => {
      replyCount += 1;
      const body = route.request().postDataJSON() as { message?: string };
      const incomingMessage = body.message ?? "ismeretlen";

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          toneLabel: `Teszt hang #${replyCount}`,
          response: `Válasz #${replyCount}: ${incomingMessage}`,
          focusQuestion: "Mi a következő igaz mondatod?",
          microAction: "Írj le egy rövid mondatot a jegyzetedbe.",
          affirmation: "Megérdemled, hogy jó történjen veled.",
          boundary: "Most maradj ennél az egy témánál."
        })
      });
    });

    await registerUser(page, credentials);
    await expectHomePage(page);

    await page.getByRole("button", { name: "Adj egy pici következő lépést a mai munkámhoz." }).click();
    await expect(page.getByText("Válasz #1: Adj egy pici következő lépést a mai munkámhoz.")).toBeVisible();

    await page.getByPlaceholder("Mi történik most benned a(z) beismerem, hogy egyedül nem bírom kontrollálni a régi mintákat körül?").fill(
      "Most attól félek, hogy megint túl sokat akarok egyszerre megoldani."
    );
    await page.getByRole("button", { name: /Beszéljük át a 1\. lépést/i }).click();

    await expect(page.getByText("Válasz #2: Most attól félek, hogy megint túl sokat akarok egyszerre megoldani.")).toBeVisible();
    await expect(page.getByText("Teszt hang #2")).toBeVisible();

    await page.reload();

    await expectHomePage(page);
    await expect(page.getByText("Válasz #1: Adj egy pici következő lépést a mai munkámhoz.")).toBeVisible();
    await expect(page.getByText("Válasz #2: Most attól félek, hogy megint túl sokat akarok egyszerre megoldani.")).toBeVisible();
  });

  test("shows passkey creation errors in the account panel without breaking the rest of the session", async ({ page }) => {
    const credentials = uniqueCredentials("passkey-create");

    await page.route("**/api/auth/passkey/register/options", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "A passkey létrehozása most nem indítható el."
        })
      });
    });

    await registerUser(page, credentials);
    await expectHomePage(page);

    await page.getByRole("button", { name: "Passkey hozzáadása" }).click();
    await expect(page.getByText("A passkey létrehozása most nem indítható el.")).toBeVisible();
    await expect(page.getByText(credentials.email)).toBeVisible();
  });

  test("supports the notification opt-in fallback flow when only a local confirmation is available", async ({
    page
  }) => {
    const credentials = uniqueCredentials("notifications");

    await page.route("**/api/notifications/public-key", async (route) => {
      await route.fulfill({
        status: 204,
        body: ""
      });
    });

    await page.addInitScript(() => {
      let permission = "default";
      const registration = {
        showNotification: async () => {
          window.__notificationShownCount = (window.__notificationShownCount ?? 0) + 1;
        },
        pushManager: {
          getSubscription: async () => null,
          subscribe: async () => ({
            toJSON: () => ({
              endpoint: "https://example.com/subscription",
              expirationTime: null,
              keys: {
                p256dh: "test-p256dh",
                auth: "test-auth"
              }
            })
          })
        }
      };

      Object.defineProperty(window, "Notification", {
        configurable: true,
        value: {
          get permission() {
            return permission;
          },
          requestPermission: async () => {
            permission = "granted";
            return permission;
          }
        }
      });

      Object.defineProperty(navigator, "serviceWorker", {
        configurable: true,
        value: {
          register: async () => registration,
          ready: Promise.resolve(registration)
        }
      });

      window.__notificationShownCount = 0;
    });

    await registerUser(page, credentials);
    await expectHomePage(page);

    await page.getByRole("button", { name: "Kérek emlékeztetőket" }).click();

    await expect(
      page.getByText(
        "Az engedély rendben van. Ha később beállítjuk a VAPID kulcsokat, a szerveres push is azonnal működni fog."
      )
    ).toBeVisible();
    await expect(page.getByText("Engedélyezve")).toBeVisible();
    await expect(page.getByRole("button", { name: "Értesítések aktívak" })).toBeVisible();

    const notificationCount = await page.evaluate(() => window.__notificationShownCount);
    expect(notificationCount).toBe(1);
  });
});
