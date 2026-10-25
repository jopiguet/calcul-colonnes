import { expect, test, type Page } from "@playwright/test";
import { newPlayer, signIn, signUp, PASSWORD } from "./helpers";
import { OWNER_EMAIL, OWNER_PASSWORD } from "./owner";

/** The owner's account (created by the test server) on its account page. */
async function ownerAccountPage(page: Page): Promise<void> {
  await signIn(page, OWNER_EMAIL, OWNER_PASSWORD);
  await page.locator(".icon-chip").first().click();
  await page.locator(".family-admin").waitFor();
}

test("the owner invites, and chooses what the other accounts see: a private book and the bank are theirs only", async ({ page, browser }) => {
  await ownerAccountPage(page);
  await expect(page.locator(".family-admin h2")).toHaveText("👪 Famille et amis");
  await expect(page.locator(".family-mode")).toHaveText("Création de comptes : ouverte à tous.");

  // An invitation: the link shown once, then listed with its note.
  await page.fill(".family-invite input[name=note]", "Tante Rosa");
  await page.click(".family-invite button[type=submit]");
  await expect(page.locator(".family-link-input")).toHaveValue(/\/#join=[A-Za-z0-9_-]{20,}$/);
  await expect(page.locator(".family-invites .method").first()).toContainText("Tante Rosa");
  await expect(page.locator(".family-invites .method").first()).toContainText("Valable jusqu'au");

  // A member sees the Spanish book and the bank while they are shared…
  const other = await browser.newContext();
  const member = await other.newPage();
  await newPlayer(member, "Member");
  await member.locator(".home-link").click();
  await expect(member.locator("[data-activity='vocab-collins-spanish']")).toBeVisible();
  expect(((await (await member.request.get("/api/quiz/bank")).json()) as { revision: number }).revision).toBeGreaterThan(0);

  // …not once the owner keeps them.
  const spanish = page.locator(".family-content", { hasText: "3000 words and phrases · ES" });
  const bank = page.locator(".family-content", { hasText: "Questions écrites" });
  try {
    await spanish.getByText("Moi seulement").click();
    await expect(spanish.locator(".segment.on")).toHaveText("Moi seulement");
    await bank.getByText("Moi seulement").click();
    await expect(bank.locator(".segment.on")).toHaveText("Moi seulement");

    expect(((await (await member.request.get("/api/quiz/bank")).json()) as { revision: number }).revision).toBe(0);
    const books = (await (await member.request.get("/api/vocab/books")).json()) as { slug: string; id: number }[];
    expect(books.map((b) => b.slug)).not.toContain("collins-spanish");
    expect(books.map((b) => b.slug)).toContain("test-characters"); // open licence: shared
    const all = (await (await page.request.get("/api/vocab/books")).json()) as { slug: string; id: number }[];
    const id = all.find((b) => b.slug === "collins-spanish")!.id;
    const users = (await (await member.request.get("/api/users")).json()) as { id: number }[];
    expect((await member.request.get(`/api/vocab/session?userId=${users[0]!.id}&kind=all&id=${id}&purpose=learn&size=15&mode=choice`)).status()).toBe(404);
    await member.reload();
    await member.locator(".home").waitFor();
    await expect(member.locator("[data-activity='vocab-collins-spanish']")).toHaveCount(0);
  } finally {
    // The other tests' accounts see everything again.
    await spanish.getByText("Tous les comptes").click();
    await expect(spanish.locator(".segment.on")).toHaveText("Tous les comptes");
    await bank.getByText("Tous les comptes").click();
    await expect(bank.locator(".segment.on")).toHaveText("Tous les comptes");
  }
  await other.close();
});

test("a member: no owner's section; feedback reaches the owner; the data downloads; the account is deleted with everything", async ({ page, browser }) => {
  const name = await newPlayer(page, "Leaving");
  const email = await (async () => {
    await page.locator(".icon-chip").first().click();
    await page.locator(".account").waitFor();
    return (await page.locator(".account-who").innerText()).split(" · ")[1]!;
  })();
  await expect(page.locator(".family-admin")).toHaveCount(0);
  expect((await page.request.get("/api/admin")).status()).toBe(403);

  // The data, as a file.
  const download = page.waitForEvent("download");
  await page.click("text=Télécharger mes données");
  const file = await download;
  const data = JSON.parse(await (await file.createReadStream()).toArray().then((c) => Buffer.concat(c).toString("utf8"))) as {
    account: { email: string };
    players: { name: string }[];
  };
  expect(data.account.email).toBe(email);
  expect(data.players.map((p) => p.name)).toEqual([name]);
  expect(JSON.stringify(data)).not.toMatch(/scrypt|\$argon|secret/i);

  // Feedback from the home page, read on the owner's page.
  await page.click("text=Retour");
  await page.locator(".home-link").click().catch(() => undefined);
  await page.locator(".home").waitFor();
  const words = `Les grilles sont super ${Date.now()}`;
  await page.click("text=💬 Envoyer un avis");
  await page.fill(".feedback-text", words);
  await page.click(".feedback-form button[type=submit]");
  await expect(page.locator(".feedback-status")).toHaveText("✓ Merci, c'est transmis.");
  await expect(page.locator(".app-version")).toHaveText(/^Luma \d+\.\d+\.\d+$/);

  const ownerContext = await browser.newContext();
  const owner = await ownerContext.newPage();
  await ownerAccountPage(owner);
  await expect(owner.locator(".family-feedback")).toContainText(words);
  await expect(owner.locator(".family-feedback li", { hasText: words })).toContainText("Parent · home");
  await ownerContext.close();

  // Deleted: signed out, and the account no longer signs in.
  await page.locator(".icon-chip").first().click();
  page.once("dialog", (dialog) => void dialog.accept("Parent"));
  await page.click("text=Supprimer mon compte");
  await page.locator(".auth, .landing").first().waitFor();
  await page.goto("/#sign-in");
  await page.fill("input[name=identifier]", email);
  await page.fill("input[name=password]", PASSWORD);
  await page.click(".auth-form button[type=submit]");
  await expect(page.locator(".auth-message.error")).toBeVisible();
});

test("the owner's account cannot be deleted while others exist; the privacy page; never indexed", async ({ page }) => {
  await ownerAccountPage(page);
  page.once("dialog", (dialog) => void dialog.accept("Owner"));
  await page.click("text=Supprimer mon compte");
  await expect(page.locator(".account-data ~ .auth-message.error, .account .auth-message.error").last()).toContainText("propriétaire");

  await page.click(".account .privacy-link");
  await expect(page.locator(".privacy h1")).toHaveText("🔒 Confidentialité");
  await expect(page.locator(".privacy")).toContainText("Supprimer mon compte");
  await page.click("text=← Retour");
  await page.locator(".account").waitFor();

  const robots = await page.request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");
  expect((await page.request.get("/")).headers()["x-robots-tag"]).toBe("noindex, nofollow");
  await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", "noindex, nofollow");
});

test("an invitation link opens the sign-up form; the sign-in screen links the privacy page", async ({ page }) => {
  await page.goto("/#join=abcdefghijklmnopqrstuvwx");
  await expect(page).toHaveURL(/#sign-up$/);
  await expect(page.locator(".auth input[name=email]")).toBeVisible();
  await page.goto("/#sign-in");
  await page.click(".auth .privacy-link");
  await expect(page.locator(".privacy")).toBeVisible();
  // Signing up still works (open registration in the tests; invitations are checked by check:family).
  await signUp(page);
});
