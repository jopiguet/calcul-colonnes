/**
 * Listening to a course (docs/sounds.md): the ▶ buttons beside the words of
 * a lesson and on the letter cards, and the one sound playing at a time.
 * The sounds are files made at build time (server/sounds-build.ts); the
 * browser only plays them.
 */
import type { CourseSounds } from "../shared/lessons/api";
import { lessons } from "./store";
import { soundKey, soundTargets } from "./sound-targets";
import { lt } from "./lessons-i18n";

const lists = new Map<string, Promise<CourseSounds>>();

/** A course's sounds, asked once. */
export function courseSounds(course: string): Promise<CourseSounds> {
  let list = lists.get(course);
  if (!list) {
    list = lessons.sounds(course).catch(() => {
      lists.delete(course);
      return {};
    });
    lists.set(course, list);
  }
  return list;
}

let playing: HTMLAudioElement | null = null;

export function playSound(course: string, file: string): void {
  playing?.pause();
  const audio = new Audio(`/api/courses/${encodeURIComponent(course)}/sounds/${file}`);
  playing = audio;
  void audio.play().catch(() => {});
}

/** A ▶ button saying the word; its title gives the reading when it differs from the word. */
export function soundButton(course: string, key: string, item: { file: string; reading?: string }): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "sound-play";
  b.textContent = "▶\uFE0E";
  b.dataset.sound = key;
  const label = item.reading ? lt("listenReading", { reading: item.reading }) : lt("listen");
  b.title = label;
  b.setAttribute("aria-label", `${label} — ${key}`);
  b.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    playSound(course, item.file);
  });
  return b;
}

/** Adds a ▶ beside each word of the lesson text that has a sound. */
export function addSoundButtons(root: Element, course: string, sounds: CourseSounds): void {
  for (const node of soundTargets(root)) {
    const key = soundKey(node.textContent ?? "");
    const item = sounds[key];
    if (!item) continue;
    const b = soundButton(course, key, item);
    if (node.tagName === "TD") node.append(" ", b);
    else node.after(b);
  }
}
