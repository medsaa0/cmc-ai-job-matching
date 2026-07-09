import { test, expect } from "@playwright/test";

async function fillByLabel(page: import("@playwright/test").Page, labelText: string, value: string) {
  const input = page
    .locator(`div:has(> label:text-is("${labelText}")) input, div:has(> label:text-is("${labelText}")) textarea`)
    .first();
  await input.fill(value);
}

test.describe("Inscription entreprise", () => {
  test("email déjà utilisé affiche un message d'erreur clair (pas de crash)", async ({ page }) => {
    const email = `e2e-entreprise-${Date.now()}@example.com`;

    await page.goto("/register/entreprise");
    await fillByLabel(page, "Raison sociale *", "E2E Test SARL");
    await fillByLabel(page, "Secteur d'activité *", "IT");
    await fillByLabel(page, "Email professionnel *", email);
    await fillByLabel(page, "Mot de passe *", "password123");
    await page.click('button:has-text("Créer mon compte entreprise")');
    await page.waitForURL("**/entreprise/offres", { timeout: 10_000 });

    // Second registration attempt with the same email must show a clean error,
    // not a silent failure or a raw 500.
    await page.goto("/register/entreprise");
    await fillByLabel(page, "Raison sociale *", "E2E Test SARL 2");
    await fillByLabel(page, "Secteur d'activité *", "IT");
    await fillByLabel(page, "Email professionnel *", email);
    await fillByLabel(page, "Mot de passe *", "password123");
    await page.click('button:has-text("Créer mon compte entreprise")');

    await expect(page.locator(".bg-red-50")).toContainText("existe déjà");
  });
});
