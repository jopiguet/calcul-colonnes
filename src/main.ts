import "./style.css";
import {
  columnCount,
  parseAnswer,
  randomExercise,
  toColumns,
  type Exercise,
} from "./exercise";

const MIN_MAXIMUM = 10; // the top number is drawn in [10, maximum]
const MAX_MAXIMUM = 999_999;
const DEFAULT_MAXIMUM = 100;
const STORAGE_KEY = "calcul-colonnes.maximum";

function clampMaximum(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_MAXIMUM;
  return Math.min(MAX_MAXIMUM, Math.max(MIN_MAXIMUM, Math.trunc(value)));
}

function loadMaximum(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? DEFAULT_MAXIMUM : clampMaximum(Number(saved));
  } catch {
    return DEFAULT_MAXIMUM;
  }
}

function saveMaximum(value: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // storage unavailable (private mode…): the setting just won't be remembered
  }
}

type Phase = "answering" | "checked" | "finished";

interface State {
  maximum: number;
  exercise: Exercise;
  score: number;
  questions: number;
  phase: Phase;
}

const initialMaximum = loadMaximum();

const state: State = {
  maximum: initialMaximum,
  exercise: randomExercise(initialMaximum),
  score: 0,
  questions: 0,
  phase: "answering",
};

const app = document.querySelector<HTMLElement>("#app")!;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function render(): void {
  app.replaceChildren(header(), state.phase === "finished" ? summary() : sheet());
}

function header(): HTMLElement {
  const bar = el("header", "bar");

  const level = el("label", "level");
  level.append("Nombre du haut jusqu'à ");
  const input = el("input");
  input.type = "number";
  input.inputMode = "numeric";
  input.min = String(MIN_MAXIMUM);
  input.max = String(MAX_MAXIMUM);
  input.step = "1";
  input.value = String(state.maximum);
  input.addEventListener("change", () => {
    const maximum = clampMaximum(input.value === "" ? state.maximum : Number(input.value));
    if (maximum === state.maximum) {
      input.value = String(maximum);
      return;
    }
    state.maximum = maximum;
    saveMaximum(maximum);
    next();
  });
  level.append(input);

  const score = el("p", "score", `Score : ${state.score}/${state.questions}`);
  bar.append(level, score);
  return bar;
}

function sheet(): HTMLElement {
  const { exercise, maximum } = state;
  const columns = columnCount(maximum);
  const wrap = el("section", "sheet");

  const grid = el("div", "grid");
  grid.style.setProperty("--columns", String(columns));

  const names = [
    "unités",
    "dizaines",
    "centaines",
    "milliers",
    "dizaines de milliers",
    "centaines de milliers",
    "millions",
  ];
  const nameOf = (i: number): string => names[columns - 1 - i] ?? `colonne ${i + 1}`;

  // Carry row: a small optional box above every column except the units.
  // Carries are scratch work, they are not checked.
  grid.append(el("span", "carry-cell"));
  const carries: (HTMLInputElement | null)[] = [];
  for (let i = 0; i < columns; i++) {
    if (i === columns - 1) {
      carries.push(null);
      grid.append(el("span", "carry-cell"));
      continue;
    }
    const carry = el("input", "carry");
    carry.type = "text";
    carry.inputMode = "numeric";
    carry.autocomplete = "off";
    carry.tabIndex = -1; // reached with ↑ or a tap, so Tab stays on the answer
    carry.setAttribute("aria-label", `retenue des ${nameOf(i)}`);
    carries.push(carry);
    const holder = el("span", "carry-cell");
    holder.append(carry);
    grid.append(holder);
  }

  const row = (kind: string, operator: string, digits: string[]): void => {
    grid.append(el("span", "cell operator", operator));
    for (const d of digits) grid.append(el("span", `cell ${kind}`, d));
  };
  row("top", "", toColumns(exercise.top, columns));
  row("bottom", exercise.operator, toColumns(exercise.bottom, columns));
  grid.append(el("div", "rule"));

  // Answer row: one box per column, index 0 = leftmost, last = units.
  grid.append(el("span", "cell operator", "="));
  const boxes: HTMLInputElement[] = [];
  for (let i = 0; i < columns; i++) {
    const box = el("input", "cell box");
    box.type = "text";
    box.inputMode = "numeric";
    box.autocomplete = "off";
    box.setAttribute("aria-label", nameOf(i));
    boxes.push(box);
    grid.append(box);
  }

  const message = el("p", "message");
  message.setAttribute("role", "status");

  const actions = el("div", "actions");
  const main = el("button", "primary", "Valider");
  main.type = "button";
  const quit = el("button", "ghost", "Terminer");
  quit.type = "button";
  actions.append(main, quit);

  const focus = (i: number): void => {
    const box = boxes[Math.max(0, Math.min(columns - 1, i))];
    box?.focus();
    box?.select();
  };

  const check = (): void => {
    const parsed = parseAnswer(boxes.map((b) => b.value));
    if (parsed.kind !== "value") {
      message.className = "message warn";
      message.textContent =
        parsed.kind === "empty"
          ? "😵‍💫 Écris ta réponse avec des chiffres"
          : "😵‍💫 Il manque un chiffre dans ta réponse";
      focus(parsed.kind === "empty" ? columns - 1 : boxes.findIndex((b, i) => b.value === "" && boxes.slice(0, i).some((p) => p.value !== "")));
      return;
    }
    const correct = parsed.value === exercise.answer;
    state.questions += 1;
    if (correct) state.score += 1;
    state.phase = "checked";

    message.className = correct ? "message good" : "message bad";
    message.textContent = correct
      ? "✅ Bravo"
      : `❌ Dommage, la réponse était ${exercise.answer}`;
    for (const b of boxes) b.disabled = true;
    for (const c of carries) if (c) c.disabled = true;
    main.textContent = "Suivant";
    main.focus();
    app.querySelector(".score")!.textContent = `Score : ${state.score}/${state.questions}`;
  };

  boxes.forEach((box, i) => {
    box.addEventListener("focus", () => box.select());
    box.addEventListener("input", () => {
      // Keep only the last digit typed; anything else is ignored.
      const digit = box.value.replace(/\D/g, "").slice(-1);
      box.value = digit;
      message.textContent = "";
      if (digit && i > 0) focus(i - 1); // units → tens → hundreds…
    });
    box.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          check();
          break;
        case "Backspace":
          if (box.value === "" && i < columns - 1) {
            event.preventDefault();
            const previous = boxes[i + 1]!;
            previous.value = "";
            focus(i + 1);
          }
          break;
        case "ArrowUp": {
          const carry = carries[i];
          if (carry) {
            event.preventDefault();
            carry.focus();
            carry.select();
          }
          break;
        }
        case "ArrowLeft":
          event.preventDefault();
          focus(i - 1);
          break;
        case "ArrowRight":
          event.preventDefault();
          focus(i + 1);
          break;
      }
    });
  });

  const focusCarry = (from: number, step: -1 | 1): void => {
    for (let i = from + step; i >= 0 && i < columns; i += step) {
      const carry = carries[i];
      if (carry) {
        carry.focus();
        carry.select();
        return;
      }
    }
  };

  carries.forEach((carry, i) => {
    if (!carry) return;
    carry.addEventListener("focus", () => carry.select());
    carry.addEventListener("input", () => {
      const digit = carry.value.replace(/\D/g, "").slice(-1);
      carry.value = digit;
      if (digit) focus(i); // carry written: back down to this column's answer
    });
    carry.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          check();
          break;
        case "ArrowDown":
          event.preventDefault();
          focus(i);
          break;
        case "ArrowLeft":
          event.preventDefault();
          focusCarry(i, -1);
          break;
        case "ArrowRight":
          event.preventDefault();
          focusCarry(i, 1);
          break;
      }
    });
  });

  main.addEventListener("click", () => (state.phase === "checked" ? next() : check()));
  quit.addEventListener("click", () => {
    state.phase = "finished";
    render();
  });

  wrap.append(grid, message, actions);
  queueMicrotask(() => focus(columns - 1)); // start on the units
  return wrap;
}

function summary(): HTMLElement {
  const wrap = el("section", "sheet");
  wrap.append(el("p", "final", `👋 Ton score est de ${state.score}/${state.questions}`));
  const again = el("button", "primary", "Recommencer");
  again.type = "button";
  again.addEventListener("click", () => {
    state.score = 0;
    state.questions = 0;
    next();
  });
  wrap.append(again);
  queueMicrotask(() => again.focus());
  return wrap;
}

function next(): void {
  state.exercise = randomExercise(state.maximum);
  state.phase = "answering";
  render();
}

render();
