import { expect, type APIRequestContext, type Page, type Request } from "@playwright/test";
import { generateQuiz, gradeQuiz, resolveAnswers, type Level, type Question } from "../../shared/quiz/index.ts";
import type { NewQuizResult, Profile, User, UserStats } from "../../shared/types.ts";

let counter = 0;

/** A player name unique within the run (names are at most 20 characters). */
export function uniqueName(base: string): string {
  counter += 1;
  return `${base}${counter}${Date.now() % 1000}`.slice(0, 20);
}

export const PASSWORD = "correct horse battery";

/** An email address unique within the run. */
export function uniqueEmail(base = "parent"): string {
  counter += 1;
  return `${base}.${counter}.${Date.now()}@example.test`.toLowerCase();
}

/** Opens the sign-up form and creates an account; ends on "Who's playing?". */
export async function signUp(page: Page, email = uniqueEmail(), password = PASSWORD): Promise<string> {
  await page.goto("/#sign-up");
  await page.locator(".auth").waitFor();
  await page.fill("input[name=name]", "Parent");
  await page.fill("input[name=email]", email);
  await page.fill("input[name=password]", password);
  await page.click(".auth-form button[type=submit]");
  await page.locator(".new-player input").waitFor();
  return email;
}

/** Signs in on the sign-in screen with an email or a username. */
export async function signIn(page: Page, identifier: string, password = PASSWORD): Promise<void> {
  await page.goto("/#sign-in");
  await page.locator(".auth").waitFor();
  await page.fill("input[name=identifier]", identifier);
  await page.fill("input[name=password]", password);
  await page.click(".auth-form button[type=submit]");
  await page.locator(".auth").waitFor({ state: "detached" });
}

/**
 * Signs up a fresh account (each test has its own browser context, so it starts
 * signed out) and creates a player; ends on the column arithmetic screen.
 */
export async function newPlayer(page: Page, base: string): Promise<string> {
  const name = uniqueName(base);
  await signUp(page);
  await page.fill(".new-player input", name);
  await page.keyboard.press("Enter");
  await openActivity(page, "columns");
  return name;
}

/**
 * Back to the home page, from wherever the app is. The home page is drawn
 * after its data arrives: until then the previous screen, with its ← link, is
 * still there, and may be replaced in the middle of a click. So: click the
 * link if there is one, and try again until the home page shows.
 */
export async function goHome(page: Page): Promise<void> {
  await expect(async () => {
    if (await page.locator(".home").isVisible()) return;
    const link = page.locator(".home-link");
    if (await link.isVisible()) await link.click({ timeout: 1_000 }).catch(() => undefined);
    await page.locator(".home").waitFor({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
}

/**
 * Opens an activity from the home page (going back there first if needed):
 * "columns", "quiz", "vocab-<book id>" or "discover-<activity>".
 */
export async function openActivity(page: Page, activity: string): Promise<void> {
  await goHome(page);
  await page.locator(`[data-activity='${activity}']`).click();
  await page
    .locator(
      activity === "columns" ? ".board" : activity === "quiz" || activity === "chemistry" || activity === "linux" || activity === "chembio" || activity === "sql" || activity === "rust" ? ".quiz-setup, .quiz" : activity.startsWith("discover-") ? ".discover-lab" : ".vocab-home",
    )
    .first()
    .waitFor();
}

export interface BoardData {
  operator: string;
  top: number;
  bottom: number;
}

export async function board(page: Page): Promise<BoardData> {
  return page.locator(".board").evaluate((b: HTMLElement) => ({
    operator: b.dataset.operator ?? "",
    top: Number(b.dataset.top),
    bottom: Number(b.dataset.bottom),
  }));
}

export function answerOf({ operator, top, bottom }: BoardData): { value: number; remainder: number | null } {
  switch (operator) {
    case "+":
      return { value: top + bottom, remainder: null };
    case "−":
      return { value: top - bottom, remainder: null };
    case "×":
      return { value: top * bottom, remainder: null };
    default:
      return { value: Math.floor(top / bottom), remainder: top % bottom };
  }
}

/** Label of the focused element (the boxes are labelled by column). */
export const focused = (page: Page): Promise<string | null> =>
  page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? null);

/**
 * Types an answer the way a child does: column operations from the units
 * leftwards, divisions from the left (quotient, then remainder).
 * Multiplications by a two-digit number go straight to the total line.
 */
export async function typeAnswer(page: Page, data: BoardData, delta = 0): Promise<void> {
  const { value, remainder } = answerOf(data);
  if (data.operator === "÷") {
    await page.keyboard.type(String(value));
    await page.keyboard.press("Enter"); // asks for the remainder and moves there
    await page.keyboard.type(String((remainder! + delta) % data.bottom));
    return;
  }
  if (data.operator === "×" && data.bottom >= 10) await page.locator(".grid .box:not(.partial)").last().click();
  for (const digit of String(value + delta).split("").reverse()) await page.keyboard.type(digit);
}

/** Checks the current answer and returns the server's verdict. */
export async function check(page: Page): Promise<boolean> {
  const response = page.waitForResponse("**/api/attempts");
  await page.keyboard.press("Enter");
  const body = (await (await response).json()) as { correct: boolean };
  return body.correct;
}

export async function setOperations(page: Page, wanted: string[]): Promise<void> {
  for (const op of ["+", "−", "×", "÷"]) {
    const box = page.locator(`.operation input[value='${op}']`);
    if ((await box.isChecked()) !== wanted.includes(op) && wanted.includes(op)) await box.click();
  }
  for (const op of ["+", "−", "×", "÷"]) {
    const box = page.locator(`.operation input[value='${op}']`);
    if ((await box.isChecked()) !== wanted.includes(op)) await box.click();
  }
}

// ------------------------------------------------------------------- API

export async function userByName(request: APIRequestContext, name: string): Promise<User> {
  const users = (await (await request.get("/api/users")).json()) as User[];
  const user = users.find((u) => u.name === name);
  expect(user, `player ${name}`).toBeTruthy();
  return user!;
}

export async function statsOf(request: APIRequestContext, name: string): Promise<UserStats> {
  const stats = (await (await request.get("/api/stats?since=0")).json()) as UserStats[];
  const entry = stats.find((s) => s.user.name === name);
  expect(entry, `stats of ${name}`).toBeTruthy();
  return entry!;
}

export async function profileOf(request: APIRequestContext, name: string): Promise<Profile> {
  const user = await userByName(request, name);
  return (await (await request.get(`/api/users/${user.id}/profile?since=0`)).json()) as Profile;
}

// ------------------------------------------------------------------ quiz

/** The test the browser submitted, rebuilt independently from its definition. */
export function rebuild(body: NewQuizResult): { questions: Question[]; correct: number } {
  const questions = generateQuiz({
    seed: body.seed,
    level: body.level as Level,
    topics: body.topics as never,
    count: body.count,
    focus: body.focus ?? [],
    version: body.version,
    ...(typeof body.bank === "number" ? { bank: body.bank } : {}),
  });
  return { questions, correct: gradeQuiz(questions, resolveAnswers(questions, body.answers, body.mode ?? "choices")) };
}

/**
 * Answers a test in which some questions are typed: `typed(i)` gives the text
 * for a question shown with a field, `pick(i)` the option for the others.
 */
export async function takeMixedQuiz(
  page: Page,
  typed: (index: number) => string,
  pick: (index: number) => number,
): Promise<{ body: NewQuizResult; server: { correct: number; total: number }; typedAt: number[] }> {
  await page.locator(".choices, .typed-input").first().waitFor();
  const count = Number((await page.locator(".quiz-count").innerText()).split("/")[1]);
  const typedAt: number[] = [];
  for (let i = 0; i < count; i++) {
    await expect(page.locator(".quiz-count")).toHaveText(new RegExp(`Question ${i + 1} /`));
    if ((await page.locator(".typed-input").count()) > 0) {
      typedAt.push(i);
      await page.locator(".typed-input").fill(typed(i));
    } else if (pick(i) >= 0) await page.locator(".choice").nth(pick(i)).click();
    if (i < count - 1) await page.locator(".quiz .actions button.primary").click();
  }
  page.once("dialog", (dialog) => void dialog.accept());
  const request = page.waitForRequest("**/api/quizzes");
  const response = page.waitForResponse("**/api/quizzes");
  await page.locator(".quiz .actions button.primary").click();
  const body = (await request).postDataJSON() as NewQuizResult;
  const server = (await (await response).json()) as { correct: number; total: number };
  await expect(page.locator("#quiz-status")).not.toHaveText(/…/);
  return { body, server, typedAt };
}

/**
 * Answers every question of the test on screen (option index chosen by `pick`,
 * -1 for a blank) and finishes it. Returns what was submitted and the server's mark.
 */
export async function takeQuiz(
  page: Page,
  pick: (index: number) => number,
): Promise<{ body: NewQuizResult; server: { correct: number; total: number } }> {
  await page.locator(".choices").waitFor();
  const count = Number((await page.locator(".quiz-count").innerText()).split("/")[1]);
  for (let i = 0; i < count; i++) {
    const choice = pick(i);
    if (choice >= 0) await page.locator(".choice").nth(choice).click();
    if (i < count - 1) await page.locator(".quiz .actions button.primary").click();
  }
  page.once("dialog", (dialog) => void dialog.accept()); // blank answers ask for confirmation
  const request = page.waitForRequest("**/api/quizzes");
  const response = page.waitForResponse("**/api/quizzes");
  await page.locator(".quiz .actions button.primary").click();
  const body = (await request).postDataJSON() as NewQuizResult;
  const server = (await (await response).json()) as { correct: number; total: number };
  await expect(page.locator("#quiz-status")).not.toHaveText(/…/);
  return { body, server };
}

/** Request of the last test submitted (for tests that need the payload). */
export type QuizRequest = Request;

/**
 * Ticks exactly these topics (their names as shown) in the test's settings,
 * whatever was ticked before. Ticks first, then unticks: one stays ticked.
 */
export async function chooseTopics(page: Page, names: string[]): Promise<void> {
  const labels = page.locator(".topics .topic");
  const count = await labels.count();
  for (const pass of ["tick", "untick"] as const) {
    for (let i = 0; i < count; i++) {
      const label = labels.nth(i);
      const name = (await label.innerText()).trim();
      const box = label.locator("input");
      const want = names.includes(name);
      if (pass === "tick" && want && !(await box.isChecked())) await box.check();
      if (pass === "untick" && !want && (await box.isChecked())) await box.uncheck();
    }
  }
  for (const name of names) await expect(page.locator(".topics .topic", { hasText: name }).locator("input")).toBeChecked();
}
