# Discover

The *Découvrir* part of the home page holds experiments rather than
exercises: something to do, not just something to answer. The roadmap is in
the project's planning notes; this page describes what exists.

- [The pattern](#the-pattern)
- [The probability lab](#the-probability-lab)
- [Heads or tails](#heads-or-tails)
- [Logic grids](#logic-grids)
- [Randomness and experiment numbers](#randomness-and-experiment-numbers)
- [What is saved](#what-is-saved)
- [Checks and tests](#checks-and-tests)
- [Code](#code)

## The pattern

Each activity follows the same steps, known in science teaching as
*predict, observe, explain*:

1. **Predict:** one question before anything happens.
2. **Observe:** an experiment the learner runs and controls.
3. **Compare and explain:** the result next to the theory, and next to the prediction.
4. **Check:** one follow-up question, on the misconception the activity is about.

The common shape was extracted when the second lab, the coins, was written,
not before: `src/discover/lab.ts` holds what both share (see [Code](#code)).
Each lab keeps its own state, steps and texts.

## The probability lab

Two dice, the sum of their dots. Ages from about 8: everything is counted
("30 times out of 100"); percentages and the fraction are there for older
learners.

| Step | What happens |
|---|---|
| 1. Predict | Which sum comes up most often: 2 to 12, or *Toutes autant* (all the same, the usual misconception: eleven sums, so 1 in 11 each). How many 7s in 100 rolls: a slider. Both are required before rolling. |
| 2. Roll | *Lancer une fois*, × 10, × 100, × 1,000. The dice are drawn with their dots. Below: the counts per sum; the series of 10 (each × 10 adds one, showing how many 7s it gave: they vary a lot); the share of 7s after each roll, on a logarithmic axis from 1 to 10,000. |
| 3. Compare | From 100 rolls. The 6 × 6 grid of the two dice, the six 7s highlighted on the diagonal, the sum the learner predicted outlined. Then \(P(7) = 6/36 = 1/6\), a table of the eleven sums (squares, theory, measured), and the predictions against the results. The 1-in-6 line appears on the chart, and the expected count on each bar. Rolling can go on: the curve gets closer to the line. |
| 4. Understand | Short series vary; the share settles with many rolls (the law of large numbers); the dice have no memory. |
| 5. Check | "The last three rolls were 7s. On the next roll, a 7 is…" less likely, still 1 in 6, more likely. The gambler's fallacy. |

**Motion.** One roll tumbles for a moment; a batch of 10 is shown roll by
roll; larger batches are counted at once. With *reduced motion* set in the
system, every roll is shown at once. The rolls are counted at the click, and a
new click during an animation stops it: a quick child loses no roll.

**Keyboard and screen readers.** Every control is a button or a field; the
focus stays on the roll button after a roll. The dice, the charts and the
grid carry labels with their figures, and the table of the eleven sums gives
the same numbers as the chart.

## Heads or tails

A coin, and its streaks. Three misconceptions, each with its own measure:

- **The coin is "due":** after a run of heads, tails is not more likely. The coin has no memory.
- **Long runs look suspicious,** but they are normal.
- **HTTHTH looks likelier than HHHHHH,** but every precise sequence has the same chance.

| Step | What happens |
|---|---|
| 1. Predict | In 100 flips, the longest run of the same side: 2 to 8, or 9 or more (the usual guess, 3 or 4, is far too short). Which of two sequences of 6 is likelier: six heads, a mixed one, or *both the same*. Both are required. |
| 2. Flip | × 1, × 10, × 100, × 1,000. The coin: heads filled, tails outlined, each with its initial, so the side reads without colour. Below: the last 100 flips, runs of 5 or more circled; after a run of 3 or more, whether the next flip continued or broke it; the number of runs of each length; the share of heads. |
| 3. Compare | From 100 flips. The longest run of the first 100 flips against the prediction, and the exact chances of each longest run in 100 flips, the learner's row highlighted. The 64 sequences of 6, \(P = (1/2)^6 = 1/64\) for each. What followed the runs, against one in two. The expected number of runs of each length appears on the bars (each longer run about half as frequent), and the 1-in-2 marks on the chart and the run-breaking bars. |
| 4. Understand | No memory; long runs are normal (6 or more in 100 flips: about 4 times in 5); every sequence is as likely, a regular one just stands out. |
| 5. Check | Lea makes up 20 flips, Tom flips a real coin 20 times: in which list is a run of 4 likelier? The real one: 77 %. People who invent lists avoid runs, which is how invented lists are spotted. |

**The exact theory** is computed, not simulated:

- **Longest run:** the probability that no run in n flips is longer than k comes from counting the sequences whose runs are all at most k, by a recurrence. In 100 flips, the longest run is most often 6 (26.4 %); 4 or less happens 2.8 % of the time.
- **Runs of each length:** expected numbers from where a run can sit. It needs k − 1 equal neighbours and a different flip on each side that exists.

`npm run check:discover` compares both against a brute-force count of every sequence.

## Logic grids

Grids of n × n: every row and every column holds 1 to n once. Puzzles follow
the Discover shape in their own way. The rules come first, then a grid to work
out. The explanation step is the hints, which explain a deduction instead of
giving a number.

| Level | Grid | Clues | Age, roughly |
|---|---|---|---|
| 1 | 4 × 4 | 7 numbers given | from 8 |
| 2 | 4 × 4 | cages with + | from 9 |
| 3 | 5 × 5 | cages with + and − | from 11 |
| 4 | 6 × 6 | cages with + − × ÷ | from 13 |

**A cage** is a group of squares outlined in thick lines. Its numbers, combined
by its operation, make the number in its corner: *7+*, *2÷*. For − and ÷ the
larger number comes first. A number may repeat inside a cage when the two
squares are not in the same row or column. A one-square cage is written in,
like a given number. (The puzzle is commonly known by a trademarked name; the
app says "cages".)

**Two promises,** kept by construction and verified for 1,200 grids by
`npm run check:discover`:

- **One solution:** a separate brute-force count finds exactly one.
- **No guessing:** the grid is solved by reasoning alone. The generator keeps a grid only if its logical solver, which uses the moves a person uses, finishes it.

**The moves**, from the easiest; they are also the hints:

| Move | Example of the hint |
|---|---|
| A square whose row and column leave one number | "Its row already has 1 and 3; its column, 4. Only 2 is left." |
| A number with one place left in a row or column | "In this row, 3 can only go in the circled square: in the other empty squares, it is already in their column." |
| A cage's arithmetic, with the row and column | "This cage of 2 squares makes 30×: 5 × 6. Its row already has 2: only 5 is left." |
| Several clues combined: neighbouring cages, and from level 3 two squares of a row or column sharing the same two numbers (a *pair*) | The least concrete hint, so a grid keeps few of them: none on levels 1 and 2, at most one on level 3, two on level 4 (under 2 % of all steps). |

**Hints come in two stages.** The first circles a square and says what kind
of reasoning works there, without the number. The second gives the reasoning
in full, with the number. Hints follow the grid as the child has filled it: a
wrong number is pointed out first ("The circled square is not right"), so a
hint never builds on a mistake.

**Feedback, without giving answers away:**

- **The rules, at once:** the same number twice in a row or column, or a full cage that misses its target, turns red as soon as it is written.
- **The solution, on request only:** whether a number matches it is shown only with *Vérifier* (check).

**Entry:** click or tap a square, then a number on the pad. By keyboard: the
arrows move, digits write, Backspace or Delete erase, N switches to notes.
Notes are small numbers, what a square could be. The grid has a single tab
stop, and every square is labelled (row, column, cage, number or notes).

**Solved:** the time from the first number written to the last, and the
number of hints. There is no timer while solving.

**Grid numbers:** *Grille n° 4821*. The same number at the same level gives
the same grid, to compare with someone. Each level keeps its own grid while
the page is open.

## Randomness and experiment numbers

An experiment is its seed: *Expérience n° 4821*. The rolls and the flips
come from the seeded generator of the tests (`shared/quiz/rng.ts`,
mulberry32), so:

- the same number gives the same rolls, whatever the batches (10 then 100, or 110 at once);
- *Refaire l'expérience n°* replays an experiment: two children can roll the same dice and compare what they predicted;
- the browser tests know in advance what the page will show.

A new experiment draws its number from the system's secure generator
(`crypto.getRandomValues`), from 1 to 9,999. The generator itself is tested
(below), so "the dice are fair" is checked, not assumed.

The grids use the same generator: a grid is its number and its level.

## What is saved

Nothing yet. Each lab's experiment, and each level's grid, lives in the page:
a language change keeps it, going elsewhere and back keeps it, a reload starts
anew. The update watcher does not reload during an experiment that has trials
and is not finished, nor during a grid that has a number written and is not
solved.

Recording predictions is the planned next step: a learner who predicted
"all the same" holds a misconception, which should come back later, as the
QCM's kinds of question to review do.

## Checks and tests

`npm run check:discover` (a few seconds):

- the exact distribution: 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1 ways for the sums 2 to 12, 36 in all; \(P(7) = 1/6\), \(P(2) = 1/36\), \(P(4) = 1/12\);
- reproducibility: same seed, same rolls in other batches; another seed, other rolls;
- the generator: a million rolls for each of five seeds, chi-square tests on the eleven sums (limit 29.6, 10 degrees of freedom, p = 0.001) and on the six faces of each die (limit 20.5), and the share of 7s within 0.002 of 1/6. A die biased by only 10 % on the sum 12 scores about 280.

For the coin:

- **Exact formulas against brute force:** the longest-run probabilities are compared with every sequence of up to 16 flips for every k, and with the full distribution of 20 flips (1,048,576 sequences). The expected runs of each length are compared with every sequence of 12.
- **The taught figures:** 6 is the most likely longest run in 100 flips; a run of 6 or more happens 80.7 % of the time; a run of 4 or more in 20 flips, 76.8 %.
- **The bookkeeping:** a hand-made sequence (H H H T H H H H T) checks the counts of runs and of what followed a streak.
- **The generator:** a million flips per seed, heads against tails (limit 10.83), and the flip after a streak within 0.005 of one in two. Then the longest run of 20,000 series of 100 flips against its exact distribution (limit 24.3, 7 degrees of freedom).

For the logic grids:

- **Cage arithmetic by hand:** 7+ on two squares of a 4 × 4 row is 3 + 4 only; 6+ on an L of three is 1 + 1 + 4 or 1 + 2 + 3; and others.
- **300 grids per level:**
  - a Latin square;
  - cages that cover the grid once, are connected, and use the level's operations, with − and ÷ on two squares only;
  - every cage holds on the solution;
  - solved by reasoning alone, within the level's limit of combined steps;
  - exactly one solution, by the independent brute-force count;
  - the same number gives the same grid.
- **Hints from partial grids:** 200 random grids per level, partly filled at random, always give a next step, on an empty square, with the solution's number.

Browser tests (`tests/e2e/discover.spec.ts`):

- **Both labs:** the whole sequence on experiment 4821, with the figures computed by the engine (counts, longest run, circled runs, what followed the streaks); the verdicts on the predictions; the keyboard; no sideways scrolling at 360 px.
- **The dice:** a language change in the middle of an experiment; the animation, and a click during it.
- **Together:** each lab keeps its own experiment.
- **The grids** (`tests/e2e/puzzles.spec.ts`):
  - level 1: givens, a broken rule shown at once and erased, a given number that cannot be changed, a hint in two stages with the engine's square and number, the rest typed by keyboard;
  - level 4 on grid 4821: cage labels, *Vérifier* finding a wrong number, the next hint pointing at it, then the whole grid **solved with hints alone**;
  - notes, and no sideways scrolling at 360 px;
  - each level keeping its grid.

The language test goes through every step of both labs in the three
languages; the update test checks that a new version waits during an
experiment.

## Code

| File | Role |
|---|---|
| `shared/discover/experiment.ts` | What experiments share: experiment numbers, the points of a running chart, the chi-square statistic |
| `shared/discover/dice.ts` | Two dice: ways and exact probabilities, an experiment (counts, series, the share of 7s) |
| `shared/discover/coins.ts` | A coin: flips, runs, what follows a streak; the exact longest-run distribution and expected runs |
| `shared/discover/puzzles.ts` | Logic grids: levels, generation, the logical solver and its reasons (the hints), the brute-force count of solutions |
| `src/discover/lab.ts` | What the labs share: redrawing with the focus kept, header, prediction choices, batch buttons, interruptible animation, counts chart with theory marks, running-share chart, reveal, explanation, check question, replay |
| `src/discover/dice.ts` | The dice lab: its steps, the dice, the series of 10, the 36-square grid |
| `src/discover/coins.ts` | The coins lab: its steps, the coin, the ribbon of the last 100 flips, what follows a streak, the longest-run table |
| `src/discover/puzzles.ts` | The logic grids: levels, the grid with its cages, entry by pad and keyboard, notes, rule conflicts, check, hints in two stages, solved |
| `src/discover/index.ts` | The list of labs, the view of the one open, and whether any has an experiment under way |
| `src/discover/i18n.ts` | Their texts in French, Spanish and English; numbers and percentages in each language's format |
| `server/check-discover.ts` | `npm run check:discover` |
| `tests/e2e/discover.spec.ts` | Browser tests |
