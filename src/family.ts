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

/**
 * The owner's two sections of the settings page: the family (invitations, feedback) and the content the other
 * accounts see (each book's visibility, the vocabulary export). Null for any other account.
 */
export async function familySection(state: AuthState): Promise<{ family: HTMLElement[]; content: HTMLElement[] } | null> {
  if (!state.account?.owner) return null;
  let data: AdminState;
  try {
    data = await admin.state();
  } catch {
    return null;
  }
  const box = el("section", "family-admin");
  const contentBox = el("section", "family-admin family-content-section");
  const note = status();
  const contentNote = status();
  let filter = "";
  const draw = (): void => {
    box.replaceChildren(
      el("h2", "subtitle", `👪 ${at("family")}`),
      el("p", "hint left", at("familyHint")),
      el("p", "family-mode", at("registrationMode", { mode: at(data.registration === "invite" ? "modeInvite" : data.registration === "closed" ? "modeClosed" : "modeOpen") })),
      ...(data.registration === "invite" ? [] : [el("p", "hint left", at("inviteModeWarning"))]),
      note,
      invitations(),
      feedback(),
    );
    contentBox.replaceChildren(contentNote, content(), vocabExport());
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

  /** Each book, and the bank: only me, or every account; a search box narrows the list of books. */
  const content = (): HTMLElement => {
    const part = el("div", "family-part");
    part.append(el("h2", "subtitle", at("content")), el("p", "hint left", at("contentHint")));
    const row = (title: string, value: "private" | "shared", set: (v: "private" | "shared") => Promise<void>): HTMLElement => {
      const line = el("div", "family-content");
      line.dataset.search = title.toLowerCase();
      const choice = el("div", "segmented compact");
      for (const v of ["private", "shared"] as const) {
        const b = button(v === value ? "segment on" : "segment", at(v === "private" ? "visibilityPrivate" : "visibilityShared"), async () => {
          try {
            await set(v);
            draw();
          } catch (e) {
            say(contentNote, false, errorText(errorOf(e)));
          }
        });
        b.setAttribute("aria-pressed", String(v === value));
        choice.append(b);
      }
      line.append(el("span", "family-content-name", title), choice);
      return line;
    };
    const search = el("input", "family-content-filter");
    search.type = "search";
    search.placeholder = at("contentFilter");
    search.setAttribute("aria-label", at("contentFilter"));
    search.value = filter;
    const lines: HTMLElement[] = [];
    const apply = (): void => {
      filter = search.value;
      const q = filter.trim().toLowerCase();
      for (const line of lines) line.hidden = q !== "" && !(line.dataset.search ?? "").includes(q);
    };
    search.addEventListener("input", apply);
    if (data.books.length + (data.exerciseBooks ?? []).length > 6) part.append(search);

    // Vocabulary books by the language studied: several share a title ("3000 words and phrases").
    part.append(el("h3", "field-label", at("contentBooks")));
    const byLang = [...data.books].sort((a, b) => a.term.localeCompare(b.term) || a.title.localeCompare(b.title));
    for (const book of byLang) {
      const line = row(`${book.title} · ${book.term.toUpperCase()}`, book.visibility, async (v) => {
        await admin.bookVisibility(book.id, v);
        book.visibility = v;
      });
      lines.push(line);
      part.append(line);
    }
    if ((data.exerciseBooks ?? []).length > 0) {
      part.append(el("h3", "field-label", at("contentWorkbooks")));
      for (const book of data.exerciseBooks ?? []) {
        const line = row(`✏️ ${book.title}`, book.visibility, async (v) => {
          await admin.exerciseBookVisibility(book.id, v);
          book.visibility = v;
        });
        lines.push(line);
        part.append(line);
      }
    }
    part.append(
      el("h3", "field-label", at("contentOther")),
      row(at("bankLabel"), data.bank, async (v) => {
        await admin.bankVisibility(v);
        data.bank = v;
      }),
    );
    apply();
    return part;
  };

  /** Each vocabulary book as a JSON file for vocab:import, and all of them in one (docs/vocabulary.md#listing-and-exporting). */
  const vocabExport = (): HTMLElement => {
    const part = el("div", "family-part");
    part.append(el("h3", "field-label", at("exportTitle")), el("p", "hint left", at("exportHint")));
    const link = (href: string, label: string): HTMLAnchorElement => {
      const a = el("a", "button ghost small family-export-link", label);
      a.href = href;
      a.download = "";
      return a;
    };
    const all = el("div", "family-export");
    all.append(el("span", "family-content-name", at("exportAll")), link("/api/admin/vocab-export", "⬇️ JSON"));
    part.append(all);
    for (const book of data.books) {
      const line = el("div", "family-export");
      line.dataset.book = book.slug;
      line.append(el("span", "family-content-name", `${book.title} · ${book.term.toUpperCase()} · ${at("exportWords", { n: book.entries })}`), link(`/api/admin/books/${book.id}/export`, "⬇️ JSON"));
      part.append(line);
    }
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
  return { family: [box], content: [contentBox] };
}
