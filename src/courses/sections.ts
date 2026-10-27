/**
 * Where each test question is taught in its course: the `##` section, from 0
 * (the introduction). By its skill when one is listed, else by its topic.
 * No Vite here, so the checks (server/check-courses.ts) read it too.
 */
/** Sections by topic: the `##` heading, from 0 (the introduction). */
const TOPIC_SECTION: Record<string, number> = {
  // Cloudflare: 0 how to use, 1–11 the parts, 12 exercises, 13 sources.
  cfDns: 2,
  cfTls: 3,
  cfCache: 4,
  cfSecurity: 6,
  cfWorkers: 7,
  cfStorage: 8,
  cfZeroTrust: 9,
  cfAi: 10,
  // Capital: 0 how to read, 1–12 the parts, 13 exercises, 14 sources.
  marxCommodity: 1,
  marxMoney: 2,
  marxSurplus: 3,
  marxWorkingDay: 4,
  marxRelative: 5,
  marxWages: 6,
  marxAccumulation: 7,
  marxPrimitive: 8,
  marxCirculation: 9,
  marxReproduction: 10,
  marxProfit: 11,
  marxCredit: 12,
};

/** Kinds taught in another section than their topic's. */
const SKILL_SECTION: Record<string, number> = {
  "cfSecurity.phaseOrder": 1,
  "cfSecurity.ruleMatch": 5,
};

export function sectionOf(topic: string, skill: string): number | null {
  return SKILL_SECTION[skill] ?? TOPIC_SECTION[topic] ?? null;
}
