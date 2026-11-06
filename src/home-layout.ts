/**
 * The home page's groups as the player arranges them (docs/home.md#arranging):
 *
 * - each group on one line of cards, scrolled sideways; its title opens it whole;
 * - cards and groups in the player's order, with a mode to move, remove and add
 *   them, entered from the "⋯" of any card;
 * - what is waiting (words due, notions to review) first, the most first, then
 *   the player's order again once it is done.
 */
import { button, el } from "./dom";
import type { HomeLayout, User } from "../shared/types";

type Lang = "fr" | "es" | "en";
const TEXTS = {
  fr: {
    options: "Options de la carte",
    arrange: "✥ Réorganiser l'accueil",
    add: "＋ Ajouter une activité",
    remove: "✕ Retirer de l'accueil",
    arrangeHint: "Déplacez les cartes avec ◀ ▶ ou en les faisant glisser, les groupes avec ▲ ▼ ; − retire une carte, ＋ en remet une.",
    done: "✓ Terminé",
    addHere: "＋ Ajouter",
    nothingToAdd: "Toutes les activités de ce groupe sont sur l'accueil.",
    left: "Plus tôt",
    right: "Plus tard",
    up: "Monter le groupe",
    down: "Descendre le groupe",
    removeOne: "Retirer {title}",
    open: "Tout afficher : {title}",
    close: "Sur une ligne : {title}",
    due: "{count} en attente",
  },
  es: {
    options: "Opciones de la tarjeta",
    arrange: "✥ Reorganizar el inicio",
    add: "＋ Añadir una actividad",
    remove: "✕ Quitar del inicio",
    arrangeHint: "Mueva las tarjetas con ◀ ▶ o arrastrándolas, los grupos con ▲ ▼; − quita una tarjeta, ＋ vuelve a poner una.",
    done: "✓ Hecho",
    addHere: "＋ Añadir",
    nothingToAdd: "Todas las actividades de este grupo están en el inicio.",
    left: "Antes",
    right: "Después",
    up: "Subir el grupo",
    down: "Bajar el grupo",
    removeOne: "Quitar {title}",
    open: "Mostrar todo: {title}",
    close: "En una línea: {title}",
    due: "{count} pendientes",
  },
  en: {
    options: "Card options",
    arrange: "✥ Arrange the home page",
    add: "＋ Add an activity",
    remove: "✕ Remove from the home page",
    arrangeHint: "Move cards with ◀ ▶ or by dragging them, groups with ▲ ▼; − removes a card, ＋ puts one back.",
    done: "✓ Done",
    addHere: "＋ Add",
    nothingToAdd: "Every activity of this group is on the home page.",
    left: "Earlier",
    right: "Later",
    up: "Move the group up",
    down: "Move the group down",
    removeOne: "Remove {title}",
    open: "Show all: {title}",
    close: "On one line: {title}",
    due: "{count} waiting",
  },
} as const;
type Key = keyof (typeof TEXTS)["fr"];
const lang = (): Lang => {
  const l = document.documentElement.lang;
  return l === "es" || l === "en" ? l : "fr";
};
export const lt = (key: Key, values: Record<string, string | number> = {}): string =>
  TEXTS[lang()][key].replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ""));

/** The card menu open now: a click elsewhere or Escape closes it (listeners set once for every drawing). */
let closeOpenMenu: () => void = () => undefined;
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (!target.closest?.(".activity-menu") && !target.closest?.(".activity-more")) closeOpenMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeOpenMenu();
});
// The menu is placed on the screen, by its card: when the card moves (the page or a group's line scrolled), or the
// window changes size, it closes. A scroll that ends after it opened, its "⋯" still in place, leaves it.
let menuAnchor: { node: HTMLElement; top: number; left: number } | null = null;
window.addEventListener(
  "scroll",
  () => {
    if (!menuAnchor) return;
    const at = menuAnchor.node.getBoundingClientRect();
    if (Math.abs(at.top - menuAnchor.top) > 4 || Math.abs(at.left - menuAnchor.left) > 4) closeOpenMenu();
  },
  { passive: true, capture: true },
);
window.addEventListener("resize", () => closeOpenMenu());

/** Arranging survives a new drawing of the home page (after an activity is added back). */
let arranging = false;
let adding: string | null = null;
/** Leaves the arranging mode: opening an activity, or another player. */
export function stopArranging(): void {
  arranging = false;
  adding = null;
}

export interface HomeGroup {
  /** "maths", "languages"…: what the layout stores. */
  id: string;
  el: HTMLElement;
}

export interface ArrangeOptions {
  user: User;
  /** The player's account may hide and show activities (not a player's own login, not a shared player). */
  canHide: boolean;
  /** Activities of a group hidden now, which can be put back. */
  addable(groupId: string, hidden: Set<string>): { id: string; title: string }[];
  saveLayout(layout: HomeLayout): Promise<void>;
  saveHidden(hidden: string[]): Promise<void>;
  /** Draws the home page again (an activity put back may need its card built). */
  rerender(): void;
}

/** Ids in the stored order first, then the others in their own order. */
function inOrder<T>(items: T[], idOf: (t: T) => string, order: string[] = []): T[] {
  const at = new Map(order.map((id, i) => [id, i]));
  return items
    .map((item, i) => ({ item, key: at.get(idOf(item)) ?? order.length + i }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.item);
}

/** Waiting first, the most first; the rest keeps its order (a stable sort). */
function waitingFirst<T>(items: T[], dueOf: (t: T) => number): T[] {
  return items
    .map((item, i) => ({ item, i, due: dueOf(item) }))
    .sort((a, b) => (b.due > 0 || a.due > 0 ? b.due - a.due || a.i - b.i : a.i - b.i))
    .map((x) => x.item);
}

interface Cell {
  id: string;
  group: string;
  cell: HTMLElement;
  card: HTMLElement;
  due: number;
  /** What hiding the card hides: its own id, or the books of a shelf. */
  hides: string[];
}

/** The groups, arranged; returns the element that holds them, or a note when nothing is shown. */
export function arrangeHome(groups: HomeGroup[], o: ArrangeOptions): HTMLElement {
  const layout: HomeLayout = structuredClone(o.user.layout ?? {});
  const hidden = new Set(o.user.hidden ?? []);
  const open = new Set(layout.open ?? []);
  const holder = el("div", "home-arranged");
  const banner = el("div", "home-arrange");
  const doneButton = button("small home-arrange-done", lt("done"), () => {
    stopArranging();
    paint();
  });
  banner.append(el("p", "hint left", lt("arrangeHint")), doneButton);
  const list = el("div", "home-groups");
  holder.append(banner, list);

  const save = (): void => {
    void o.saveLayout(layout).catch(() => undefined);
  };

  // ---- the cells: each card, with its "⋯" and the arranging controls
  const cells: Cell[] = [];
  const parts = new Map<string, { grid: HTMLElement; others: Element[]; head: HTMLElement; toggle: HTMLButtonElement; count: HTMLElement; due: HTMLElement; tools: HTMLElement; add: HTMLElement }>();
  let menu: HTMLElement | null = null;
  let menuOf: HTMLElement | null = null;
  const closeMenu = (): void => {
    menu?.remove();
    menu = null;
    menuOf = null;
    menuAnchor = null;
  };
  closeOpenMenu = closeMenu;

  let dragged: Cell | null = null;
  for (const { id: groupId, el: group } of groups) {
    group.dataset.group = groupId;
    const title = group.querySelector<HTMLElement>(".activity-group-title")!;
    const name = title.textContent ?? "";
    // The title opens the group whole, or puts it back on one line; its text stays the group's name.
    const toggle = button("activity-group-toggle", name, () => {
      if (arranging) return;
      if (open.has(groupId)) open.delete(groupId);
      else open.add(groupId);
      layout.open = [...open];
      save();
      paint();
    });
    title.replaceChildren(toggle);
    const count = el("span", "activity-group-count");
    const due = el("span", "activity-group-due");
    const tools = el("span", "activity-group-tools");
    const head = el("div", "activity-group-head");
    title.replaceWith(head);
    head.append(title, count, due, tools);
    const add = el("div", "activity-add");
    head.after(add);
    const grid = group.querySelector<HTMLElement>(".activity-grid")!;
    const others: Element[] = [];
    for (const child of [...grid.children]) {
      const card = child as HTMLElement;
      if (!card.dataset.activity) {
        others.push(child);
        continue;
      }
      const cell = el("div", "activity-cell");
      cell.dataset.cell = card.dataset.activity;
      const entry: Cell = {
        id: card.dataset.activity,
        group: groupId,
        cell,
        card,
        due: Number(card.dataset.due ?? 0),
        hides: card.dataset.hides ? card.dataset.hides.split(" ") : [card.dataset.activity],
      };
      const more = button("activity-more", "⋯", () => {
        if (menuOf === cell) return closeMenu();
        closeMenu();
        menuOf = cell;
        menu = el("div", "activity-menu");
        menu.setAttribute("role", "menu");
        const item = (label: string, act: () => void): HTMLButtonElement => {
          const b = button("activity-menu-item", label, () => {
            closeMenu();
            act();
          });
          b.setAttribute("role", "menuitem");
          return b;
        };
        menu.append(
          item(lt("arrange"), () => {
            arranging = true;
            paint();
          }),
        );
        if (o.canHide) {
          menu.append(
            item(lt("add"), () => {
              arranging = true;
              adding = groupId;
              paint();
            }),
            item(lt("remove"), () => hide(entry)),
          );
        }
        // On the page, not in the card: a group's line scrolls sideways and would cut it.
        const at = more.getBoundingClientRect();
        menuAnchor = { node: more, top: at.top, left: at.left };
        menu.style.left = `${Math.round(Math.max(8, Math.min(at.right - 240, window.innerWidth - 248)))}px`;
        menu.style.visibility = "hidden";
        document.body.append(menu);
        // Under the "⋯", or above it when the screen ends first.
        const height = menu.offsetHeight;
        const below = at.bottom + 4;
        menu.style.top = `${Math.round(below + height > window.innerHeight - 8 ? Math.max(8, at.top - height - 4) : below)}px`;
        menu.style.visibility = "";
        menu.querySelector("button")?.focus();
      });
      more.title = lt("options");
      more.setAttribute("aria-label", lt("options"));
      more.setAttribute("aria-haspopup", "menu");
      const minus = button("activity-remove", "−", () => hide(entry));
      minus.setAttribute("aria-label", lt("removeOne", { title: card.querySelector(".activity-title")?.textContent ?? entry.id }));
      const left = button("activity-move", "◀", () => moveCard(entry, -1));
      left.setAttribute("aria-label", lt("left"));
      const right = button("activity-move", "▶", () => moveCard(entry, 1));
      right.setAttribute("aria-label", lt("right"));
      const moves = el("span", "activity-moves");
      moves.append(left, right);
      cell.append(card, more, ...(o.canHide ? [minus] : []), moves);
      // Dragging, while arranging: dropped before or after the card under it, in the same group.
      cell.addEventListener("dragstart", (e) => {
        if (!arranging) return e.preventDefault();
        dragged = entry;
        cell.classList.add("is-dragged");
        e.dataTransfer?.setData("text/plain", entry.id);
      });
      cell.addEventListener("dragend", () => {
        dragged = null;
        cell.classList.remove("is-dragged");
      });
      cell.addEventListener("dragover", (e) => {
        if (arranging && dragged && dragged !== entry && dragged.group === groupId) e.preventDefault();
      });
      cell.addEventListener("drop", (e) => {
        if (!arranging || !dragged || dragged === entry || dragged.group !== groupId) return;
        e.preventDefault();
        const box = cell.getBoundingClientRect();
        const after = e.clientX > box.left + box.width / 2;
        const ids = shownIds(groupId).filter((x) => x !== dragged!.id);
        ids.splice(ids.indexOf(entry.id) + (after ? 1 : 0), 0, dragged.id);
        (layout.cards ??= {})[groupId] = ids;
        save();
        paint();
      });
      cells.push(entry);
    }
    // In arranging, a card does not open its activity.
    grid.addEventListener(
      "click",
      (e) => {
        if (arranging && (e.target as HTMLElement).closest("button.activity")) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true,
    );
    const up = button("activity-move", "▲", () => moveGroup(groupId, -1));
    up.setAttribute("aria-label", lt("up"));
    const down = button("activity-move", "▼", () => moveGroup(groupId, 1));
    down.setAttribute("aria-label", lt("down"));
    const addButton = button("small ghost activity-add-toggle", lt("addHere"), () => {
      adding = adding === groupId ? null : groupId;
      paint();
    });
    tools.append(up, down, ...(o.canHide ? [addButton] : []));
    parts.set(groupId, { grid, others, head, toggle, count, due, tools, add });
  }

  const visible = (c: Cell): boolean => !c.hides.every((id) => hidden.has(id)) && !hidden.has(c.id);
  /** A group's shown cards, in the player's order. */
  const shownIds = (groupId: string): string[] =>
    inOrder(cells.filter((c) => c.group === groupId && visible(c)), (c) => c.id, layout.cards?.[groupId]).map((c) => c.id);
  const groupIds = (): string[] => inOrder(groups, (g) => g.id, layout.groups).map((g) => g.id);

  function moveCard(cell: Cell, by: number): void {
    const ids = shownIds(cell.group);
    const i = ids.indexOf(cell.id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    (layout.cards ??= {})[cell.group] = ids;
    save();
    paint();
    cell.cell.querySelectorAll<HTMLButtonElement>(".activity-move")[by < 0 ? 0 : 1]?.focus();
  }

  function moveGroup(groupId: string, by: number): void {
    // Among the groups shown: a group with nothing to show does not take a step.
    const ids = groupIds();
    const shown = ids.filter((g) => shownIds(g).length > 0 || g === groupId);
    const i = shown.indexOf(groupId);
    const other = shown[i + by];
    if (!other) return;
    const a = ids.indexOf(groupId);
    const b = ids.indexOf(other);
    [ids[a], ids[b]] = [ids[b]!, ids[a]!];
    layout.groups = ids;
    save();
    paint();
    parts.get(groupId)?.tools.querySelectorAll<HTMLButtonElement>(".activity-move")[by < 0 ? 0 : 1]?.focus();
  }

  function hide(cell: Cell): void {
    if (!o.canHide) return;
    for (const id of cell.hides) hidden.add(id);
    hidden.add(cell.id);
    // A shelf's own id is not stored: its books are.
    if (cell.id.startsWith("vocab-shelf-")) hidden.delete(cell.id);
    void o.saveHidden([...hidden]).catch(() => undefined);
    paint();
  }

  function paint(): void {
    closeMenu();
    holder.classList.toggle("is-arranging", arranging);
    const dueOf = (groupId: string): number => cells.filter((c) => c.group === groupId && visible(c)).reduce((sum, c) => sum + c.due, 0);
    let order = groupIds();
    if (!arranging) order = waitingFirst(order, dueOf);
    list.replaceChildren();
    for (const groupId of order) {
      const group = groups.find((g) => g.id === groupId)!.el;
      const part = parts.get(groupId)!;
      let shown = inOrder(cells.filter((c) => c.group === groupId && visible(c)), (c) => c.id, layout.cards?.[groupId]);
      if (!arranging) shown = waitingFirst(shown, (c) => c.due);
      const canAdd = arranging && o.canHide && o.addable(groupId, hidden).length > 0;
      // A group with nothing shown goes, unless it says why (no book yet) or something can be put back in it.
      if (shown.length === 0 && !canAdd && !(part.others.length > 0 && hidden.size === 0)) continue;
      part.grid.replaceChildren(...shown.map((c) => c.cell), ...part.others);
      for (const c of shown) {
        c.cell.draggable = arranging;
        c.cell.classList.toggle("is-due", c.due > 0);
      }
      const isOpen = open.has(groupId);
      group.classList.toggle("is-line", !arranging && !isOpen);
      group.classList.toggle("is-open", !arranging && isOpen);
      part.toggle.setAttribute("aria-expanded", String(arranging || isOpen));
      part.toggle.title = lt(isOpen ? "close" : "open", { title: part.toggle.textContent ?? "" });
      part.count.textContent = String(shown.length);
      const waiting = dueOf(groupId);
      part.due.textContent = waiting > 0 ? lt("due", { count: waiting }) : "";
      part.due.hidden = waiting === 0;
      part.tools.hidden = !arranging;
      // Putting back: the group's hidden activities.
      part.add.replaceChildren();
      part.add.hidden = !(arranging && adding === groupId);
      if (arranging && adding === groupId) {
        const back = o.addable(groupId, hidden);
        if (back.length === 0) part.add.append(el("p", "hint left", lt("nothingToAdd")));
        for (const a of back) {
          part.add.append(
            button("small ghost activity-add-item", `＋ ${a.title}`, () => {
              hidden.delete(a.id);
              adding = groupId;
              void o
                .saveHidden([...hidden])
                .catch(() => undefined)
                .then(() => o.rerender());
            }),
          );
        }
      }
      list.append(group);
    }
    banner.hidden = !arranging;
  }

  paint();
  return holder;
}

/** How many are waiting on a card, read from its status ("12 mots à revoir", "1 notion…"): 0 when nothing waits. */
export function dueCount(status: { text: string; waiting: boolean } | null): number {
  if (!status?.waiting) return 0;
  const n = Number(/\d+/.exec(status.text)?.[0] ?? 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
