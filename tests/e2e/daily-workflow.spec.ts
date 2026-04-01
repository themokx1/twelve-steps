import { expect, test } from "@playwright/test";
import { expectHomePage, expectNextTodaySave, registerUser, uniqueCredentials } from "./helpers";

test.describe("Daily workflow", () => {
  test("saves check-in, step work, and notes across a full reload", async ({ page }) => {
    const credentials = uniqueCredentials("daily-workflow");
    const promiseText = "Ma őszintén megválaszolok egy kérdést a 4. lépésből.";
    const journalEntry =
      "Ma végre észrevettem, hogy a szégyen miatt kerülöm a tiszta mondatokat, pedig pont az segítene, ha egyszerűen és igazul leírnám, mi történik bennem.";

    await registerUser(page, credentials);
    await expectHomePage(page);

    await page.getByLabel("Mit érzel most a legerősebben?").fill("Szétszórt vagyok, de közben megkönnyebbültem, hogy végre itt ülök.");
    await page.getByLabel("Mit jelez most a tested?").fill("A vállam feszült, a légzésem még kapkodó.");
    await page.getByLabel("Mire van most igazán szükséged?").fill("Nyugalomra és egyetlen tiszta következő lépésre.");

    const checkInSave = expectNextTodaySave(page);
    await page.getByLabel("Mi az egy vállalás mára?").fill(promiseText);
    await checkInSave;

    await expect(page.getByText("Megérkeztél", { exact: true })).toBeVisible();
    await expect(page.getByText("Kimondtad a szükségletet", { exact: true })).toBeVisible();
    await expect(page.getByText(promiseText)).toBeVisible();

    const stepOneCard = page
      .locator("button")
      .filter({ hasText: "1. lépés" })
      .filter({ hasText: "Beismerem, hogy egyedül nem bírom kontrollálni a régi mintákat" });
    const stepFourCard = page
      .locator("button")
      .filter({ hasText: "4. lépés" })
      .filter({ hasText: "Őszinte és gyengéd leltárt készítek magamról" });

    await page.getByPlaceholder("Keress egy lépésre, témára vagy kérdésre...").fill("vádirat");
    await expect(stepFourCard).toBeVisible();
    await expect(stepOneCard).toHaveCount(0);

    const stepSelectionSave = expectNextTodaySave(page);
    await stepFourCard.click();
    await stepSelectionSave;

    const stepDetailHeading = page.locator("h2").filter({ hasText: "Őszinte és gyengéd leltárt készítek magamról" });
    await expect(stepDetailHeading).toBeVisible();

    const practiceSave = expectNextTodaySave(page);
    await page.getByRole("button", { name: /Mintatérkép/i }).click();
    await practiceSave;

    await expect(page.getByRole("button", { name: /Mintatérkép/i })).toContainText("Kész");
    await expect(page.getByText("Mozgásban vagy")).toBeVisible();

    const journalSave = expectNextTodaySave(page);
    await page
      .getByPlaceholder(
        "Írj ide őszintén. Nem kell szépen, csak igazul. Mi történt benned? Mit láttál meg? Mi a következő tiszta lépés?"
      )
      .fill(journalEntry);
    await journalSave;

    await expect(page.getByRole("button", { name: "Munka folyamatban" })).toBeVisible();
    await expect(page.getByText("Őszinte munka")).toBeVisible();
    await expect(page.getByText(`${journalEntry.length} karakter`)).toBeVisible();

    await page.reload();

    await expectHomePage(page);
    await expect(page.getByLabel("Mit érzel most a legerősebben?")).toHaveValue(
      "Szétszórt vagyok, de közben megkönnyebbültem, hogy végre itt ülök."
    );
    await expect(page.getByLabel("Mire van most igazán szükséged?")).toHaveValue(
      "Nyugalomra és egyetlen tiszta következő lépésre."
    );
    await expect(stepDetailHeading).toBeVisible();
    await expect(page.getByRole("button", { name: /Mintatérkép/i })).toContainText("Kész");
    await expect(
      page.getByPlaceholder(
        "Írj ide őszintén. Nem kell szépen, csak igazul. Mi történt benned? Mit láttál meg? Mi a következő tiszta lépés?"
      )
    ).toHaveValue(journalEntry);
    await expect(page.getByText(promiseText)).toBeVisible();
  });
});
