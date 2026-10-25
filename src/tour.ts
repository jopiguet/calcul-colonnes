import { button, el } from "./dom";
import { currentLang } from "./i18n";
import { TOUR_TEXTS, tourSteps as stepsIn } from "./tour-texts";

/**
 * The guided tour (#tour): a few pages on how Luma is laid out, shown once
 * after the first sign-in of an account (or of a player on their own login)
 * and opened again at any time from the footer of the home page
 * ("🧭 Visite guidée"). Finishing or skipping it marks it as seen on the
 * server (POST /api/auth/onboarded), so it does not open by itself again.
 *
 * The chips on each page copy the labels of the real buttons, so what the
 * tour names is what the player then looks for.
 */

const texts = () => TOUR_TEXTS[currentLang()];
const tourSteps = (playerSession: boolean) => stepsIn(playerSession, currentLang());

/** The footer link that opens the tour again. */
export function tourLink(): HTMLAnchorElement {
  const link = el("a", "tour-link", texts().link);
  link.href = "#tour";
  return link;
}

// The page shown, kept across redraws (a change of language keeps the page).
let index = 0;
let keyHandler: ((event: KeyboardEvent) => void) | null = null;

/** Starts the tour on its first page (opening it from the footer or after sign-in). */
export function resetTour(): void {
  index = 0;
}

export function tourView(opts: { playerSession: boolean; onDone: () => void }): HTMLElement {
  const tx = texts();
  const steps = tourSteps(opts.playerSession);
  index = Math.min(index, steps.length - 1);
  const wrap = el("section", "sheet tour");
  wrap.setAttribute("aria-roledescription", "tour");

  const draw = (focus: "next" | "previous" | null): void => {
    const step = steps[index]!;
    const last = index === steps.length - 1;
    const head = el("div", "tour-head");
    const dots = el("div", "tour-dots");
    steps.forEach((_, i) => dots.append(el("span", i === index ? "tour-dot current" : i < index ? "tour-dot done" : "tour-dot")));
    head.append(el("span", "tour-count", tx.stepOf(index + 1, steps.length)), dots);

    const body = el("div", "tour-body");
    body.dataset.step = step.id;
    body.append(el("div", "tour-icon", step.icon), el("h1", "title tour-title", step.title));
    for (const p of step.text) body.append(el("p", "tour-text", p));
    if (step.chips?.length) {
      const chips = el("div", "tour-chips");
      for (const c of step.chips) chips.append(el("span", "tour-chip", c));
      body.append(chips);
    }

    const nav = el("div", "tour-nav");
    const previous = button("ghost tour-previous", tx.previous, () => go(-1));
    previous.disabled = index === 0;
    const next = button("primary tour-next", last ? tx.finish : tx.next, () => (last ? finish() : go(1)));
    nav.append(previous, next);

    const foot = el("div", "tour-foot");
    if (!last) foot.append(button("link tour-skip", tx.skip, finish));
    foot.append(el("span", "tour-keys", tx.keys));

    wrap.replaceChildren(head, body, nav, foot);
    const target = focus === "previous" && !previous.disabled ? previous : focus ? next : null;
    target?.focus({ preventScroll: true });
  };

  const go = (delta: number): void => {
    const to = index + delta;
    if (to < 0 || to >= steps.length) return;
    index = to;
    draw(delta < 0 ? "previous" : "next");
  };

  const finish = (): void => {
    stopKeys();
    index = 0;
    opts.onDone();
  };

  stopKeys();
  keyHandler = (event) => {
    if (!wrap.isConnected) return stopKeys();
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement | null;
    if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (index === steps.length - 1) finish();
      else go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };
  document.addEventListener("keydown", keyHandler);
  draw(null);
  return wrap;
}

function stopKeys(): void {
  if (keyHandler) document.removeEventListener("keydown", keyHandler);
  keyHandler = null;
}
