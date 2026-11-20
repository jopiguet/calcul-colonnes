import type { AuthOptions, AuthState, ReadingMode, SignInMethod, User, UserPrefs, VocabBookInfo } from "../shared/types";
import { activityCatalog, vocabBooks } from "./home";
import { readingCourse } from "../shared/reading";
import type { CourseInfo } from "../shared/lessons/api";
import { at, errorText, type AuthKey } from "./auth-i18n";
import { button, el } from "./dom";
import { currentLang, t } from "./i18n";
import { ApiError, auth, lessons, store, workbook } from "./store";
import { dataSection, familySection } from "./family";

/**
 * Sign-in screen and account page. Sign-in with a provider is a full-page
 * navigation to the server (/api/auth/oauth/<id>/start), which comes back to
 * the app with ?auth=… or ?auth_error=… in the address.
 */

const errorOf = (e: unknown): string => (e instanceof ApiError ? e.code : "unknown");

function field(label: string, type: string, name: string, autocomplete: string): HTMLLabelElement {
  const wrap = el("label", "field");
  const input = el("input");
  input.type = type;
  input.name = name;
  input.setAttribute("autocomplete", autocomplete);
  input.required = true;
  wrap.append(el("span", "field-label", label), input);
  return wrap;
}

const value = (form: HTMLFormElement, name: string): string =>
  (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";

function message(): HTMLParagraphElement {
  const node = el("p", "auth-message");
  node.setAttribute("role", "status");
  return node;
}

function showError(node: HTMLElement, text: string): void {
  node.className = "auth-message error";
  node.textContent = text;
}

function showOk(node: HTMLElement, text: string): void {
  node.className = "auth-message ok";
  node.textContent = text;
}

function providerLink(id: string, name: string, href: string, key: AuthKey): HTMLAnchorElement {
  const link = el("a", `provider provider-${id}`, at(key, { provider: name }));
  link.href = href;
  return link;
}

/** One-time message carried in the address after a provider redirect (?auth=… / ?auth_error=…). */
export function takeRedirectMessage(options: AuthOptions | null): { ok: boolean; text: string } | null {
  const params = new URLSearchParams(location.search);
  const ok = params.get("auth");
  const error = params.get("auth_error");
  if (!ok && !error) return null;
  history.replaceState(null, "", location.pathname);
  if (ok) return { ok: true, text: at(`auth.${ok}` as AuthKey) ?? "" };
  const provider = options?.providers[0]?.name ?? "";
  return { ok: false, text: errorText(error!, { provider }) };
}

// ------------------------------------------------------------- invitations

const INVITE_KEY = "luma-invite";

/**
 * An invitation link (…/#join=<code>) opens the sign-up form: the code is
 * kept for this tab (also through a provider's round trip) and the address
 * becomes #sign-up. Returns whether there was one.
 */
export function takeInviteFromAddress(): boolean {
  const match = /^#join=([A-Za-z0-9_-]{8,100})$/.exec(location.hash);
  if (!match) return false;
  try {
    sessionStorage.setItem(INVITE_KEY, match[1]!);
  } catch {
    // private browsing: the code is kept in memory below
  }
  memoryInvite = match[1]!;
  history.replaceState(null, "", "#sign-up");
  return true;
}

let memoryInvite: string | null = null;

/** The invitation this tab came with, if any. */
export function pendingInvite(): string | null {
  try {
    return sessionStorage.getItem(INVITE_KEY) ?? memoryInvite;
  } catch {
    return memoryInvite;
  }
}

function forgetInvite(): void {
  memoryInvite = null;
  try {
    sessionStorage.removeItem(INVITE_KEY);
  } catch {
    // nothing kept
  }
}

// ------------------------------------------------------------- sign-in screen

export function signInView(
  options: AuthOptions,
  onSignedIn: () => void,
  notice: { ok: boolean; text: string } | null,
  initial: "signIn" | "signUp" = "signIn",
): HTMLElement {
  let mode: "signIn" | "signUp" = initial === "signUp" && options.registration ? "signUp" : "signIn";
  const wrap = el("section", "sheet auth");

  const draw = (): void => {
    const title = el("h1", "title", at(mode === "signIn" ? "signInTitle" : "signUpTitle"));
    const status = message();
    if (notice) (notice.ok ? showOk : showError)(status, notice.text);

    const form = el("form", "auth-form");
    const invite = pendingInvite();
    // Sign-up by invitation only, and no invitation: say so instead of a form that would be refused.
    const noInvite = mode === "signUp" && options.invite === true && !invite;
    if (noInvite) {
      form.hidden = true;
      showError(status, at("inviteOnly"));
    } else if (mode === "signUp" && options.invite && invite) {
      void auth.inviteUsable(invite).then(
        (r) => (r.usable ? showOk : showError)(status, at(r.usable ? "inviteOk" : "error.invite_invalid")),
        () => undefined,
      );
    }
    if (mode === "signUp") {
      form.append(
        field(at("name"), "text", "name", "name"),
        field(at("email"), "email", "email", "email"),
        field(at("password"), "password", "password", "new-password"),
        el("p", "hint", at("passwordHint")),
      );
    } else {
      form.append(
        field(at("identifier"), "text", "identifier", "username"),
        field(at("password"), "password", "password", "current-password"),
      );
    }
    const submit = el("button", "primary", at(mode === "signIn" ? "signIn" : "signUp"));
    submit.type = "submit";
    form.append(submit);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      submit.disabled = true;
      try {
        if (mode === "signIn") await auth.login(value(form, "identifier"), value(form, "password"));
        else await auth.register(value(form, "name"), value(form, "email"), value(form, "password"), invite ?? undefined);
        if (mode === "signUp") forgetInvite();
        notice = null;
        onSignedIn();
      } catch (e) {
        showError(status, errorText(errorOf(e), { url: options.publicUrl }));
        submit.disabled = false;
      }
    });

    const parts: HTMLElement[] = [title, status, form];
    if (options.providers.length > 0 && !noInvite) {
      const list = el("div", "providers");
      // Signing up with a provider takes the invitation along (signing in ignores it).
      for (const p of options.providers) list.append(providerLink(p.id, p.name, auth.providerUrl(p.id, "login", undefined, invite ?? undefined), "continueWith"));
      parts.push(el("p", "or", at("or")), list);
    }
    if (options.registration) {
      parts.push(
        button("link switch", at(mode === "signIn" ? "toSignUp" : "toSignIn"), () => {
          mode = mode === "signIn" ? "signUp" : "signIn";
          notice = null;
          // Keeps the address in step, so Back and a reload land on the same form.
          history.replaceState(null, "", mode === "signUp" ? "#sign-up" : "#sign-in");
          draw();
        }),
      );
    }
    const home = el("a", "back-home", at("aboutApp"));
    home.href = "#about";
    const privacy = el("a", "privacy-link", at("privacyLink"));
    privacy.href = "#privacy";
    parts.push(home, privacy);
    wrap.replaceChildren(...parts);
    queueMicrotask(() => form.querySelector("input")?.focus());
  };

  draw();
  return wrap;
}

// ------------------------------------------------------------- account page

interface AccountContext {
  state: AuthState;
  options: AuthOptions;
  players: User[];
  onBack(): void;
  onSignedOut(): void;
  rerender(): void;
  /** A player was added or left: the app's player list changes too. */
  onPlayersChanged(notice?: string): void;
  /** The section open, and moving to another one (the address follows: #settings/<section>). */
  section: SettingsSection;
  onSection(section: SettingsSection): void;
  /** The player in play, chosen first on the players' section. */
  currentPlayer: number | null;
}

function providerName(options: AuthOptions, id: string): string {
  return options.providers.find((p) => p.id === id)?.name ?? id;
}

function methodLine(m: SignInMethod, options: AuthOptions, removable: boolean, onRemove: () => void): HTMLElement {
  const item = el("li", "method");
  const what = m.type === "password" ? at("methodPassword") : providerName(options, m.provider);
  const text = el("div", "method-text");
  text.append(el("span", "method-name", what), el("span", "method-label", m.label ?? ""));
  if (m.lastUsedAt) {
    text.append(el("span", "method-used", at("lastUsed", { date: new Date(m.lastUsedAt).toLocaleDateString(currentLang()) })));
  }
  const remove = button("ghost small", at("remove"), onRemove);
  remove.disabled = !removable;
  item.append(text, remove);
  return item;
}

/** The parts of the settings page (#settings/<section>); the owner's two only for the owner. */
export const SETTINGS_SECTIONS = ["players", "account", "content", "family", "data"] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];
const SECTION_TITLE: Record<SettingsSection, AuthKey> = {
  players: "sectionPlayers",
  account: "sectionAccount",
  content: "sectionContent",
  family: "sectionFamily",
  data: "sectionData",
};

/** The player whose settings are open: kept while the page is redrawn. */
let chosenPlayer: number | null = null;
/** Activity groups opened on the players' section, by group name. */
const openGroups = new Set<string>();

/** A part of a section that opens and closes: a <details> with its title. */
function part(title: string, className: string, open: boolean, ...children: (Node | string)[]): HTMLDetailsElement {
  const box = el("details", `settings-part ${className}`);
  box.open = open;
  const summary = el("summary", "settings-part-title", title);
  box.append(summary, ...children);
  return box;
}

export async function accountView(ctx: AccountContext): Promise<HTMLElement> {
  const { state } = ctx;
  const owner = state.account?.owner === true;
  const sections = SETTINGS_SECTIONS.filter((s) => owner || (s !== "content" && s !== "family"));
  const section: SettingsSection = sections.includes(ctx.section) ? ctx.section : "players";
  const wrap = el("section", "sheet account settings");
  wrap.dataset.section = section;
  const status = message();

  // Sections: tabs on a wide screen, a drop-down list on a phone (docs/user-guide.md#settings).
  const nav = el("nav", "settings-nav");
  nav.setAttribute("aria-label", at("settingsSection"));
  const tabs = el("div", "settings-tabs");
  tabs.setAttribute("role", "tablist");
  const pick = el("select", "settings-select");
  pick.setAttribute("aria-label", at("settingsSection"));
  for (const s of sections) {
    const tab = button(s === section ? "settings-tab on" : "settings-tab", at(SECTION_TITLE[s]), () => ctx.onSection(s));
    tab.dataset.section = s;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", String(s === section));
    tabs.append(tab);
    const option = el("option", undefined, at(SECTION_TITLE[s]));
    option.value = s;
    option.selected = s === section;
    pick.append(option);
  }
  pick.addEventListener("change", () => ctx.onSection(pick.value as SettingsSection));
  nav.append(tabs, pick);

  wrap.append(
    el("h1", "title", at("accountTitle")),
    el("p", "account-who", [state.account?.name, state.account?.email].filter(Boolean).join(" · ")),
    nav,
    status,
  );
  const body = el("div", "settings-body");
  body.setAttribute("role", "tabpanel");
  wrap.append(body);

  const fail = (e: unknown): void => {
    showError(status, errorText(errorOf(e)));
    status.scrollIntoView({ block: "nearest" });
  };

  if (section === "players") body.append(...(await playersSection(ctx, fail)));
  else if (section === "account") body.append(...(await accountSection(ctx, status, fail)));
  else if (section === "data") body.append(...dataSection({ state, onDeleted: ctx.onSignedOut }));
  else {
    const parts = await familySection(state);
    body.append(...(parts ? (section === "content" ? parts.content : parts.family) : []));
  }

  const back = button("primary settings-back", t("back"), ctx.onBack);
  wrap.append(back);
  return wrap;
}

/** Ways to sign in, password, devices. */
async function accountSection(ctx: AccountContext, status: HTMLElement, fail: (e: unknown) => void): Promise<HTMLElement[]> {
  const { state, options } = ctx;
  const methods = await auth.methods();
  const own = methods.filter((m) => m.playerId === null);
  const out: HTMLElement[] = [];
  const remove = (m: SignInMethod) => async () => {
    if (!confirm(at("confirmRemove"))) return;
    try {
      await auth.removeMethod(m.id);
      ctx.rerender();
    } catch (e) {
      fail(e);
    }
  };

  out.push(el("h2", "subtitle", at("methods")));
  const list = el("ul", "methods account-methods");
  for (const m of own) list.append(methodLine(m, options, own.length > 1, remove(m)));
  out.push(list);
  const linkable = options.providers.filter((p) => !own.some((m) => m.type === "oauth" && m.provider === p.id));
  if (linkable.length > 0) {
    const links = el("div", "providers");
    for (const p of linkable) links.append(providerLink(p.id, p.name, auth.providerUrl(p.id, "link"), "link"));
    out.push(links);
  }

  const hasPassword = own.some((m) => m.type === "password");
  const pw = el("form", "auth-form compact");
  if (hasPassword) pw.append(field(at("currentPassword"), "password", "current", "current-password"));
  if (!hasPassword && !state.account?.email) pw.append(field(at("email"), "email", "email", "email"));
  pw.append(field(at("newPassword"), "password", "password", "new-password"), el("p", "hint", at("passwordHint")));
  const pwSave = el("button", "primary", at("save"));
  pwSave.type = "submit";
  pw.append(pwSave);
  pw.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await auth.setPassword(value(pw, "password"), value(pw, "current") || undefined, value(pw, "email") || undefined);
      showOk(status, at("saved"));
      if (!hasPassword) ctx.rerender();
      pw.reset();
    } catch (e) {
      fail(e);
    }
  });
  out.push(part(at(hasPassword ? "changePassword" : "setPassword"), "settings-password", !hasPassword, pw));

  out.push(el("h2", "subtitle", at("devices")));
  const devices = el("div", "actions wrap");
  devices.append(
    button("ghost", at("signOutOthers"), async () => {
      await auth.logoutOthers();
      showOk(status, at("signedOutOthers"));
    }),
    button("ghost", at("signOut"), async () => {
      await auth.logout();
      ctx.onSignedOut();
    }),
  );
  out.push(devices);
  return out;
}

/** One player at a time, chosen in a list: display, activities, sharing, own sign-in; then adding a shared player. */
async function playersSection(ctx: AccountContext, fail: (e: unknown) => void): Promise<HTMLElement[]> {
  const { options } = ctx;
  const out: HTMLElement[] = [el("p", "hint left", at("playersHint"))];
  const players = ctx.players;
  if (!players.some((p) => p.id === chosenPlayer)) {
    chosenPlayer = players.find((p) => p.id === ctx.currentPlayer)?.id ?? players[0]?.id ?? null;
  }
  const player = players.find((p) => p.id === chosenPlayer);

  if (player) {
    const choose = el("label", "field settings-player-field");
    const select = el("select", "settings-player");
    select.name = "player";
    for (const p of players) {
      const option = el("option", undefined, p.sharedBy !== undefined ? at("playerShared", { player: p.name, name: p.sharedBy }) : p.name);
      option.value = String(p.id);
      option.selected = p.id === player.id;
      select.append(option);
    }
    select.addEventListener("change", () => {
      chosenPlayer = Number(select.value);
      ctx.rerender();
    });
    choose.append(el("span", "field-label", at("playerChoice")), select);
    out.push(choose);

    const block = el("div", "player-login");
    block.dataset.player = String(player.id);
    block.append(el("h3", "player-login-name", player.name));
    out.push(block);

    if (player.sharedBy !== undefined) {
      // Another account's player: it can only be left.
      block.append(
        el("p", "method-label", at("sharedBy", { name: player.sharedBy })),
        el("p", "hint left", at("sharedPlayerHint")),
        button("ghost small", at("leave", { player: player.name }), async () => {
          if (!confirm(at("confirmLeave", { player: player.name, name: player.sharedBy ?? "" }))) return;
          try {
            await store.deleteUser(player.id);
            chosenPlayer = null;
            ctx.onPlayersChanged();
          } catch (e) {
            fail(e);
          }
        }),
      );
    } else {
      const books = await vocabBooks().catch(() => [] as VocabBookInfo[]);
      // The workbooks and courses this account sees (the first player's view of them is enough for their names).
      const first = players.find((p) => p.sharedBy === undefined) ?? player;
      const exerciseBooks = await workbook.books(first.id).catch(() => []);
      const courses = await lessons.courses(first.id).catch(() => [] as CourseInfo[]);
      block.append(
        displayPart(player, books, courses, fail),
        activitiesPart(player, activityCatalog(books, exerciseBooks, courses), fail),
        await sharingPart(ctx, player, fail),
      );
      const methods = await auth.methods().catch(() => [] as SignInMethod[]);
      block.append(loginPart(ctx, player, methods, options, fail));
    }
  } else {
    out.push(el("p", "empty small", at("noPlayers")));
  }

  // A player another account shares with this one.
  const join = el("form", "auth-form compact join-share");
  join.append(el("p", "hint", at("joinHint")), field(at("shareCode"), "text", "code", "off"));
  const joinButton = el("button", "primary", at("join"));
  joinButton.type = "submit";
  join.append(joinButton);
  join.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const joined = await store.joinShare(value(join, "code"));
      chosenPlayer = joined.id;
      ctx.onPlayersChanged(at("joined", { player: joined.name }));
    } catch (e) {
      fail(e);
    }
  });
  out.push(part(`➕ ${at("joinTitle")}`, "settings-join", players.length === 0, join));
  return out;
}

/**
 * Readings in Latin letters (rōmaji, transliterations): the player's own choice per course, kept on the server
 * (User.prefs.readings). A language course's words and letters share a line; any other book with readings is its own.
 */
function displayPart(player: User, books: VocabBookInfo[], courses: CourseInfo[], fail: (e: unknown) => void): HTMLElement {
  const lines = new Map<string, string>();
  for (const book of books) {
    if (book.readings === 0 && book.kind !== "characters") continue;
    const key = readingCourse(book.slug);
    if (lines.has(key)) continue;
    const course = courses.find((c) => key === `course-${c.id}`);
    lines.set(key, course ? `${course.icon} ${course.title}` : `${book.kind === "characters" ? "✍️" : "💬"} ${book.title}`);
  }
  const list = el("div", "settings-readings");
  for (const [key, label] of [...lines].sort((a, b) => a[1].replace(/^\S+\s/, "").localeCompare(b[1].replace(/^\S+\s/, ""), currentLang()))) {
    const row = el("label", "settings-reading-row");
    row.dataset.course = key;
    const select = el("select", "settings-reading");
    for (const [mode, text] of [["always", "readingAlways"], ["after", "readingAfter"], ["never", "readingNever"]] as const) {
      const option = el("option", undefined, at(text));
      option.value = mode;
      select.append(option);
    }
    const current = (): ReadingMode => player.prefs?.readings?.[key] ?? player.prefs?.reading ?? "always";
    select.value = current();
    select.addEventListener("change", async () => {
      const before = player.prefs ?? {};
      const next: UserPrefs = { ...before, readings: { ...before.readings, [key]: select.value as ReadingMode } };
      try {
        await store.setPrefs(player.id, next);
        player.prefs = next;
      } catch (e) {
        select.value = current();
        fail(e);
      }
    });
    row.append(el("span", "settings-reading-name", label), select);
    list.append(row);
  }
  const children: HTMLElement[] = [el("p", "field-label", at("readingsAll"))];
  children.push(lines.size ? list : el("p", "empty small", at("readingsNone")), el("p", "hint left", at("readingsHint")));
  return part(`👁️ ${at("display")}`, "settings-display", true, ...children);
}

/** The activities on the player's home page: a group per subject, each with its count and All / None. */
function activitiesPart(player: User, catalog: ReturnType<typeof activityCatalog>, fail: (e: unknown) => void): HTMLElement {
  const hidden = new Set(player.hidden ?? []);
  const shown = el("div", "player-activities");
  const saved = el("span", "hint player-activities-saved");
  saved.setAttribute("role", "status");
  const save = async (undo: () => void): Promise<void> => {
    try {
      await store.setHidden(player.id, [...hidden]);
      player.hidden = [...hidden];
      saved.textContent = at("saved");
    } catch (e) {
      undo();
      fail(e);
    }
  };
  for (const { group, activities } of catalog) {
    if (activities.length === 0) continue;
    const box = el("details", "topic-group settings-group");
    box.open = openGroups.has(group);
    box.addEventListener("toggle", () => (box.open ? openGroups.add(group) : openGroups.delete(group)));
    const summary = el("summary", "settings-group-title");
    const count = el("span", "settings-group-count");
    summary.append(el("span", "topic-group-name", group), count);
    box.append(summary);
    const boxes: HTMLInputElement[] = [];
    const recount = (): void => {
      count.textContent = at("shownOf", { shown: boxes.filter((b) => b.checked).length, total: boxes.length });
    };
    const tools = el("div", "settings-group-tools");
    const setAll = (on: boolean) => async () => {
      const before = new Set(hidden);
      for (const b of boxes) {
        b.checked = on;
        if (on) hidden.delete(b.value);
        else hidden.add(b.value);
      }
      recount();
      await save(() => {
        hidden.clear();
        for (const id of before) hidden.add(id);
        for (const b of boxes) b.checked = !hidden.has(b.value);
        recount();
      });
    };
    tools.append(button("ghost small", at("allOn"), setAll(true)), button("ghost small", at("allOff"), setAll(false)));
    box.append(tools);
    const list = el("div", "settings-group-list");
    for (const activity of activities) {
      const label = el("label", "topic");
      const input = el("input");
      input.type = "checkbox";
      input.value = activity.id;
      input.checked = !hidden.has(activity.id);
      input.addEventListener("change", async () => {
        if (input.checked) hidden.delete(activity.id);
        else hidden.add(activity.id);
        recount();
        await save(() => {
          input.checked = !input.checked;
          if (input.checked) hidden.delete(activity.id);
          else hidden.add(activity.id);
          recount();
        });
      });
      boxes.push(input);
      label.append(input, el("span", undefined, activity.title));
      list.append(label);
    }
    box.append(list);
    recount();
    shown.append(box);
  }
  return part(`🧩 ${at("activities")}`, "settings-activities", true, el("p", "hint left", at("activitiesHint")), shown, saved);
}

/** The other accounts that see the player, and a single-use code for one more. */
async function sharingPart(ctx: AccountContext, player: User, fail: (e: unknown) => void): Promise<HTMLElement> {
  const children: HTMLElement[] = [el("p", "hint left", at("sharingHint"))];
  const shares = await store.shares(player.id).catch(() => []);
  if (shares.length === 0) children.push(el("p", "empty small", at("notShared")));
  else {
    const ul = el("ul", "methods shares");
    for (const share of shares) {
      const item = el("li", "method");
      const text = el("div", "method-text");
      text.append(el("span", "method-name", share.name), el("span", "method-label", share.email ?? ""));
      item.append(
        text,
        button("ghost small", at("remove"), async () => {
          if (!confirm(at("confirmStopSharing", { name: share.name, player: player.name }))) return;
          try {
            await store.removeShare(player.id, share.accountId);
            ctx.rerender();
          } catch (e) {
            fail(e);
          }
        }),
      );
      ul.append(item);
    }
    children.push(ul);
  }
  const code = el("p", "share-code");
  code.setAttribute("role", "status");
  children.push(
    button("ghost small", at("createCode"), async () => {
      try {
        const invite = await store.createInvite(player.id);
        code.textContent = at("codeShown", { code: invite.code, date: new Date(invite.expiresAt).toLocaleDateString(currentLang()) });
      } catch (e) {
        fail(e);
      }
    }),
    code,
  );
  return part(`🤝 ${at("sharing")}`, "settings-sharing", shares.length > 0, ...children);
}

/** The player's own sign-in: a username and password, or a provider. */
function loginPart(ctx: AccountContext, player: User, methods: SignInMethod[], options: AuthOptions, fail: (e: unknown) => void): HTMLElement {
  const children: HTMLElement[] = [el("p", "hint left", at("playerLoginsHint"))];
  const theirs = methods.filter((m) => m.playerId === player.id);
  if (theirs.length === 0) children.push(el("p", "empty small", at("noPlayerLogin")));
  else {
    const ul = el("ul", "methods");
    for (const m of theirs) {
      ul.append(
        methodLine(m, options, true, async () => {
          if (!confirm(at("confirmRemove"))) return;
          try {
            await auth.removeMethod(m.id);
            ctx.rerender();
          } catch (e) {
            fail(e);
          }
        }),
      );
    }
    children.push(ul);
  }
  const form = el("form", "auth-form inline");
  form.dataset.player = String(player.id);
  form.append(field(at("username"), "text", "username", "off"), field(at("password"), "password", "password", "new-password"));
  const save = el("button", "primary", at("save"));
  save.type = "submit";
  form.append(save);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await auth.setPlayerPassword(player.id, value(form, "username"), value(form, "password"));
      ctx.rerender();
    } catch (e) {
      fail(e);
    }
  });
  children.push(form, el("p", "hint left", at("usernameHint")));
  if (options.providers.length > 0) {
    const links = el("div", "providers");
    for (const p of options.providers) links.append(providerLink(p.id, p.name, auth.providerUrl(p.id, "link-player", player.id), "link"));
    children.push(links);
  }
  return part(`🔑 ${at("playerLogin")}`, "settings-login", theirs.length > 0, ...children);
}
