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
import { accountView, signInView, takeInviteFromAddress, takeRedirectMessage } from "./auth";
import { at, errorText } from "./auth-i18n";
import { landingView } from "./landing";
import "@fontsource/atkinson-hyperlegible-next/latin-400.css";
import "@fontsource/atkinson-hyperlegible-next/latin-600.css";
import "@fontsource/atkinson-hyperlegible-next/latin-800.css";
import "@fontsource/atkinson-hyperlegible-mono/latin-400.css";
import "@fontsource/atkinson-hyperlegible-mono/latin-600.css";
import { DuplicateNameError, SignedOutError, auth, store, type AuthOptions, type AuthState, type User } from "./store";
import { openWorksheet, WORKSHEET_COUNT } from "./worksheet";
import { loadBank, quizView, replayTest } from "./quiz";
import { privacyView } from "./privacy";
import { subjectOf } from "../shared/quiz";
import { activityBar, activityId, forgetBooks, homeView, vocabBooks, type Activity } from "./home";
import { showVocabStats, vocabBusy, vocabView } from "./vocab";
import { qt } from "./quiz-i18n";
import { quizBusy } from "./quiz";
import { applyPendingUpdate, watchForUpdates } from "./update";
import { ASTRONOMY_LABS, BIO_LABS, PHYSICS_LABS, discoverBusy, discoverView } from "./discover/index";
import { pt } from "./discover/physics-i18n";
import { at as astroText } from "./discover/astro-i18n";
import { bt as bioText } from "./discover/bio-i18n";
import { dt } from "./discover/i18n";
import { progressView, type ProgressScope } from "./progress";
import { resetTour, tourView } from "./tour";

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

/**
 * Leaves the guided tour (#tour), however it is left: its buttons, the top
 * bar or the browser's back button. The tour is then seen and no longer opens
 * by itself (docs/user-guide.md#guided-tour).
 */
function leaveTour(): void {
  if (location.hash === "#tour") history.replaceState(null, "", location.pathname + location.search);
  if (state.auth?.authenticated && state.auth.onboarded === false) {
    state.auth.onboarded = true;
    void auth.onboarded().catch(() => undefined); // offline: it opens again next time, nothing lost
  }
}

/** The screen last painted: see `paint` in `render`. */
let lastScreen = "";

async function render(): Promise<void> {
  // The privacy page, signed in or not; its button goes back where it came from.
  if (location.hash === "#privacy") {
    app.classList.remove("is-landing", "is-wide");
    app.replaceChildren(topBar(), privacyView(state.options, () => (history.length > 1 ? history.back() : (location.hash = ""))));
    window.scrollTo(0, 0);
    lastScreen = "privacy";
    return;
  }
  if (state.auth?.authenticated && location.hash === "#tour") {
    app.classList.remove("is-landing", "is-wide");
    if (lastScreen !== "tour") window.scrollTo(0, 0);
    app.replaceChildren(topBar(), tourView({ playerSession: playerSession(), onDone: () => (leaveTour(), goHome()) }));
    lastScreen = "tour";
    return;
  }
  if (lastScreen === "tour") leaveTour(); // left by the back button or a link
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
  // The home page and the progress overview use the width of a large screen.
  // The width changes with the content, once it is ready: the screen being
  // left keeps its own width while the next one loads.
  const wide = Boolean(state.user) && ((state.view === "play" && state.settings.mode === "home") || (state.view === "progress" && progressScope === "all"));
  // Another screen opens at its top; the same screen redrawn (a choice, an answer) stays where it was.
  const screenOf = [state.view, state.settings.mode, state.settings.quizSubject, state.settings.discoverActivity, state.settings.vocabBook, progressScope].join("|");
  const paint = (...nodes: Node[]): void => {
    app.classList.toggle("is-wide", wide);
    // The kind of page counts too: a test's setup, a question and the result are three screens.
    const screen = [screenOf, ...nodes.map((n) => (n instanceof Element ? n.className : ""))].join("|");
    const y = window.scrollY;
    app.replaceChildren(...nodes);
    if (screen !== lastScreen) window.scrollTo(0, 0);
    else if (window.scrollY !== y) window.scrollTo(0, y);
    lastScreen = screen;
  };
  try {
    if (state.view === "account" && !playerSession()) {
      paint(
        topBar(),
        await accountView({
          state: state.auth,
          options: state.options ?? { providers: [], registration: false, publicUrl: location.origin },
          players: await store.listUsers(),
          onBack: () => show(state.user ? "play" : "players"),
          onSignedOut: () => signedOut(),
          rerender: () => void render(),
          onPlayersChanged: (text?: string) => {
            if (text) notice = { ok: true, text };
            void store.listUsers().then((users) => {
              if (state.user && !users.some((u) => u.id === state.user!.id)) {
                state.user = null;
                saveUserId(null);
              }
              void render();
            });
          },
        }),
      );
    } else if (!state.user || state.view === "players") {
      paint(topBar(), await playersView());
    } else if (state.view === "scores") {
      paint(topBar(), await scoresView());
    } else if (state.view === "progress") {
      const who = progressUser ?? state.user;
      await loadBank(); // the bank's units name its kinds of question
      const mine = who.id === state.user.id;
      paint(
        topBar(),
        await progressView({
          user: who,
          scope: progressScope,
          fromOverview: progressFromOverview,
          onBack: () => {
            // An activity's page opened from the overview goes back to it.
            if (progressFromOverview) {
              progressScope = "all";
              progressFromOverview = false;
              void render();
            } else show(progressBack);
          },
          onScope: (scope) => {
            progressScope = scope;
            progressFromOverview = true;
            void render();
          },
          onBook: mine
            ? (book) => {
                showVocabStats(book.id);
                updateSettings({ mode: "vocab", vocabBook: book.id });
                show("play");
              }
            : undefined,
          // A past test taken again: the same questions, on the test's page.
          onReplay: mine
            ? (spec, mode) => {
                replayTest(spec, mode);
                updateSettings({ mode: "quiz", quizSubject: subjectOf(spec.level) });
                show("play");
              }
            : undefined,
          rerender: () => void render(),
        }),
      );
    } else if (state.settings.mode !== "home" && (await hiddenNow(state.user))) {
      return goHome(); // hidden by the player's account since it was opened
    } else if (state.settings.mode === "home") {
      // The player as the server has it now: its account may have changed what it sees, or stopped sharing it.
      const fresh = (await store.listUsers()).find((u) => u.id === state.user!.id);
      if (!fresh) {
        state.user = null;
        saveUserId(null);
        return show("players");
      }
      state.user = fresh;
      paint(topBar(), await homeView({ user: fresh, open, showProgress: () => openProgress(fresh, "play", "all") }));
    } else if (state.settings.mode === "vocab") {
      const books = await vocabBooks();
      const book = books.find((b) => b.id === state.settings.vocabBook) ?? books[0];
      if (!book) return goHome();
      paint(
        topBar(),
        activityBar("", goHome), // the book's page has its own title
        await vocabView({ user: state.user, book, rerender: () => void render() }),
      );
    } else if (state.settings.mode === "discover") {
      const physics = PHYSICS_LABS.includes(state.settings.discoverActivity);
      const astronomy = ASTRONOMY_LABS.includes(state.settings.discoverActivity);
      const biology = BIO_LABS.includes(state.settings.discoverActivity);
      paint(topBar(), activityBar(biology ? bioText("group") : astronomy ? astroText("group") : physics ? pt("group") : dt("group"), goHome), discoverView(state.settings.discoverActivity, { user: state.user }));
    } else if (state.settings.mode === "quiz") {
      const user = state.user;
      const subject = state.settings.quizSubject;
      // Physical chemistry: the written questions are part of the tests, on both sides.
      if (subject === "chemistry") await loadBank();
      paint(
        topBar(),
        activityBar(qt(subject === "chemistry" ? "modeChemistry" : subject === "linux" ? "modeLinux" : subject === "chembio" ? "modeChemBio" : subject === "sql" ? "modeSql" : subject === "rust" ? "modeRust" : subject === "ts" ? "modeTs" : "modeQuiz"), goHome),
        quizView({
          user,
          subject,
          settings: state.settings,
          rerender: () => void render(),
          showProgress: () => openProgress(user, "play", subject),
        }),
      );
    } else {
      paint(
        topBar(),
        activityBar(qt("modeColumns"), goHome),
        controls(),
        state.phase === "finished" ? summary() : sheet(),
        printBar(),
      );
    }
  } catch (error) {
    if (error instanceof SignedOutError) return signedOut();
    paint(topBar(), offlineView(() => void render()));
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
// Which page: the overview, or one activity's; and whether that one was opened from the overview.
let progressScope: ProgressScope = "all";
let progressFromOverview = false;

function openProgress(user: User, back: View, scope: ProgressScope = "all"): void {
  progressUser = user;
  progressBack = back;
  progressScope = scope;
  progressFromOverview = false;
  show("progress");
}

function show(view: View): void {
  leaveTour();
  state.view = view;
  void render();
}

function next(): void {
  state.exercise = randomExercise(state.settings.operators, state.settings);
  state.phase = "answering";
  void render();
}

/** Whether the activity the settings would open is hidden for this player. */
async function hiddenNow(user: User): Promise<boolean> {
  const hidden = user.hidden ?? [];
  if (hidden.length === 0) return false;
  const { mode, quizSubject, discoverActivity, vocabBook } = state.settings;
  const activity: Activity | null =
    mode === "columns"
      ? { mode: "columns" }
      : mode === "quiz"
        ? { mode: "quiz", subject: quizSubject }
        : mode === "discover"
          ? { mode: "discover", activity: discoverActivity }
          : mode === "vocab"
            ? { mode: "vocab", book: vocabBook ?? (await vocabBooks())[0]?.id ?? -1 }
            : null;
  if (!activity) return false;
  const id = activityId(activity, activity.mode === "vocab" ? await vocabBooks() : []);
  return id !== null && hidden.includes(id);
}

/** Opens an activity from the home page. */
function open(activity: Activity): void {
  if (activity.mode === "vocab") updateSettings({ mode: "vocab", vocabBook: activity.book });
  else if (activity.mode === "discover") updateSettings({ mode: "discover", discoverActivity: activity.activity });
  else if (activity.mode === "quiz") updateSettings({ mode: "quiz", quizSubject: activity.subject ?? "maths" });
  else updateSettings({ mode: activity.mode });
  if (activity.mode === "columns") next();
  else void render();
}

function goHome(): void {
  leaveTour();
  updateSettings({ mode: "home" });
  applyPendingUpdate();
  void render();
}

/**
 * A quiet moment for a reload or a redraw: between activities (home page,
 * players, sign-in), with no vocabulary session, test or experiment under
 * way and nothing typed in a field. Inside an activity, an update waits for
 * the way back to the home page.
 */
function idle(): boolean {
  // Only between activities: the home page, the list of players, the sign-in screens.
  const between = !state.auth?.authenticated || !state.user || state.view === "players" || (state.view === "play" && state.settings.mode === "home");
  if (!between) return false;
  if (vocabBusy() || quizBusy() || discoverBusy()) return false;
  return ![...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("#app input, #app textarea")].some(
    (field) =>
      !["checkbox", "radio", "hidden", "range"].includes(field.type) && field.value.trim() !== "" && !field.disabled,
  );
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
  const user = state.user;
  if (user) bar.append(button("ghost columns-progress", qt("progress"), () => openProgress(user, "play", "columns")));
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
  // A player chosen: their home page, with what is waiting for them.
  updateSettings({ mode: "home" });
  next();
}

async function playersView(): Promise<HTMLElement> {
  const users = await store.listUsers();
  const wrap = el("section", "sheet");
  wrap.append(el("h1", "title", t("whoPlays")));

  if (users.length > 0) {
    const list = el("div", "players");
    for (const user of users) {
      const choice = button("ghost player", user.name, () => selectUser(user));
      if (user.sharedBy !== undefined) {
        choice.append(el("span", "player-shared", t("sharedMark")));
        choice.title = user.sharedBy;
      }
      list.append(choice);
    }
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
      if (!confirm(t(user.sharedBy !== undefined ? "confirmLeavePlayer" : "confirmDelete", { name: user.name }))) return;
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
    // The tour: after the first sign-in, or kept on a reload while it is open.
    const tour = location.hash === "#tour" || state.auth.onboarded === false;
    clearEntryHash();
    if (tour) {
      resetTour();
      history.replaceState(null, "", "#tour");
    }
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
    // Every visit starts on the home page.
    updateSettings({ mode: "home" });
    await render();
  } catch (error) {
    if (error instanceof SignedOutError) return signedOut();
    app.replaceChildren(topBar(), offlineView(() => void start()));
  }
}

async function start(): Promise<void> {
  // An invitation link: the sign-up form, with the code kept for this tab.
  takeInviteFromAddress();
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
// The privacy page, from anywhere and back.
window.addEventListener("hashchange", () => {
  if (location.hash === "#tour") resetTour();
  if (!state.auth?.authenticated || location.hash === "#privacy" || lastScreen === "privacy" || location.hash === "#tour" || lastScreen === "tour") void render();
});

void start();
watchForUpdates({
  idle,
  refresh: () => {
    forgetBooks();
    void render();
  },
});
