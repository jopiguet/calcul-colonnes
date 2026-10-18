import type { AuthOptions, AuthState, SignInMethod, User } from "../shared/types";
import { at, errorText, type AuthKey } from "./auth-i18n";
import { button, el } from "./dom";
import { currentLang, t } from "./i18n";
import { ApiError, auth } from "./store";

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

export function signInView(options: AuthOptions, onSignedIn: () => void, notice: { ok: boolean; text: string } | null): HTMLElement {
  let mode: "signIn" | "signUp" = "signIn";
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
          draw();
        }),
      );
    }
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

  // ---- players' own sign-in
  if (ctx.players.length > 0) {
    wrap.append(el("h2", "subtitle", at("playerLogins")), el("p", "hint left", at("playerLoginsHint")));
    for (const player of ctx.players) {
      const block = el("div", "player-login");
      block.append(el("h3", "player-login-name", player.name));
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
  }

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
