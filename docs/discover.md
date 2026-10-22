# Discover

The *Découvrir* part of the home page holds experiments rather than
exercises: something to do, not just something to answer. The roadmap is in
the project's planning notes; this page describes what exists.

- [The pattern](#the-pattern)
- [The probability lab](#the-probability-lab)
- [Heads or tails](#heads-or-tails)
- [Logic grids](#logic-grids)
- [The physics playground](#the-physics-playground)
- [Randomness and experiment numbers](#randomness-and-experiment-numbers)
- [What is saved](#what-is-saved)
- [Checks and tests](#checks-and-tests)
- [Physics checks](#physics-checks)
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

## The physics playground

Phase 2 of the roadmap: four labs in their own group on the home page,
*Physique*. They follow the Discover pattern, with two differences:

- **Trials are not random.** The same settings give the same result, so there is no experiment number; *Tout recommencer* starts the predictions again.
- **The experiment is a simulation.** Each engine computes the motion from the forces, step by step, as a physics engine would; the exact solution is written separately. `npm run check:physics` compares the two, because a physics simulation that drifts teaches the wrong thing. The comparison step shows both to the learner.

Common parts are in `src/discover/physics-ui.ts`: sliders that redraw the
picture while they are dragged (without redrawing themselves, which would
lose the drag), SVG drawing, tables, formulas, verdicts.

### Throw a ball (the anchor)

A ball, no air, g = 9.81 m s⁻².

| Step | What happens |
|---|---|
| 1. Predict | The angle that throws farthest from the ground at 15 m/s: 15°, 30°, 45°, 60° or 75°. A flag on a slider, where a throw at 30° will land (0 to 40 m). The angle is required. |
| 2. Throw | Angle (5° to 85°), speed (5 to 25 m/s), launch height (0 to 20 m); an arrow shows the aim. *Lancer* flies the ball in real time on a field drawn to scale (the same metres on both axes, so the path has its true shape, rescaled to fit). The last five paths stay; the latest landing is marked with its distance. For the predicted throw, the gap to the flag. A table of throws: distance, time in the air, highest point. |
| 3. Compare | From 3 throws. The distance against the angle at the current speed and height, exact, with the throws made at them and the best angle marked (45° from the ground, less from a height). \(R = v^2 \sin 2\theta / g\), \(x(t)\), \(y(t)\). Each throw's simulated distance next to the formula's, to the millimetre. The predictions: 45°, complementary angles landing together (from the learner's own pair of throws when there is one), the flag against 19.9 m. |
| 4. Understand | Two motions in one; up as long as down; why 45°; mass. |
| 5. Check | A marble dropped from a table, another pushed off at the same moment: which lands first? Both at the same time; a multi-flash picture (one flash every 0.05 s) shows them at the same height at every flash. |

**The engine** (`shared/discover/projectile.ts`) integrates the weight with
velocity Verlet at 240 steps per second and places the landing by solving
the last step's parabola. The mass is in the force and cancels.

### The pendulum

A ball on a string, no friction.

| Step | What happens |
|---|---|
| 1. Predict | A heavy ball or a light one on the same string: which swings faster (heavy, light, the same)? A string 4 times longer: a swing takes the same time, 2, 4 or 16 times longer? Both required. |
| 2. Try | Length (0.25 to 2.5 m), mass (50 g, 200 g, 1 kg, 5 kg) and release angle (5° to 80°). The pendulum swings in real time; the dashed arc shows the release angle. *Chronométrer 10 oscillations* times 10 swings on the simulation and adds them to a table and to a chart of the time of a swing against length. |
| 3. Compare | From 3 measurements. \(T = 2\pi\sqrt{L/g}\) drawn on the chart. Each measurement against the small-angle formula and the exact period. The predictions: mass (with the learner's own measurements that differ by the mass alone, or an invitation to make them), √L, and how much longer the widest swing is than the formula (7.3 % at 60°). |
| 4. Understand | The mass cancels; √L; amplitude barely matters (pendulum clocks); Galileo. |
| 5. Check | A child and an adult on the same swing: about the same. |

**The engine** (`shared/discover/pendulum.ts`) integrates
\(\ddot\theta = -(g/L)\sin\theta\), from the force with the mass in it, by
fourth-order Runge–Kutta (1 ms steps for timing; the animation uses 600
steps per second of real time). The stopwatch times 10 swings between
passes through the bottom, interpolated within a step. The exact period is
\(4\sqrt{L/g}\,K(\sin(\theta_0/2))\), K by the arithmetic–geometric mean.

### Lenses

A thin converging lens, a lit arrow 3 cm high, a screen; distances in cm.

| Step | What happens |
|---|---|
| 1. Predict | A card over the top half of the lens: the image loses its top half, its bottom half, stays whole and dimmer, or disappears? The arrow comes closer: must the screen move closer, away, or stay? Both required. |
| 2. Try | Arrow distance (5 to 60 cm), screen distance (5 to 120 cm), focal length (10, 15, 20 cm), the card. The bench shows the cone of light from the arrow's tip, bent by the lens up to the screen (rays the card stops are dashed). *Sur l'écran* shows the image: upside down, blurred by the spread of the tip's light on the screen, dimmed by the share of light that gets through. Sharp within 3 % of the image distance; *Noter cette position* only then. |
| 3. Compare | From 3 sharp positions with the arrow at different distances. \(1/d + 1/d' = 1/f\) against the positions found. A three-ray diagram for the current arrow, with the image (dashed and traced back when virtual). The predictions, and whether the card was tried. |
| 4. Understand | A cone of light per point; the card dims; closer means farther and larger, the same size at 2f; inside f, a magnifying glass. |
| 5. Check | Can the image in a magnifying glass be caught on a screen? No: it is virtual. |

**The engine** (`shared/discover/lenses.ts`) traces each ray: the lens bends
it by −y/f. The image comes from the lens equation; the screen's image from
the traced rays (where they land, how far they spread, how many pass).

### Circuits

A 6 V battery and identical bulbs of 12 Ω (3 W alone).

| Step | What happens |
|---|---|
| 1. Predict | Two bulbs in series, two in parallel: does each shine more, the same or less than a bulb alone? Both required. |
| 2. Connect | Six circuits: 1 bulb, 2 and 3 in series, 2 and 3 in parallel, 1 + 2 in parallel. Bulbs glow by their power; ammeters on the wires read the current (in series: the same before, between and after the bulbs). A bulb is a button: touch it, or Enter, to unscrew it or screw it back. |
| 3. Compare | Once a series and a parallel circuit have been tried. Every circuit: each bulb's power against a bulb alone, the battery's current. \(I = U/R\), \(P = UI\), series and parallel in words. The predictions, and a note: a real filament's resistance falls when it is cooler, so series bulbs are a little less dim than this model says. |
| 4. Understand | Current is not used up; one path or several; the battery works harder in parallel; homes are wired in parallel. |
| 5. Check | 0.25 A into the first of two bulbs in series: how much out of the second? The same. |

**The engine** (`shared/discover/circuits.ts`) solves any layout of bulbs by
nodal analysis: Kirchhoff's current law at every junction, Ohm's law in every
bulb, the battery fixing the voltage between its terminals. A tiny
conductance from every junction keeps a junction left floating by an
unscrewed bulb defined.

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

Nothing yet, in any lab, the physics playground included. Each lab's experiment, and each level's grid, lives in the page:
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

## Physics checks

`npm run check:physics` (about 15 seconds), in `server/check-physics.ts`:

- **The throw:**
  - 1,278 flights (speeds 2 to 25 m/s, angles 0° to 85°, heights 0 to 20 m, three masses): range and time against the exact formulas, every integrated point on the exact parabola, the energy constant;
  - 45° best from the ground, lower from a height, complementary angles tied, \(v^2\sin 2\theta/g\);
  - the taught figure, 19.9 m at 15 m/s and 30°, and the dropped and pushed marbles at the same height at every flash.
- **The pendulum:**
  - K(k) by the arithmetic–geometric mean against its power series, and Gauss's constant;
  - the taught figures: at 90° the period is 18.0 % longer than \(2\pi\sqrt{L/g}\), at 60° 7.3 %, at 20° 0.77 %; and \(1 + \theta_0^2/16\) at small angles;
  - 50 pendulums (5 lengths, angles 2° to 170°): the timed period within 10⁻⁷ of the exact one, the same with another mass, and the energy within 10⁻⁸ over 100 swings;
  - a negative control: plain Euler, same step, gains more than 10 % of its energy, so the test would catch a drifting integrator.
- **The lens:** 171 positions (three focal lengths, arrow at 3 to 60 cm), with and without the card: the lens equation, real images only beyond f, every traced ray through the image point, the card passing half the light and none of the image, the blur formula against the traced spread, the three principal rays meeting at the image.
- **The circuits:** the six circuits with every combination of bulbs unscrewed (34 cases): Kirchhoff's current law at every junction, the battery's power equal to the bulbs', no current through an unscrewed bulb, and the series and parallel formulas; then what the lab teaches (a quarter of the power in series of two, one out all out in series, the other unchanged in parallel, 4/9 for the first bulb of the mixed circuit).

Browser tests (`tests/e2e/physics.spec.ts`): each lab through its five
steps at 360 px without sideways scrolling, with the figures computed by the
engines (the landing distance and time, the timed period with two masses and
a quarter of the length, the sharp screen positions, the ammeter readings
with a bulb unscrewed, by mouse and by keyboard); the labs in Spanish and
English, keeping their state; and one test with motion, the ball in flight
and the pendulum swinging.

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
| `shared/discover/projectile.ts` | A thrown ball: the flight integrated from the forces, the exact flight, the best angle, the dropped and pushed marbles |
| `shared/discover/pendulum.ts` | A pendulum: Runge–Kutta from the force, the timed period, the exact period by the elliptic integral, energy |
| `shared/discover/lenses.ts` | A thin lens: the image, traced rays, what the screen shows, sharpness, the three principal rays |
| `shared/discover/circuits.ts` | Bulbs and a battery: six layouts solved by nodal analysis |
| `src/discover/activities.ts` | The ids of every Discover activity, and which are physics labs |
| `src/discover/physics-ui.ts` | What the physics labs share: head, sliders that redraw while dragged, SVG drawing, tables, formulas, verdicts, restart |
| `src/discover/throw.ts`, `pendulum.ts`, `lenses.ts`, `circuits.ts` | The four physics labs |
| `src/discover/physics-i18n.ts` | Their texts in French, Spanish and English; decimals and percentages in each language's format |
| `server/check-discover.ts` | `npm run check:discover` |
| `server/check-physics.ts` | `npm run check:physics` |
| `tests/e2e/discover.spec.ts`, `tests/e2e/physics.spec.ts` | Browser tests |
