/**
 * When a kind of question is to be reviewed or acquired, from the player's
 * latest answers to it (newest first):
 *   - to review: one of the last two answers is wrong; it comes back in the
 *     next tests until it is answered right twice in a row;
 *   - acquired: right the last three times;
 *   - in progress: otherwise.
 */
export type SkillStatus = "review" | "learning" | "mastered";

/** Answers shown on the progress page. */
export const RECENT = 5;

export function skillStatus(recent: boolean[]): SkillStatus {
  if (recent[0] === false || recent[1] === false) return "review";
  if (recent.length >= 3 && recent.slice(0, 3).every(Boolean)) return "mastered";
  return "learning";
}
