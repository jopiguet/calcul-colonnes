# Discover

The *Découvrir* part of the home page holds experiments rather than
exercises: something to do, not just something to answer. The roadmap is in
the project's planning notes; this page describes what exists.

- [The pattern](#the-pattern)
- [The probability lab](#the-probability-lab)
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

There is one activity so far. The common shape (steps, state, texts) is
extracted when the second one is written, not before.

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

## Randomness and experiment numbers

An experiment is its seed: *Expérience n° 4821*. The rolls come from the
seeded generator of the tests (`shared/quiz/rng.ts`, mulberry32), so:

- the same number gives the same rolls, whatever the batches (10 then 100, or 110 at once);
- *Refaire l'expérience n°* replays an experiment: two children can roll the same dice and compare what they predicted;
- the browser tests know in advance what the page will show.

A new experiment draws its number from the system's secure generator
(`crypto.getRandomValues`), from 1 to 9,999. The generator itself is tested
(below), so "the dice are fair" is checked, not assumed.

## What is saved

Nothing yet. The experiment lives in the page: a language change keeps it, a
reload starts a new one. The update watcher does not reload during an
experiment that has rolls and is not finished.

Recording predictions is the planned next step: a learner who predicted
"all the same" holds a misconception, which should come back later, as the
QCM's kinds of question to review do.

## Checks and tests

`npm run check:discover` (a few seconds):

- the exact distribution: 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1 ways for the sums 2 to 12, 36 in all; \(P(7) = 1/6\), \(P(2) = 1/36\), \(P(4) = 1/12\);
- reproducibility: same seed, same rolls in other batches; another seed, other rolls;
- the generator: a million rolls for each of five seeds, chi-square tests on the eleven sums (limit 29.6, 10 degrees of freedom, p = 0.001) and on the six faces of each die (limit 20.5), and the share of 7s within 0.002 of 1/6. A die biased by only 10 % on the sum 12 scores about 280.

Browser tests (`tests/e2e/discover.spec.ts`): the whole sequence on
experiment 4821, with the counts computed by the engine; the verdicts on the
predictions; the keyboard; a language change in the middle of an experiment;
no sideways scrolling at 360 px; the animation, and a click during it. The
language test goes through every step in the three languages; the update test
checks that a new version waits during an experiment.

## Code

| File | Role |
|---|---|
| `shared/discover/dice.ts` | The engine: ways and exact probabilities, an experiment (counts, series, the share of 7s), the chi-square statistic |
| `src/discover/dice.ts` | The lab: its five steps, the dice, the charts in plain HTML and SVG, the 36-square grid |
| `src/discover/i18n.ts` | Its texts in French, Spanish and English; numbers and percentages in each language's format |
| `server/check-discover.ts` | `npm run check:discover` |
| `tests/e2e/discover.spec.ts` | Browser tests |
