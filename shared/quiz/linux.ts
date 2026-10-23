/**
 * The Linux command line. Two sorts of kinds of question:
 *
 * - **Written** ones, lists of questions in `linux/*.ts`, in English, French and
 *   Spanish. Commands go between backticks and are the same in every language.
 *   A question about a tool that is not installed by default says how to
 *   install it.
 * - **Generated** ones: permissions (octal ↔ symbolic), umask, cron schedules,
 *   and what a sed, awk or parameter-expansion command prints (`linux-output.ts`).
 *
 * A written list only grows: a new question gets `since: <new QUIZ_VERSION>`,
 * so a saved test, rebuilt at its own version, draws from the list it had.
 */
import type { Rng } from "./rng";
import type { Draft, Generator, Localized, MistakeKey, Option } from "./types";
import type { Install, L3, LinuxQuestion } from "./linux/types";
import { files } from "./linux/files";
import { text } from "./linux/text";
import { shell } from "./linux/shell";
import { processes } from "./linux/processes";
import { system } from "./linux/system";
import { network } from "./linux/network";
import { tools } from "./linux/tools";
import { scripting } from "./linux/scripting";
import { git } from "./linux/git";
import { vim } from "./linux/vim";
import { awkFields, paramExpansion, sedSubstitute } from "./linux-output";

export type { Install, L3, LinuxQuestion };

const L = (t: L3): Localized => ({ en: t[0], fr: t[1], es: t[2] });

const INSTALL_LABEL: L3 = ["Not installed by default:", "Pas installé d'origine :", "No viene instalado:"];

/** The explanation, followed by how to install the tool when it needs it. */
function withInstall(e: L3, install?: Install): Localized {
  if (!install) return L(e);
  const ways = [
    `\`sudo apt install ${install.apt}\` (Debian, Ubuntu)`,
    ...(install.dnf ? [`\`sudo dnf install ${install.dnf}\` (Fedora)`] : []),
    ...(install.brew ? [`\`brew install ${install.brew}\` (macOS)`] : []),
  ].join(" · ");
  return L(e.map((text, i) => `${text} ${INSTALL_LABEL[i]} ${ways}.`) as unknown as L3);
}

export function linuxDraft(q: LinuxQuestion): Draft {
  return {
    prompt: { key: "concept", tex: "", id: q.id, text: L(q.q), ...(q.install ? { source: `📦 ${q.install.apt}` } : {}) },
    correct: { tex: `${q.id}:0`, text: L(q.a) },
    wrong: q.w.map((w, i) => ({ tex: `${q.id}:${i + 1}`, text: L(w) })),
    explanation: { key: "concept", tex: "", text: withInstall(q.e, q.install) },
    verify: { kind: "choice" },
  };
}

/** A kind drawing one question of a list, among those its test's version has. */
export const written =
  (list: readonly LinuxQuestion[]): Generator =>
  (rng: Rng, version = Number.POSITIVE_INFINITY) =>
    linuxDraft(rng.pick(list.filter((q) => (q.since ?? 2) <= version)));

// ------------------------------------------------------------- permissions

const BITS = ["r", "w", "x"];
/** One octal digit as rwx ("5" → "r-x"). */
export const triplet = (digit: number): string => BITS.map((b, i) => (digit & (4 >> i) ? b : "-")).join("");
/** A three-digit mode as ls shows it, without the type letter ("754" → "rwxr-xr--"). */
export const symbolic = (mode: number): string => [6, 3, 0].map((shift) => triplet((mode >> shift) & 7)).join("");
const octal = (mode: number): string => mode.toString(8).padStart(3, "0");
/** r=1, w=2, x=4 instead of 4, 2, 1. */
const reverseBits = (digit: number): number => ((digit & 1) << 2) | (digit & 2) | ((digit & 4) >> 2);
const perDigit = (mode: number, f: (d: number) => number): number => (f((mode >> 6) & 7) << 6) | (f((mode >> 3) & 7) << 3) | f(mode & 7);
const swapUserOther = (mode: number): number => ((mode & 7) << 6) | (mode & 0o70) | ((mode >> 6) & 7);
const swapGroupOther = (mode: number): number => (mode & 0o700) | ((mode & 7) << 3) | ((mode >> 3) & 7);

function drawMode(rng: Rng): number {
  const u = rng.pick([7, 6, 7, 6, 5]);
  const g = rng.pick([5, 4, 0, 6, 7]);
  const o = rng.pick([4, 0, 5, 1]);
  return (u << 6) | (g << 3) | o;
}

const code = (s: string): Localized => ({ en: `\`${s}\``, fr: `\`${s}\``, es: `\`${s}\`` });

const modeOption = (mode: number, as: "octal" | "symbolic", mistake?: MistakeKey): Option => ({
  tex: as === "octal" ? octal(mode) : symbolic(mode),
  ...(as === "octal" ? { num: Number(octal(mode)) } : { text: code(`-${symbolic(mode)}`) }),
  ...(mistake ? { mistake } : {}),
});

const mistakes = (mode: number): [number, MistakeKey][] => [
  [swapUserOther(mode), "permissionClassesSwapped"],
  [swapGroupOther(mode), "permissionClassesSwapped"],
  [perDigit(mode, reverseBits), "permissionWeights"],
  [perDigit(swapUserOther(mode), reverseBits), "permissionWeights"],
];

/** `chmod 754 f`: what `ls -l` shows. */
const chmodToSymbolic: Generator = (rng) => {
  const mode = drawMode(rng);
  return {
    prompt: { key: "chmodToSymbolic", tex: `\\texttt{chmod ${octal(mode)} notes.txt}` },
    correct: modeOption(mode, "symbolic"),
    wrong: mistakes(mode).map(([m, why]) => modeOption(m, "symbolic", why)),
    explanation: { key: "chmod", tex: `${octal(mode)} = ${[6, 3, 0].map((s) => `${(mode >> s) & 7}`).join("\\,|\\,")} \\to \\texttt{${symbolic(mode)}}` },
    verify: { kind: "mode", mode },
  };
};

/** `ls -l` shows -rw-r-----: the octal mode. Can be typed. */
const chmodToOctal: Generator = (rng) => {
  const mode = drawMode(rng);
  return {
    prompt: { key: "chmodToOctal", tex: `\\texttt{-${symbolic(mode)}}` },
    correct: modeOption(mode, "octal"),
    wrong: mistakes(mode).map(([m, why]) => modeOption(m, "octal", why)),
    explanation: { key: "chmod", tex: `\\texttt{${symbolic(mode)}} \\to ${[6, 3, 0].map((s) => `${(mode >> s) & 7}`).join("\\,|\\,")} = ${octal(mode)}` },
    verify: { kind: "mode", mode },
  };
};

/** After `umask 027`: modes of a new file and a new directory. */
const umask: Generator = (rng) => {
  const mask = rng.pick([0o022, 0o027, 0o077, 0o002, 0o007, 0o037]);
  const pair = (file: number, dir: number, mistake?: MistakeKey): Option => ({
    tex: `${octal(file)}/${octal(dir)}`,
    text: { en: `\`-${symbolic(file)}\` / \`d${symbolic(dir)}\``, fr: `\`-${symbolic(file)}\` / \`d${symbolic(dir)}\``, es: `\`-${symbolic(file)}\` / \`d${symbolic(dir)}\`` },
    ...(mistake ? { mistake } : {}),
  });
  const file = 0o666 & ~mask;
  const dir = 0o777 & ~mask;
  return {
    prompt: { key: "umask", tex: `\\texttt{umask ${octal(mask)}; touch f; mkdir d}` },
    correct: pair(file, dir),
    wrong: [
      pair(dir, dir, "umaskExecOnFiles"),
      pair(file, file, "umaskExecOnFiles"),
      pair(0o666 | mask, 0o777 | mask, "umaskOred"),
      pair(swapUserOther(file), swapUserOther(dir), "permissionClassesSwapped"),
      pair(mask, mask, "umaskOred"),
    ],
    explanation: { key: "umask", tex: `666 \\mathbin{\\&} \\lnot ${octal(mask)} = ${octal(file)},\\quad 777 \\mathbin{\\&} \\lnot ${octal(mask)} = ${octal(dir)}` },
    verify: { kind: "umask", mask },
  };
};

// ------------------------------------------------------------------- cron

const hhmm = (h: number, m: number): string => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
const DAILY: L3 = ["Every day at {t}", "Tous les jours à {t}", "Todos los días a las {t}"];
const WEEKDAYS: L3 = ["Monday to Friday at {t}", "Du lundi au vendredi à {t}", "De lunes a viernes a las {t}"];
const MON_FRI: L3 = ["Mondays and Fridays at {t}", "Les lundis et vendredis à {t}", "Los lunes y los viernes a las {t}"];
const DAYS_1_5: L3 = ["On days 1 to 5 of every month at {t}", "Du 1er au 5 de chaque mois à {t}", "Del día 1 al 5 de cada mes a las {t}"];
const MONTHLY: L3 = ["On the 1st of every month at {t}", "Le 1er de chaque mois à {t}", "El día 1 de cada mes a las {t}"];
const JANUARY: L3 = ["Every day in January at {t}", "Tous les jours de janvier à {t}", "Todos los días de enero a las {t}"];
const EVERY_N: L3 = ["Every {n} minutes", "Toutes les {n} minutes", "Cada {n} minutos"];
const AT_MINUTE: L3 = ["Once an hour, at minute {n}", "Une fois par heure, à la minute {n}", "Una vez por hora, en el minuto {n}"];
const EVERY_N_HOURS: L3 = ["Every {n} hours, at minute {m}", "Toutes les {n} heures, à la minute {m}", "Cada {n} horas, en el minuto {m}"];
const AT_HOUR: L3 = ["Every day at {n}:{mm}", "Tous les jours à {n} h {mm}", "Todos los días a las {n}:{mm}"];

const fill = (t: L3, values: Record<string, string | number>): Localized =>
  L(t.map((s) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k]))) as unknown as L3);

/** A crontab schedule and what it means. */
const cron: Generator = (rng) => {
  const shape = rng.pick(["daily", "weekdays", "monthly", "step", "hours"] as const);
  const m = rng.pick([0, 5, 15, 30, 45]);
  const h = rng.int(1, 11);
  const id = (s: string) => s.replace(/\s+/g, "_");
  const option = (key: string, text: Localized, mistake?: MistakeKey): Option => ({ tex: id(key), text, ...(mistake ? { mistake } : {}) });
  let schedule: string;
  let correct: Option;
  const wrong: Option[] = [];
  const t = hhmm(h, m);
  // Minute and hour read the other way round (only while it is still a time).
  const swapped = m <= 23 && m !== h ? option(`swap ${m} ${h}`, fill(DAILY, { t: hhmm(m, h) }), "cronFieldsSwapped") : null;
  switch (shape) {
    case "daily":
      schedule = `${m} ${h} * * *`;
      correct = option("daily", fill(DAILY, { t }));
      wrong.push(option("weekdays", fill(WEEKDAYS, { t }), "cronDayFields"), option("monthly", fill(MONTHLY, { t }), "cronDayFields"), option("january", fill(JANUARY, { t }), "cronDayFields"));
      if (m > 0) wrong.push(option("every", fill(EVERY_N, { n: m }), "cronStepRead"));
      break;
    case "weekdays":
      schedule = `${m} ${h} * * 1-5`;
      correct = option("weekdays", fill(WEEKDAYS, { t }));
      wrong.push(option("days15", fill(DAYS_1_5, { t }), "cronDayFields"), option("monfri", fill(MON_FRI, { t }), "cronDayFields"), option("daily", fill(DAILY, { t }), "cronDayFields"));
      break;
    case "monthly":
      schedule = `${m} ${h} 1 * *`;
      correct = option("monthly", fill(MONTHLY, { t }));
      wrong.push(option("january", fill(JANUARY, { t }), "cronDayFields"), option("monday", fill(["Mondays at {t}", "Le lundi à {t}", "Los lunes a las {t}"], { t }), "cronDayFields"), option("daily", fill(DAILY, { t }), "cronDayFields"));
      break;
    case "step": {
      const n = rng.pick([5, 10, 15, 20, 30]);
      schedule = `*/${n} * * * *`;
      correct = option("every", fill(EVERY_N, { n }));
      wrong.push(
        option("atminute", fill(AT_MINUTE, { n }), "cronStepRead"),
        option("hours", fill(EVERY_N_HOURS, { n, m: 0 }), "cronFieldsSwapped"),
        option("athour", fill(AT_HOUR, { n, mm: "00" }), "cronStepRead"),
      );
      break;
    }
    case "hours": {
      const n = rng.pick([2, 3, 4, 6, 8, 12]);
      schedule = `${m} */${n} * * *`;
      correct = option("hours", fill(EVERY_N_HOURS, { n, m }));
      wrong.push(
        option("every", fill(EVERY_N, { n }), "cronFieldsSwapped"),
        option("athour", fill(AT_HOUR, { n, mm: String(m).padStart(2, "0") }), "cronStepRead"),
        option("atminute", fill(AT_MINUTE, { n: m }), "cronStepRead"),
      );
      break;
    }
  }
  if (swapped && shape === "daily") wrong.push(swapped);
  return {
    prompt: { key: "cron", tex: `\\texttt{${schedule.replace(/\*/g, "{*}").replace(/ /g, "\\ ")}}` },
    correct: { ...correct, tex: `${correct.tex}:0` },
    wrong: wrong.map((w, i) => ({ ...w, tex: `${w.tex}:${i + 1}` })),
    explanation: { key: "cron", tex: `\\texttt{${schedule.replace(/\*/g, "{*}").replace(/ /g, "\\ ")}}` },
    verify: { kind: "choice" },
  };
};

// ------------------------------------------------------------------ kinds

/** Each list of a topic's file as a kind of question ("linuxFiles.find"). */
const kinds = (lists: Record<string, readonly LinuxQuestion[]>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(lists).map(([name, list]) => [name, written(list)]));

/** Every written Linux question, for the checks. */
export const LINUX_QUESTIONS: Record<string, Record<string, readonly LinuxQuestion[]>> = { files, text, shell, processes, system, network, tools, scripting, git, vim };

export const linuxFiles = { linux: { ...kinds(files), chmodToSymbolic, chmodToOctal, umask } };
export const linuxText = { linux: { ...kinds(text), sedSubstitute, awkFields } };
export const linuxShell = { linux: kinds(shell) };
export const linuxProcesses = { linux: { ...kinds(processes), cron } };
export const linuxSystem = { linux: kinds(system) };
export const linuxNetwork = { linux: kinds(network) };
export const linuxTools = { linux: kinds(tools) };
export const linuxScripting = { linux: { ...kinds(scripting), paramExpansion } };
export const linuxGit = { linux: kinds(git) };
export const linuxVim = { linux: kinds(vim) };
