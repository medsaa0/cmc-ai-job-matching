import { test, expect } from "@playwright/test";

// Garde de non-regression pour le bug corrige le 2026-07-08 : une filiere mal
// orthographiee ("developpment degital") ne matchait aucune Filiere connue en
// base, ce qui faisait tomber le matching dans son repli neutre (aucun
// filtrage par domaine). Le champ Filiere doit maintenant avertir clairement
// l'utilisateur quand la valeur saisie n'est pas reconnue.
test.describe("Selection de filiere (inscription lauréat)", () => {
  test("avertit sur une filiere non reconnue, propose une suggestion, se corrige au clic", async ({ page }) => {
    await page.goto("/register/laureat");

    const emailInput = page.locator('div:has(> label:text-is("Email *")) input');
    await page.locator('div:has(> label:text-is("Nom complet *")) input').fill("E2E Test");
    await emailInput.fill(`e2e-laureat-${Date.now()}@example.com`);
    await page.locator('div:has(> label:text-is("Mot de passe *")) input').fill("password123");
    await page.click('button:has-text("Suivant")');

    await page.locator('div:has(> label:text-is("Nom *")) input').fill("Test");
    await page.locator('div:has(> label:text-is("Prénom *")) input').fill("E2E");

    const filiereInput = page.locator('input[placeholder="Rechercher une filière..."]');
    await filiereInput.fill("developpment degital");
    await expect(page.getByText("Filière non reconnue")).toBeVisible();

    await filiereInput.fill("Developpement");
    await expect(page.getByRole("button", { name: /Developpement Digital/ })).toBeVisible();
    await page.getByRole("button", { name: /Developpement Digital/ }).click();

    await expect(page.getByText("Filière non reconnue")).not.toBeVisible();
    await expect(filiereInput).toHaveValue("Developpement Digital");
  });
});
