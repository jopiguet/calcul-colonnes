import type { AuthState } from "../shared/types";
import { at, errorText } from "./auth-i18n";
import { button, el } from "./dom";
import { currentLang } from "./i18n";
import { admin, ApiError, auth, exportData, type AdminState } from "./store";

/**
 * The account page's last sections (docs/authentication.md#family-release):
 * the account's data (download, privacy, deletion), and for the owner of the
 * server, the family and friends: invitations, what the other accounts see,
 * and the feedback they send.
 */

const errorOf = (e: unknown): string => (e instanceof ApiError ? e.code : "unknown");
const day = (at: number): string => new Date(at).toLocaleDateString(currentLang());

function status(): HTMLParagraphElement {
  const node = el("p", "auth-message");
  node.setAttribute("role", "status");
  return node;
}

function say(node: HTMLElement, ok: boolean, text: string): void {
  node.className = `auth-message ${ok ? "ok" : "error"}`;
  node.textContent = text;
}

/** Download, privacy, deletion of the account. */
export function dataSection(opts: { state: AuthState; onDeleted(): void }): HTMLElement[] {
  const note = status();
  const download = button("ghost", at("exportData"), async () => {
    download.disabled = true;
    try {
      const blob = await exportData();
      const link = el("a");
      link.href = URL.createObjectURL(blob);
      link.download = `luma-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 10_000);
    } catch (e) {
      say(note, false, errorText(errorOf(e)));
    } finally {
      download.disabled = false;
    }
  });
  const privacy = el("a", "privacy-link", at("privacyLink"));
  privacy.href = "#privacy";
  const name = opts.state.account?.name ?? "";
  const remove = button("ghost danger", at("deleteAccount"), async () => {
    // The account's name typed again: a deletion cannot be undone.
    const typed = prompt(at("confirmDeleteAccount", { name }));
    if (typed === null) return;
    if (typed.trim() !== name) {
      say(note, false, at("error.not_confirmed"));
      return;
    }
    try {
      await auth.deleteAccount();
      opts.onDeleted();
    } catch (e) {
      say(note, false, errorText(errorOf(e)));
    }
  });
  const actions = el("div", "account-data");
  actions.append(download, remove);
  return [el("h2", "subtitle", at("yourData")), el("p", "hint left", at("yourDataHint")), actions, el("p", "hint left", at("deleteAccountHint")), privacy, note];
}

/** The owner's section: invitations, content, feedback. Empty for any other account. */
export async function familySection(state: AuthState): Promise<HTMLElement[]> {
  if (!state.account?.owner) return [];
  let data: AdminState;
  try {
    data = await admin.state();
  } catch {
    return [];
  }
  const box = el("section", "family-admin");
  const note = status();
  const draw = (): void => {
    box.replaceChildren(
      el("h2", "subtitle", `👪 ${at("family")}`),
      el("p", "hint left", at("familyHint")),
      el("p", "family-mode", at("registrationMode", { mode: at(data.registration === "invite" ? "modeInvite" : data.registration === "closed" ? "modeClosed" : "modeOpen") })),
      ...(data.registration === "invite" ? [] : [el("p", "hint left", at("inviteModeWarning"))]),
      note,
      invitations(),
      content(),
      feedback(),
    );
  };

  const invitations = (): HTMLElement => {
    const part = el("div", "family-part");
    part.append(el("h3", "field-label", at("invitations")));
    const form = el("form", "auth-form inline family-invite");
    const label = el("label", "field");
    const input = el("input");
    input.name = "note";
    input.maxLength = 60;
    input.autocomplete = "off";
    label.append(el("span", "field-label", at("inviteNote")), input);
    const create = el("button", "primary", at("createInvite"));
    create.type = "submit";
    form.append(label, create);
    const shown = el("div", "family-link");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      create.disabled = true;
      try {
        const made = await admin.invite(input.value);
        data.invites.unshift(made.invite);
        draw();
        // The link is shown once: only its hash is kept on the server.
        const box2 = document.querySelector(".family-link");
        if (box2) {
          const link = el("input", "family-link-input");
          link.readOnly = true;
          link.value = made.link;
          const copy = button("ghost small", at("copy"), () => {
            void navigator.clipboard?.writeText(made.link).then(() => (copy.textContent = at("copied")));
            link.select();
          });
          box2.replaceChildren(el("p", "hint left", at("inviteLink", { date: day(made.invite.expiresAt) })), link, copy);
        }
      } catch (e) {
        say(note, false, errorText(errorOf(e)));
        create.disabled = false;
      }
    });
    part.append(form, shown);
    if (data.invites.length === 0) part.append(el("p", "empty small", at("invitesNone")));
    else {
      const list = el("ul", "methods family-invites");
      for (const invite of data.invites) {
        const item = el("li", "method");
        const text = el("div", "method-text");
        const state = invite.usedAt ? at("inviteUsed", { name: invite.usedBy ?? "—" }) : invite.expiresAt < Date.now() ? at("inviteExpired") : at("inviteValid", { date: day(invite.expiresAt) });
        text.append(el("span", "method-name", invite.note || at("inviteNoNote")), el("span", "method-label", `${day(invite.createdAt)} · ${state}`));
        item.append(
          text,
          button("ghost small", at("remove"), async () => {
            try {
              await admin.removeInvite(invite.id);
              data.invites = data.invites.filter((i) => i.id !== invite.id);
              draw();
            } catch (e) {
              say(note, false, errorText(errorOf(e)));
            }
          }),
        );
        list.append(item);
      }
      part.append(list);
    }
    return part;
  };

  /** Each book, and the bank: only me, or every account. */
  const content = (): HTMLElement => {
    const part = el("div", "family-part");
    part.append(el("h3", "field-label", at("content")), el("p", "hint left", at("contentHint")));
    const row = (title: string, value: "private" | "shared", set: (v: "private" | "shared") => Promise<void>): HTMLElement => {
      const line = el("div", "family-content");
      const choice = el("div", "segmented compact");
      for (const v of ["private", "shared"] as const) {
        const b = button(v === value ? "segment on" : "segment", at(v === "private" ? "visibilityPrivate" : "visibilityShared"), async () => {
          try {
            await set(v);
            draw();
          } catch (e) {
            say(note, false, errorText(errorOf(e)));
          }
        });
        b.setAttribute("aria-pressed", String(v === value));
        choice.append(b);
      }
      line.append(el("span", "family-content-name", title), choice);
      return line;
    };
    for (const book of data.books) {
      part.append(
        // Several books share a title ("3000 words and phrases"): the language studied tells them apart.
        row(`${book.title} · ${book.term.toUpperCase()}`, book.visibility, async (v) => {
          await admin.bookVisibility(book.id, v);
          book.visibility = v;
        }),
      );
    }
    for (const book of data.exerciseBooks ?? []) {
      part.append(
        row(`✏️ ${book.title}`, book.visibility, async (v) => {
          await admin.exerciseBookVisibility(book.id, v);
          book.visibility = v;
        }),
      );
    }
    part.append(
      row(at("bankLabel"), data.bank, async (v) => {
        await admin.bankVisibility(v);
        data.bank = v;
      }),
    );
    return part;
  };

  const feedback = (): HTMLElement => {
    const part = el("div", "family-part");
    part.append(el("h3", "field-label", at("feedbackReceived")));
    if (data.feedback.length === 0) part.append(el("p", "empty small", at("feedbackNone")));
    else {
      const list = el("ul", "family-feedback");
      for (const f of data.feedback) {
        const item = el("li");
        const who = [f.account, f.player].filter(Boolean).join(" · ");
        item.append(el("span", "method-label", `${new Date(f.at).toLocaleString(currentLang())} · ${who}${f.page ? ` · ${f.page}` : ""} · ${f.version}`), el("p", "family-feedback-text", f.text));
        list.append(item);
      }
      part.append(list);
    }
    return part;
  };

  draw();
  return [box];
}
