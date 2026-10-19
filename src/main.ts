import "./style.css";
import type { Operator } from "../shared/types";
import { columnBoard, divisionBoard } from "./boards";
import { button, el } from "./dom";
import { randomExercise, type Exercise } from "./exercise";
import { LANGUAGES, isLang, setLang, t, type Key } from "./i18n";
import {
  LEVELS,
  OPERATORS,
  SMALL_LEVELS,
  loadSettings,
  loadUserId,
  saveSettings,
  saveUserId,
  type Settings,
} from "./settings";
import { accountView, signInView, takeRedirectMessage } from "./auth";
import { at, errorText } from "./auth-i18n";
import { landingView } from "./landing";
import "@fontsource/atkinson-hyperlegible-next/latin-400.css";
import "@fontsource/atkinson-hyperlegible-next/latin-600.css";
import "@fontsource/atkinson-hyperlegible-next/latin-800.css";
import "@fontsource/atkinson-hyperlegible-mono/latin-400.css";
import "@fontsource/atkinson-hyperlegible-mono/latin-600.css";
import { DuplicateNameError, SignedOutError, auth, store, type AuthOptions, type AuthState, type User } from "./store";
import { openWorksheet, WORKSHEET_COUNT } from "./worksheet";
import { quizView } from "./quiz";
import { vocabView } from "./vocab";
import { vt } from "./vocab-i18n";
import { qt } from "./quiz-i18n";
import { progressView } from "./progress";

const NAME_LENGTH = 20;

type Phase = "answering" | "checked" | "finished";
type View = "play" | "players" | "scores" | "progress" | "account";

interface State {
  /** Who is signed in; null until known. */
  auth: AuthState | null;
  options: AuthOptions | null;
  view: View;
  user: User | null;
  settings: Settings;
  exercise: Exercise;
  score: number;
  questions: number;
  phase: Phase;
}

const settings = loadSettings();
setLang(settings.lang);

const state: State = {
  auth: null,
  options: null,
  view: "players",
  user: null,
  settings,
  exercise: randomExercise(settings.operators, settings),
  score: 0,
  questions: 0,
  phase: "answering",
};

const app = document.querySelector<HTMLElement>("#app")!;

const OPERATION_NAMES: Record<Operator, Key> = {
  "+": "addition",
  "−": "subtraction",
  "×": "multiplication",
  "÷": "division",
};

function updateSettings(change: Partial<Settings>): void {
  Object.assign(state.settings, change);
  saveSettings(state.settings);
}

// ------------------------------------------------------------------ rendering

/** A player signed in on their own login: they see only themselves. */
const playerSession = (): boolean => Boolean(state.auth?.player);

/** One-time message after a provider sign-in (?auth=… in the address). */
let notice: { ok: boolean; text: string } | null = null;

/** Signed-out screens: #sign-in, #sign-up, or the landing page. */
type Entry = "landing" | "signIn" | "signUp";

/** This browser has been signed in before: skip the landing page. */
const RETURNING_KEY = "calcul-colonnes:returning";
function isReturning(): boolean {
  try {
    return localStorage.getItem(RETURNING_KEY) === "1";
  } catch {
    return false;
  }
}
function markReturning(): void {
  try {
    localStorage.setItem(RETURNING_KEY, "1");
  } catch {
    // private browsing: the landing page shows again next time
  }
}

function entry(): Entry {
  if (location.hash === "#sign-up") return "signUp";
  if (location.hash === "#about") return "landing";
  if (location.hash === "#sign-in" || notice || isReturning()) return "signIn";
  return "landing";
}

/** Leaves #sign-in / #sign-up out of the address once signed in. */
function clearEntryHash(): void {
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
}

async function render(): Promise<void> {
  if (!state.auth?.authenticated) {
    const options = state.options ?? { providers: [], registration: true, publicUrl: location.origin };
    const where = entry();
    app.classList.toggle("is-landing", where === "landing");
    if (where === "landing") {
      app.replaceChildren(landingView({ options, topBar: topBar() }));
    } else {
      const bar = topBar();
      const brand = el("a", "brand", "Luma");
      brand.href = "#about";
      bar.firstElementChild?.append(brand);
      app.replaceChildren(bar, signInView(options, () => void enter(true), notice, where === "signUp" ? "signUp" : "signIn"));
    }
    notice = null;
    return;
  }
  app.classList.remove("is-landing");
  try {
    if (state.view === "account" && !playerSession()) {
      app.replaceChildren(
        topBar(),
        await accountView({
          state: state.auth,
          options: state.options ?? { providers: [], registration: false, publicUrl: location.origin },
          players: await store.listUsers(),
          onBack: () => show(state.user ? "play" : "players"),
          onSignedOut: () => signedOut(),
          rerender: () => void render(),
        }),
      );
    } else if (!state.user || state.view === "players") {
      app.replaceChildren(topBar(), await playersView());
    } else if (state.view === "scores") {
      app.replaceChildren(topBar(), await scoresView());
    } else if (state.view === "progress") {
      const who = progressUser ?? state.user;
      app.replaceChildren(topBar(), await progressView(who, () => show(progressBack)));
    } else if (state.settings.mode === "vocab") {
      app.replaceChildren(topBar(), modeTabs(), await vocabView({ user: state.user, rerender: () => void render() }));
    } else if (state.settings.mode === "quiz") {
      const user = state.user;
      app.replaceChildren(
        topBar(),
        modeTabs(),
        quizView({
          user,
          settings: state.settings,
          rerender: () => void render(),
          showProgress: () => openProgress(user, "play"),
        }),
      );
    } else {
      app.replaceChildren(
        topBar(),
        modeTabs(),
        controls(),
        state.phase === "finished" ? summary() : sheet(),
        printBar(),
      );
    }
  } catch (error) {
    if (error instanceof SignedOutError) return signedOut();
    app.replaceChildren(topBar(), offlineView(() => void render()));
  }
  if (notice) {
    const banner = el("p", `auth-message ${notice.ok ? "ok" : "error"} banner`, notice.text);
    banner.setAttribute("role", "status");
    app.insertBefore(banner, app.children[1] ?? null);
    notice = null;
  }
}

/** Back to the sign-in screen (signed out here, or the session ended). */
function signedOut(): void {
  state.auth = { authenticated: false };
  state.user = null;
  state.score = 0;
  state.questions = 0;
  state.view = "players";
  void render();
}

// Whose progress page is shown, and where its Back button leads.
let progressUser: User | null = null;
let progressBack: View = "play";

function openProgress(user: User, back: View): void {
  progressUser = user;
  progressBack = back;
  show("progress");
}

function show(view: View): void {
  state.view = view;
  void render();
}

function next(): void {
  state.exercise = randomExercise(state.settings.operators, state.settings);
  state.phase = "answering";
  void render();
}

/** Column arithmetic or multiple-choice tests. */
function modeTabs(): HTMLElement {
  const tabs = el("nav", "segmented tabs");
  for (const [mode, label] of [
    ["columns", qt("modeColumns")],
    ["quiz", qt("modeQuiz")],
    ["vocab", vt("modeVocab")],
  ] as const) {
    const on = state.settings.mode === mode;
    const tab = button(on ? "segment on" : "segment", label, () => {
      if (on) return;
      updateSettings({ mode });
      if (mode === "columns") next();
      else void render();
    });
    tab.setAttribute("aria-pressed", String(on));
    tabs.append(tab);
  }
  return tabs;
}

/** Player and scores on the left (while playing), language on the right (always). */
function topBar(): HTMLElement {
  const bar = el("header", "bar");

  const left = el("div", "chips");
  if (state.user && state.view === "play") {
    if (playerSession()) {
      // A player's own session: no switching, and a way to sign out.
      const who = el("span", "chip-label", `👤 ${state.user.name}`);
      who.title = at("playerSession");
      left.append(who, button("ghost chip", `🏆 ${t("scores")}`, () => show("scores")));
      const out = button("ghost chip icon-chip", "🚪", async () => {
        await auth.logout().catch(() => undefined);
        signedOut();
      });
      out.setAttribute("aria-label", at("signOut"));
      out.title = at("signOut");
      left.append(out);
    } else {
      const player = button("ghost chip", `👤 ${state.user.name}`, () => show("players"));
      player.setAttribute("aria-label", t("changePlayer", { name: state.user.name }));
      left.append(player, button("ghost chip", `🏆 ${t("scores")}`, () => show("scores")));
    }
  }
  if (state.auth?.authenticated && !playerSession() && state.view !== "account") {
    const account = button("ghost chip icon-chip", "⚙️", () => show("account"));
    account.setAttribute("aria-label", at("account"));
    account.title = at("account");
    left.append(account);
  }

  const language = el("select", "language");
  language.setAttribute("aria-label", t("language"));
  for (const { code, label } of LANGUAGES) {
    const option = el("option", undefined, label);
    option.value = code;
    option.selected = code === state.settings.lang;
    language.append(option);
  }
  language.addEventListener("change", () => {
    if (!isLang(language.value)) return;
    updateSettings({ lang: language.value });
    setLang(language.value);
    // A checked exercise cannot be redrawn as it was: move on to the next one.
    if (state.view === "play" && state.settings.mode === "columns" && state.phase === "checked") next();
    else void render();
  });

  bar.append(left, language);
  return bar;
}

function stepper(
  levels: number[],
  value: number,
  labels: { text: Key; group: Key; decrease: Key; increase: Key },
  onChange: (value: number) => void,
): HTMLElement {
  const group = el("div", "level");
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", t(labels.group));
  const index = levels.indexOf(value);
  const step = (delta: -1 | 1, symbol: string, name: Key): HTMLButtonElement => {
    const target = levels[index + delta];
    const node = button("ghost step", symbol, () => {
      if (target !== undefined) onChange(target);
    });
    node.disabled = target === undefined;
    node.setAttribute("aria-label", t(name));
    return node;
  };
  group.append(
    el("span", undefined, t(labels.text)),
    step(-1, "−", labels.decrease),
    el("output", "level-value", String(value)),
    step(1, "+", labels.increase),
  );
  return group;
}

/** Maximum, score, operations to practise and, for × and ÷, the limit of the small number. */
function controls(): HTMLElement {
  const wrap = el("div", "controls");
  const { maximum, smallLimit, operators } = state.settings;

  const first = el("div", "bar");
  first.append(
    stepper(
      LEVELS,
      maximum,
      { text: "upTo", group: "maximumGroup", decrease: "decreaseMaximum", increase: "increaseMaximum" },
      (value) => {
        updateSettings({ maximum: value });
        next();
      },
    ),
    el("p", "score", t("score", { score: state.score, questions: state.questions })),
  );

  const second = el("div", "bar");
  const choices = el("fieldset", "operations");
  choices.append(el("legend", "visually-hidden", t("operations")));
  for (const operator of OPERATORS) {
    const label = el("label", "operation");
    const box = el("input");
    box.type = "checkbox";
    box.value = operator;
    box.checked = operators.includes(operator);
    box.setAttribute("aria-label", t(OPERATION_NAMES[operator]));
    box.addEventListener("change", () => {
      const chosen = OPERATORS.filter((candidate) =>
        candidate === operator ? box.checked : state.settings.operators.includes(candidate),
      );
      if (chosen.length === 0) {
        box.checked = true; // at least one operation stays selected
        return;
      }
      updateSettings({ operators: chosen });
      next();
    });
    label.append(box, el("span", undefined, operator));
    choices.append(label);
  }
  second.append(choices);

  if (operators.includes("×") || operators.includes("÷")) {
    second.append(
      stepper(
        SMALL_LEVELS,
        smallLimit,
        { text: "smallUpTo", group: "smallGroup", decrease: "decreaseSmall", increase: "increaseSmall" },
        (value) => {
          updateSettings({ smallLimit: value });
          next();
        },
      ),
    );
  }

  wrap.append(first, second);
  return wrap;
}

function printBar(): HTMLElement {
  const bar = el("footer", "print");
  bar.append(
    button("ghost", t("worksheet", { count: WORKSHEET_COUNT }), () =>
      openWorksheet(state.settings.operators, state.settings),
    ),
  );
  return bar;
}

// ------------------------------------------------------------------ exercise

function sheet(): HTMLElement {
  const { exercise } = state;
  const wrap = el("section", "sheet");

  const message = el("p", "message");
  message.setAttribute("role", "status");
  const unsaved = el("p", "note");
  unsaved.setAttribute("role", "status");

  const main = button("primary", t("check"), () => (state.phase === "checked" ? next() : check()));
  const quit = button("ghost", t("finish"), () => {
    state.phase = "finished";
    void render();
  });
  const actions = el("div", "actions");
  actions.append(main, quit);

  const events = { onEnter: () => check(), onEdit: () => (message.textContent = "") };
  const board =
    exercise.operator === "÷"
      ? divisionBoard(exercise, state.settings, events)
      : columnBoard(exercise, state.settings, events);

  function check(): void {
    const answer = board.read();
    if (answer.kind === "problem") {
      message.className = "message warn";
      message.textContent = t(answer.message);
      answer.focus();
      return;
    }
    const correct = answer.value === exercise.answer && answer.remainder === exercise.remainder;
    state.questions += 1;
    if (correct) state.score += 1;
    state.phase = "checked";

    if (state.user) {
      // One row per answered operation. A failed write must not stop the exercise,
      // but the player is told that this answer was not recorded.
      void store
        .addAttempt({
          userId: state.user.id,
          maximum: state.settings.maximum,
          operator: exercise.operator,
          top: exercise.top,
          bottom: exercise.bottom,
          given: answer.value,
          givenRemainder: answer.remainder,
        })
        .catch(() => {
          unsaved.textContent = t("unsaved");
        });
    }

    message.className = correct ? "message good" : "message bad";
    if (correct) message.textContent = t("correct");
    else if (exercise.remainder === null) message.textContent = t("wrong", { answer: exercise.answer });
    else {
      message.textContent = t("wrongDivision", {
        quotient: exercise.answer,
        remainder: exercise.remainder,
      });
    }
    board.lock();
    main.textContent = t("next");
    main.focus();
    app.querySelector(".score")!.textContent = t("score", {
      score: state.score,
      questions: state.questions,
    });
  }

  wrap.append(board.node, message, unsaved, actions);
  queueMicrotask(() => board.focus());
  return wrap;
}

function summary(): HTMLElement {
  const wrap = el("section", "sheet");
  wrap.append(
    el("p", "final", t("finalScore", { score: state.score, questions: state.questions })),
  );
  const again = button("primary", t("restart"), () => {
    state.score = 0;
    state.questions = 0;
    next();
  });
  wrap.append(again);
  queueMicrotask(() => again.focus());
  return wrap;
}

// ------------------------------------------------------- players and scores

function selectUser(user: User): void {
  if (state.user?.id !== user.id) {
    state.score = 0;
    state.questions = 0;
  }
  state.user = user;
  saveUserId(user.id);
  state.view = "play";
  next();
}

async function playersView(): Promise<HTMLElement> {
  const users = await store.listUsers();
  const wrap = el("section", "sheet");
  wrap.append(el("h1", "title", t("whoPlays")));

  if (users.length > 0) {
    const list = el("div", "players");
    for (const user of users) list.append(button("ghost player", user.name, () => selectUser(user)));
    wrap.append(list);
  }

  const form = el("form", "new-player");
  const input = el("input");
  input.type = "text";
  input.maxLength = NAME_LENGTH;
  input.placeholder = t("newName");
  input.autocomplete = "off";
  input.setAttribute("aria-label", t("newName"));
  const add = el("button", "primary", t("add"));
  add.type = "submit";
  form.append(input, add);

  const error = el("p", "message warn");
  error.setAttribute("role", "status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = input.value.trim().replace(/\s+/g, " ");
    if (name === "") {
      error.textContent = t("nameRequired");
      input.focus();
      return;
    }
    try {
      selectUser(await store.addUser(name));
    } catch (cause) {
      error.textContent = t(cause instanceof DuplicateNameError ? "nameTaken" : "nameFailed");
      input.focus();
    }
  });
  input.addEventListener("input", () => (error.textContent = ""));

  wrap.append(form, error);
  if (state.user) wrap.append(button("ghost", t("back"), () => show("play")));
  if (users.length === 0) queueMicrotask(() => input.focus());
  return wrap;
}

/** A player's name in a score table: opens their progress page. */
function nameCell(user: User): HTMLElement {
  const cell = el("td", "name");
  const link = button("link", user.name, () => openProgress(user, "scores"));
  link.title = qt("progressOf", { name: user.name });
  cell.append(link);
  return cell;
}

async function scoresView(): Promise<HTMLElement> {
  const stats = await store.stats();
  const wrap = el("section", "sheet");
  wrap.append(el("h1", "title", `🏆 ${t("scores")}`));

  const table = el("table", "scores");
  const head = el("tr");
  for (const label of [t("player"), t("today"), t("total"), t("successRate"), ""]) {
    head.append(el("th", undefined, label));
  }
  table.append(head);

  for (const { user, total, correct, todayTotal, todayCorrect } of stats) {
    const row = el("tr", user.id === state.user?.id ? "current" : undefined);
    row.append(
      nameCell(user),
      el("td", undefined, `${todayCorrect}/${todayTotal}`),
      el("td", undefined, `${correct}/${total}`),
      el("td", undefined, total === 0 ? "—" : `${Math.round((100 * correct) / total)} %`),
    );
    const remove = button("ghost icon", "🗑️", async () => {
      if (!confirm(t("confirmDelete", { name: user.name }))) return;
      try {
        await store.deleteUser(user.id);
      } catch {
        alert(t("deleteFailed"));
        return;
      }
      if (state.user?.id === user.id) {
        state.user = null;
        state.score = 0;
        state.questions = 0;
        saveUserId(null);
      }
      void render(); // back to the player list if the current player was removed
    });
    remove.setAttribute("aria-label", t("deletePlayer", { name: user.name }));
    const cell = el("td");
    if (!playerSession()) cell.append(remove);
    row.append(cell);
    table.append(row);
  }

  // Multiple-choice tests, for the players who took some.
  const quizPlayers = stats.filter((s) => s.quizTests > 0);
  const extra: HTMLElement[] = [];
  if (quizPlayers.length > 0) {
    const quiz = el("table", "scores");
    const quizHead = el("tr");
    for (const label of [t("player"), qt("tests"), qt("answers"), t("successRate")]) {
      quizHead.append(el("th", undefined, label));
    }
    quiz.append(quizHead);
    for (const { user, quizTests, quizCorrect, quizQuestions } of quizPlayers) {
      const row = el("tr", user.id === state.user?.id ? "current" : undefined);
      row.append(
        nameCell(user),
        el("td", undefined, String(quizTests)),
        el("td", undefined, `${quizCorrect}/${quizQuestions}`),
        el("td", undefined, `${Math.round((100 * quizCorrect) / quizQuestions)} %`),
      );
      quiz.append(row);
    }
    extra.push(el("h2", "subtitle", `📐 ${qt("quizScores")}`), quiz);
  }

  wrap.append(table, ...extra, button("primary", t("back"), () => show("play")));
  return wrap;
}

/** Shown when the server (and so the database) cannot be reached. */
function offlineView(retry: () => void): HTMLElement {
  const wrap = el("section", "sheet");
  wrap.append(
    el("h1", "title", t("offlineTitle")),
    el("p", "note", t("offlineText")),
    button("primary", t("retry"), retry),
  );
  return wrap;
}

/** After signing in (or on load with a session): pick the player and show the app. */
async function enter(justSignedIn = false): Promise<void> {
  try {
    state.auth = await auth.session();
    if (!state.auth.authenticated) {
      // The sign-in succeeded but no cookie came back: the browser dropped it
      // (Secure cookie over http, or another address than PUBLIC_URL).
      if (justSignedIn) notice = { ok: false, text: errorText("cookie_refused", { url: state.options?.publicUrl ?? location.origin }) };
      return void render();
    }
    markReturning();
    clearEntryHash();
    const users = await store.listUsers();
    if (state.auth.player) {
      // A player's own login: that player, nobody else.
      state.user = users.find((user) => user.id === state.auth?.player?.id) ?? null;
      state.view = "play";
    } else {
      const savedId = loadUserId();
      state.user = users.find((user) => user.id === savedId) ?? null;
      state.view = state.user ? "play" : "players";
    }
    state.score = 0;
    state.questions = 0;
    await render();
  } catch (error) {
    if (error instanceof SignedOutError) return signedOut();
    app.replaceChildren(topBar(), offlineView(() => void start()));
  }
}

async function start(): Promise<void> {
  try {
    state.options = await auth.options();
  } catch {
    app.replaceChildren(topBar(), offlineView(() => void start()));
    return;
  }
  notice = takeRedirectMessage(state.options);
  await enter();
}

// Landing page ↔ sign-in screen, and the browser's Back button between them.
window.addEventListener("hashchange", () => {
  if (!state.auth?.authenticated) void render();
});

void start();
