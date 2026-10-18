import { expect, test } from "@playwright/test";
import { answerOf, board, check, focused, newPlayer, setOperations, statsOf, typeAnswer } from "./helpers";

test("additions and subtractions are written from the units, and graded by the server", async ({ page }) => {
  const request = page.request;
  const name = await newPlayer(page, "Add");
  let right = 0;
  for (let i = 0; i < 12; i++) {
    const data = await board(page);
    expect(["+", "−"]).toContain(data.operator);
    expect(await focused(page)).toBe("unités");
    const wrong = i % 4 === 3;
    await typeAnswer(page, data, wrong ? 1 : 0);
    expect(await check(page)).toBe(!wrong);
    if (wrong) await expect(page.locator(".message")).toContainText(String(answerOf(data).value));
    else right += 1;
    await page.keyboard.press("Enter");
  }
  await expect(page.locator(".score")).toHaveText(`Score : ${right}/12`);
  const stats = await statsOf(request, name);
  expect([stats.correct, stats.total]).toEqual([right, 12]);
});

test("a carry is written above the column and the cursor comes back", async ({ page }) => {
  await newPlayer(page, "Carry");
  const data = await board(page);
  await page.keyboard.type(String(answerOf(data).value % 10));
  expect(await focused(page)).toBe("dizaines");
  await page.keyboard.press("ArrowUp");
  expect(await focused(page)).toBe("retenue des dizaines");
  await page.keyboard.type("1");
  expect(await focused(page)).toBe("dizaines");
  await expect(page.locator("[aria-label='retenue des dizaines']")).toHaveValue("1");
});

test("empty answers and gaps are refused without counting", async ({ page }) => {
  await newPlayer(page, "Gap");
  await page.keyboard.press("Enter");
  await expect(page.locator(".message")).toContainText("chiffres");
  await page.locator(".box").first().fill("3");
  await page.keyboard.press("Enter");
  await expect(page.locator(".message")).toContainText("manque");
  await expect(page.locator(".score")).toHaveText("Score : 0/0");
});

test("multiplication by a two-digit number has two partial lines, then the total", async ({ page }) => {
  await newPlayer(page, "Mul");
  await setOperations(page, ["×"]);
  for (let i = 0; i < 3; i++) await page.click("[aria-label='Augmenter le maximum du multiplicateur et du diviseur']");
  // Draw until the multiplier has two digits.
  for (let i = 0; i < 100 && (await board(page)).bottom < 10; i++) {
    await setOperations(page, ["×", "÷"]);
    await setOperations(page, ["×"]);
  }
  const data = await board(page);
  expect(data.bottom).toBeGreaterThanOrEqual(10);
  expect(await focused(page)).toBe("Produit partiel 1, unités");

  for (const digit of String(data.bottom).split("").reverse()) {
    for (const ch of String(data.top * Number(digit)).split("").reverse()) await page.keyboard.type(ch);
    await page.keyboard.press("Enter");
  }
  expect(await focused(page)).toBe("unités");
  for (const ch of String(data.top * data.bottom).split("").reverse()) await page.keyboard.type(ch);
  expect(await check(page)).toBe(true);
});

test("a division needs the quotient and the remainder", async ({ page }) => {
  await newPlayer(page, "Div");
  await setOperations(page, ["÷"]);
  await expect(page.locator(".division")).toBeVisible();
  for (let i = 0; i < 6; i++) {
    const data = await board(page);
    expect(await focused(page)).toBe("Quotient, chiffre 1");
    const { value, remainder } = answerOf(data);
    await page.keyboard.type(String(value));
    await page.keyboard.press("Enter");
    await expect(page.locator(".message")).toContainText("reste");
    expect(await focused(page)).toMatch(/^Reste/);
    const wrong = i === 5;
    await page.keyboard.type(String(wrong ? (remainder! + 1) % data.bottom : remainder));
    expect(await check(page)).toBe(!wrong);
    await page.keyboard.press("Enter");
  }
});

test("settings are remembered", async ({ page }) => {
  await newPlayer(page, "Set");
  await setOperations(page, ["×", "÷"]);
  for (let i = 0; i < 3; i++) await page.click("[aria-label='Augmenter le maximum']");
  await page.reload();
  await page.locator(".board").waitFor();
  await expect(page.locator(".level-value").first()).toHaveText("400");
  for (const [op, on] of [["+", false], ["−", false], ["×", true], ["÷", true]] as const) {
    await expect(page.locator(`.operation input[value='${op}']`)).toBeChecked({ checked: on });
  }
});

test("the worksheet is a one-page A4 PDF", async ({ page }) => {
  await newPlayer(page, "Pdf");
  const pdf = await page.evaluate(async () => {
    let blob: Blob | undefined;
    const create = URL.createObjectURL;
    URL.createObjectURL = (b: Blob | MediaSource) => {
      blob = b as Blob;
      return create.call(URL, b);
    };
    window.open = () => ({}) as Window;
    document.querySelector<HTMLButtonElement>(".print button")!.click();
    return blob ? { type: blob.type, text: await blob.text() } : null;
  });
  expect(pdf?.type).toBe("application/pdf");
  expect(pdf?.text.startsWith("%PDF-1.4")).toBe(true);
  expect(pdf?.text).toContain("/MediaBox [0 0 595.28 841.89]");
  expect(pdf?.text).toContain("(Calcul en colonnes)");
  expect(pdf?.text.match(/\(\d+\.\) Tj/g)).toHaveLength(20); // 20 numbered operations
});
