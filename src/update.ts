/**
 * Keeps a long-open window current: the installed desktop or phone app, or a
 * tab left open for days.
 *
 * - A new build: each build has an id (vite.config.ts), published in
 *   /version.json. It is checked when the window comes back to the front and
 *   every 15 minutes while it is visible. When it differs, the app reloads at
 *   once if nothing is under way (home page, lists), and otherwise offers a
 *   button, then reloads by itself at the next quiet moment.
 * - New data: coming back after a few minutes, a quiet screen is drawn again
 *   from the server (words due, a newly imported book).
 *
 * index.html and version.json are served with Cache-Control: no-cache
 * (server/index.ts), so a reload always gets the current build.
 */
import { button, el } from "./dom";
import { t } from "./i18n";

declare const __BUILD_ID__: string;

const CHECK_EVERY = 15 * 60_000;
/** Back after at least this long: the screen is drawn again with fresh data. */
const REFRESH_AFTER = 2 * 60_000;
const MIN_GAP = 30_000;

export interface UpdateHooks {
  /** Nothing under way that a reload would lose (no exercise, test or vocabulary session). */
  idle(): boolean;
  /** Draws the current screen again from the server. */
  refresh(): void;
}

let pending = false;
let hooks: UpdateHooks | null = null;

async function latestBuild(): Promise<string | null> {
  try {
    const response = await fetch("/version.json", { cache: "no-store" });
    if (!response.ok) return null;
    return ((await response.json()) as { build?: string }).build ?? null;
  } catch {
    return null; // offline: try again later
  }
}

function showBanner(): void {
  if (document.querySelector(".update-banner")) return;
  const banner = el("div", "update-banner");
  banner.setAttribute("role", "status");
  banner.append(el("span", "", t("updateReady")), button("primary small", t("updateNow"), () => location.reload()));
  document.body.append(banner);
}

/** Called at quiet moments (back on the home page): a waiting update is applied. */
export function applyPendingUpdate(): void {
  if (pending && hooks?.idle()) location.reload();
}

export function watchForUpdates(h: UpdateHooks): void {
  hooks = h;
  let lastCheck = 0;
  let hiddenSince = document.visibilityState === "hidden" ? Date.now() : 0;

  const check = async (): Promise<void> => {
    if (__BUILD_ID__ === "dev" || Date.now() - lastCheck < MIN_GAP) return;
    lastCheck = Date.now();
    const build = await latestBuild();
    if (!build || build === __BUILD_ID__) return;
    pending = true;
    if (h.idle()) location.reload();
    else showBanner();
  };

  const back = (): void => {
    const away = hiddenSince ? Date.now() - hiddenSince : 0;
    hiddenSince = 0;
    void check().then(() => {
      if (!pending && away >= REFRESH_AFTER && h.idle()) h.refresh();
    });
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") hiddenSince = Date.now();
    else back();
  });
  window.addEventListener("focus", () => void check());
  window.addEventListener("online", () => void check());
  setInterval(() => {
    if (document.visibilityState === "visible") void check();
  }, CHECK_EVERY);
}
