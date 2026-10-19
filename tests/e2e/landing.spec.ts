import { expect, test } from "@playwright/test";
import { PASSWORD, signUp } from "./helpers";

test("a first visit shows the landing page, which leads to sign-up and sign-in", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".landing")).toBeVisible();
  await expect(page.locator(".hero-board")).toHaveAttribute("aria-label", /478/);

  await page.locator(".hero-cta a.primary").click();
  await expect(page).toHaveURL(/#sign-up$/);
  await expect(page.locator(".auth input[name=email]")).toBeVisible();

  await page.goBack();
  await expect(page.locator(".landing")).toBeVisible();
  await page.locator(".hero-cta a.quiet").click(); // the header link is hidden at phone width
  await expect(page.locator(".auth input[name=identifier]")).toBeVisible();

  await page.locator(".back-home").click();
  await expect(page.locator(".landing")).toBeVisible();
});

test("the landing page is translated, with no missing text", async ({ page }) => {
  await page.goto("/");
  for (const [lang, title] of [
    ["es", "Cálculo en columnas, como en el cuaderno."],
    ["en", "Column arithmetic, the way it's written in the exercise book."],
    ["fr", "Le calcul posé, comme dans le cahier."],
  ]) {
    await page.selectOption(".language", lang!);
    await expect(page.locator(".hero-title")).toHaveText(title!);
    expect(await page.locator("#app").innerText()).not.toMatch(/undefined|\{\w+\}/);
  }
});

test("a browser that has signed in before opens on the sign-in form", async ({ page }) => {
  const email = await signUp(page);
  await expect(page).toHaveURL(/\/$/); // #sign-up removed once signed in
  await page.click(".icon-chip");
  await page.click(".account .actions button:last-child");
  await page.goto("/");
  await expect(page.locator(".auth input[name=identifier]")).toBeVisible();
  await expect(page.locator(".landing")).toHaveCount(0);

  await page.fill("input[name=identifier]", email);
  await page.fill("input[name=password]", PASSWORD);
  await page.click(".auth-form button[type=submit]");
  await expect(page.locator(".new-player input")).toBeVisible();
});
