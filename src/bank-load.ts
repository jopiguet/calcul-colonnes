/**
 * The question bank of the written questions, fetched for the tests and for
 * the progress page (its units name the bank's kinds of question). Kept apart
 * from the tests themselves so the progress page does not load them.
 */
import { registerBank } from "../shared/quiz/bank";
import { quizBank } from "./store";

let bankLoadedAt = 0;
/** The bank changes only on an import: asked again after a few minutes. */
const BANK_FOR = 5 * 60_000;

/**
 * Loads the question bank for the tests that have written questions. A failure
 * keeps the bank already loaded (or none): the tests then have only calculations.
 */
export async function loadBank(): Promise<void> {
  if (Date.now() - bankLoadedAt < BANK_FOR) return;
  try {
    registerBank(await quizBank.load());
    bankLoadedAt = Date.now();
  } catch {
    // offline: generated questions only
  }
}
