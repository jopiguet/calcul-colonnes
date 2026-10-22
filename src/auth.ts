import type { AuthOptions, AuthState, SignInMethod, User, VocabBookInfo } from "../shared/types";
import { activityCatalog, vocabBooks } from "./home";
import { at, errorText, type AuthKey } from "./auth-i18n";
import { button, el } from "./dom";
import { currentLang, t } from "./i18n";
import { ApiError, auth, store } from "./store";

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
        else await auth.register(value(form, "name"), value(form, "email"), value(form, "password"));
        notice = null;
        onSignedIn();
      } catch (e) {
        showError(status, errorText(errorOf(e), { url: options.publicUrl }));
        submit.disabled = false;
      }
    });

    const parts: HTMLElement[] = [title, status, form];
    if (options.providers.length > 0) {
      const list = el("div", "providers");
      for (const p of options.providers) list.append(providerLink(p.id, p.name, auth.providerUrl(p.id, "login"), "continueWith"));
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
    parts.push(home);
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

export async function accountView(ctx: AccountContext): Promise<HTMLElement> {
  const { state, options } = ctx;
  const methods = await auth.methods();
  const own = methods.filter((m) => m.playerId === null);
  const wrap = el("section", "sheet account");
  const status = message();

  const remove = (m: SignInMethod) => async () => {
    if (!confirm(at("confirmRemove"))) return;
    try {
      await auth.removeMethod(m.id);
      ctx.rerender();
    } catch (e) {
      showError(status, errorText(errorOf(e)));
    }
  };

  wrap.append(
    el("h1", "title", at("accountTitle")),
    el("p", "account-who", [state.account?.name, state.account?.email].filter(Boolean).join(" · ")),
    status,
  );

  // ---- ways to sign in
  wrap.append(el("h2", "subtitle", at("methods")));
  const list = el("ul", "methods");
  for (const m of own) list.append(methodLine(m, options, own.length > 1, remove(m)));
  wrap.append(list);

  const linkable = options.providers.filter((p) => !own.some((m) => m.type === "oauth" && m.provider === p.id));
  if (linkable.length > 0) {
    const links = el("div", "providers");
    for (const p of linkable) links.append(providerLink(p.id, p.name, auth.providerUrl(p.id, "link"), "link"));
    wrap.append(links);
  }

  const hasPassword = own.some((m) => m.type === "password");
  const pw = el("form", "auth-form compact");
  pw.append(el("h3", "field-label", at(hasPassword ? "changePassword" : "setPassword")));
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
      showError(status, errorText(errorOf(e)));
    }
  });
  wrap.append(pw);

  // ---- players: what each one sees, sharing, their own sign-in
  const books = await vocabBooks().catch(() => [] as VocabBookInfo[]);
  const catalog = activityCatalog(books);
  wrap.append(el("h2", "subtitle", at("players")), el("p", "hint left", at("playersHint")));
  for (const player of ctx.players) {
    const block = el("div", "player-login");
    block.dataset.player = String(player.id);
    block.append(el("h3", "player-login-name", player.name));

    if (player.sharedBy !== undefined) {
      // Another account's player: it can only be left.
      block.append(
        el("p", "method-label", at("sharedBy", { name: player.sharedBy })),
        el("p", "hint left", at("sharedPlayerHint")),
        button("ghost small", at("leave", { player: player.name }), async () => {
          if (!confirm(at("confirmLeave", { player: player.name, name: player.sharedBy ?? "" }))) return;
          try {
            await store.deleteUser(player.id);
            ctx.onPlayersChanged();
          } catch (e) {
            showError(status, errorText(errorOf(e)));
          }
        }),
      );
      wrap.append(block);
      continue;
    }

    // Activities shown on the player's home page.
    const hidden = new Set(player.hidden ?? []);
    const shown = el("fieldset", "player-activities");
    shown.append(el("legend", "field-label", at("activities")));
    const saved = el("span", "hint player-activities-saved");
    for (const { group, activities } of catalog) {
      if (activities.length === 0) continue;
      const row = el("div", "topic-group");
      row.append(el("span", "topic-group-name", group));
      for (const activity of activities) {
        const label = el("label", "topic");
        const box = el("input");
        box.type = "checkbox";
        box.value = activity.id;
        box.checked = !hidden.has(activity.id);
        box.addEventListener("change", async () => {
          if (box.checked) hidden.delete(activity.id);
          else hidden.add(activity.id);
          try {
            await store.setHidden(player.id, [...hidden]);
            player.hidden = [...hidden];
            saved.textContent = at("saved");
          } catch (e) {
            box.checked = !box.checked;
            showError(status, errorText(errorOf(e)));
          }
        });
        label.append(box, el("span", undefined, activity.title));
        row.append(label);
      }
      shown.append(row);
    }
    shown.append(saved);
    block.append(shown);

    // Sharing with other accounts.
    block.append(el("h4", "field-label", at("sharing")), el("p", "hint left", at("sharingHint")));
    const shares = await store.shares(player.id).catch(() => []);
    if (shares.length === 0) block.append(el("p", "empty small", at("notShared")));
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
              showError(status, errorText(errorOf(e)));
            }
          }),
        );
        ul.append(item);
      }
      block.append(ul);
    }
    const code = el("p", "share-code");
    code.setAttribute("role", "status");
    block.append(
      button("ghost small", at("createCode"), async () => {
        try {
          const invite = await store.createInvite(player.id);
          code.textContent = at("codeShown", {
            code: invite.code,
            date: new Date(invite.expiresAt).toLocaleDateString(currentLang()),
          });
        } catch (e) {
          showError(status, errorText(errorOf(e)));
        }
      }),
      code,
    );

    // The player's own sign-in.
    block.append(el("h4", "field-label", at("playerLogin")), el("p", "hint left", at("playerLoginsHint")));
    const theirs = methods.filter((m) => m.playerId === player.id);
    if (theirs.length === 0) block.append(el("p", "empty small", at("noPlayerLogin")));
    else {
      const ul = el("ul", "methods");
      for (const m of theirs) ul.append(methodLine(m, options, true, remove(m)));
      block.append(ul);
    }
    const form = el("form", "auth-form inline");
    form.dataset.player = String(player.id);
    form.append(
      field(at("username"), "text", "username", "off"),
      field(at("password"), "password", "password", "new-password"),
    );
    const save = el("button", "primary", at("save"));
    save.type = "submit";
    form.append(save);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await auth.setPlayerPassword(player.id, value(form, "username"), value(form, "password"));
        ctx.rerender();
      } catch (e) {
        showError(status, errorText(errorOf(e)));
        status.scrollIntoView({ block: "nearest" });
      }
    });
    block.append(form, el("p", "hint left", at("usernameHint")));
    if (options.providers.length > 0) {
      const links = el("div", "providers");
      for (const p of options.providers) {
        links.append(providerLink(p.id, p.name, auth.providerUrl(p.id, "link-player", player.id), "link"));
      }
      block.append(links);
    }
    wrap.append(block);
  }

  // A player another account shares with this one.
  const join = el("form", "auth-form compact join-share");
  join.append(el("h3", "field-label", at("joinTitle")), el("p", "hint", at("joinHint")), field(at("shareCode"), "text", "code", "off"));
  const joinButton = el("button", "primary", at("join"));
  joinButton.type = "submit";
  join.append(joinButton);
  join.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const player = await store.joinShare(value(join, "code"));
      ctx.onPlayersChanged(at("joined", { player: player.name }));
    } catch (e) {
      showError(status, errorText(errorOf(e)));
      status.scrollIntoView({ block: "nearest" });
    }
  });
  wrap.append(join);

  // ---- devices
  wrap.append(el("h2", "subtitle", at("devices")));
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
  wrap.append(devices, button("primary", t("back"), ctx.onBack));
  return wrap;
}
