# Discover

The *Découvrir* part of the home page holds experiments rather than
exercises: something to do, not just something to answer. The roadmap is in
the project's planning notes; this page describes what exists.

- [The pattern](#the-pattern)
- [The probability lab](#the-probability-lab)
- [Heads or tails](#heads-or-tails)
- [Logic grids](#logic-grids)
- [The physics playground](#the-physics-playground)
- [Astronomy](#astronomy)
- [Chemistry and biology](#chemistry-and-biology)
- [Randomness and experiment numbers](#randomness-and-experiment-numbers)
- [What is saved](#what-is-saved)
- [Checks and tests](#checks-and-tests)
- [Physics checks](#physics-checks)
- [Astronomy checks](#astronomy-checks)
- [Biology checks](#biology-checks)
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

## Astronomy

Phase 3 of the roadmap: four labs in their own group, *Astronomie*. Like
the physics playground they have no experiment number, and they reuse its
parts (`src/discover/physics-ui.ts`). The models are **geometric**: positions
from angles, orbits from Kepler's equation, no physics engine. Each lab
targets one well-documented misconception. `npm run check:astronomy` checks
the geometry against independent computations: an integration, Newton's
gravity, centuries of simulated years.

### The Moon's phases (the anchor)

The misconception: the Earth's shadow makes the phases.

| Step | What happens |
|---|---|
| 1. Predict | Why we see a crescent or a half moon (the Earth's shadow, how much of the lit half we see, the distance). Where the full moon is (between the Sun and the Earth, opposite the Sun, at a right angle). |
| 2. Try | A slider for the day of the lunar month (0 to 29.5, quarter days). Seen from above the North Pole: the Sun's light from the left, the Earth, the Moon on its orbit with its lit half facing the Sun, and the Earth's shadow pointing away from the Sun. Seen from the Earth: the disc as it looks from the northern hemisphere. The phase, the lit share and the rising time; at full moon in this flat drawing, the Moon enters the shadow and turns red, with a note that this is an eclipse, and rare. Not to scale, and said so. |
| 3. Compare | After 4 different phases. \((1 - \cos\varphi)/2\); the month in a table (day, angle, lit share, rising time), the phases seen marked. The predictions; the shadow answer gets its own explanation. |
| 4. Understand | Half always lit; the angle; rising times; the shadow is an eclipse, not a phase. |
| 5. Check | At which phase can a lunar eclipse happen? Only at full moon. |

**The model** (`shared/discover/moon.ts`): elongation from the day
(synodic month 29.530589 days), the lit fraction, the phase names, the
Earth's umbra and penumbra at the Moon's distance from the real radii and
distances, and whether the Moon is in them.

### The seasons

The misconception: summer is when the Earth is closer to the Sun.

| Step | What happens |
|---|---|
| 1. Predict | Why summer is warm (closer to the Sun, our half leaning towards it, a hotter Sun). When the Earth is closest (early January, early July, never). |
| 2. Try | Date, latitude (80° S to 80° N) and the axis's tilt, real (23.4°) or upright. The orbit from above, its true near-circular shape, with the Earth and its north pole leaning the same way all year. The noon Sun at that latitude: its height, and a beam of light spread over more ground when it is low. The noon height, the day's length, the sunlight of the day in kWh/m², the distance in millions of km. A year of sunlight at that latitude, with the date marked; *Noter cette mesure* keeps a reading. With an upright axis the curve goes almost flat. |
| 3. Compare | After 3 readings on different dates. \(h = 90^\circ - \lvert\varphi - \delta\rvert\), the declination from the tilt, \(\cos H_0 = -\tan\varphi\tan\delta\); June against December at the chosen latitude (distance, noon Sun, day, sunlight). The predictions, and the upright axis if it was tried. |
| 4. Understand | The axis keeps its direction; a high Sun concentrates light; long days; distance changes little and the wrong way for the north. |
| 5. Check | Summer in Spain is winter in Argentina. |

**The model** (`shared/discover/seasons.ts`): Kepler's equation for the
Earth's orbit (e = 0.0167, perihelion around 3 January), the Sun's
declination for any tilt, noon height, day length and daily sunlight on
flat ground without atmosphere.

### Eclipses

The misconception: there should be an eclipse every month.

| Step | What happens |
|---|---|
| 1. Predict | Why not at every new moon (the tilted orbit, the Moon too small, one a month seen far away). When a solar eclipse can happen (new moon, full moon, any time). |
| 2. Try | A year at a time (years 1 to 18 of one run): the Moon's height above the Earth's orbital plane at each new and full moon, with the bands close enough for a solar or a lunar eclipse; the eclipses circled and listed (month, kind, total, annular or partial). The orbit's tilt, real or none: without it, every new moon is an eclipse. The Moon's distance from perigee to apogee: the Sun's and the Moon's discs as seen from the Earth, total or annular, and the width of the total strip. |
| 3. Compare | After 3 years. The tilt, the nodes, the limits (about 1.5° and 0.9°), eclipse seasons every 173 days; the years seen with and without the tilt. The predictions. |
| 4. Understand | The tilted orbit; eclipse seasons; the same apparent size; a small shadow. |
| 5. Check | Why a total solar eclipse is seen only along a narrow strip, a lunar one from the whole night side. |

**The model** (`shared/discover/eclipses.ts`): every new and full moon
from the draconic and anomalistic months, the Moon's latitude (inclination
5.145°) and distance (e = 0.0549), the eclipse limits from the real radii
and the parallax, total or annular from the Moon's umbra at the Earth.

### The planets' orbits

The misconceptions: planets move at a steady speed; a planet's year grows
like its distance.

| Step | What happens |
|---|---|
| 1. Predict | Where a planet goes fastest (closest, farthest, the same everywhere). A Mars year, at 1.5 times the Earth's distance (1.5, 1.9, 2.25 or 3.4 years). |
| 2. Try | A mean distance (0.4 to 10 AU) and an eccentricity (0 to 0.8): the ellipse with the Sun at a focus, cut into twelve slices of equal time, alternately shaded, a dot at each slice. The year, and the speeds at perihelion and aphelion. *Garder cette orbite* keeps it. Mars seen from the Earth: a day slider (0 to 800), both orbits with the recent lines of sight reaching the stars, and Mars' direction day by day with the backward spell shaded. |
| 3. Compare | After 3 orbits. Kepler's three laws, \(T^2 = a^3\); the planets from Mercury to Saturn. The predictions; how long Mars goes backwards. |
| 4. Understand | Ellipses; equal areas; the third law; retrograde motion as a point of view. |
| 5. Check | Why Mars goes backwards: the Earth overtakes it. |

**The model** (`shared/discover/orbits.ts`): Kepler's equation, the
planets' elements, equal-time sectors, the vis-viva speed, Mars' direction
from the Earth and its retrograde spells, and an integration of Newton's
gravity for the check.

## Chemistry and biology

Phase 4 of the roadmap: the group *Chimie et biologie*. Its anchor is a
test, **⚗️ Équations chimiques**, balancing chemical equations with
Luma's generators and grading (see
[Question generators](question-generators.md#balancing-equations)). Four
labs follow the Discover pattern; the genetics lab draws its offspring at
random, so it has an experiment number like the probability labs.
`npm run check:biology` checks their models.

### Building molecules

| Step | What happens |
|---|---|
| 1. Predict | The shape of water (straight, bent, stacked) and of CO₂ (straight, bent). |
| 2. Try | Ten molecules (H₂O, CO₂, NH₃, CH₄, O₂, N₂, HCN, CH₂O, C₂H₄, C₂H₂). Atoms on a skeleton; a button per bond cycles single, double, triple. Each atom shows its bonds against its valence (H 1, O 2, N 3, C 4), circled in green when right. When every valence holds: around each central atom, its neighbours, its lone pairs, the shape and the angle. A molecule counts as built once seen with every valence right. |
| 3. Compare | After 3 molecules. VSEPR: groups = neighbours + lone pairs. The molecules built (bonds, lone pairs, shape, angle). The predictions. |
| 4. Understand | Valence; multiple bonds; shapes; lone pairs. |
| 5. Check | Why water is bent and CO₂ straight: oxygen's lone pairs. |

**The model** (`shared/discover/molecules.ts`): valences and outer
electrons, the skeletons, the bonds each atom makes, every valid set of
bond orders, and the shape from the electron groups (water 104.5°, ammonia
107°, tetrahedral 109.5°).

### Mendel's peas

| Step | What happens |
|---|---|
| 1. Predict | The share of green peas from two Aa parents (0, 1/4, 1/2, 3/4). After three yellow peas, is green more likely next (more, still 1/4, less)? The second is the coin lab's misconception, in genetics. |
| 2. Try | Four crosses: Aa × Aa, Aa × aa, AA × aa, AaBb × AaBb. The Punnett square of the cross. Offspring bred one, 10, 100 or 1,000 at a time; their counts by phenotype against the expected shares. |
| 3. Compare | After 100 offspring of one cross. Equally likely gametes; for each cross bred, \(\chi^2\) and its p-value, with what they mean. The predictions, the second linked to the coins. |
| 4. Understand | Alleles; the square; two independent genes (9 : 3 : 3 : 1); chance over few and many. |
| 5. Check | Aa × aa: half green. |

**The model** (`shared/discover/genetics.ts`): gametes, the square,
phenotype shares, children drawn with the tests' seeded generator, and the
chi-square p-value (the regularized incomplete gamma function). Each cross
continues its own sequence: the same experiment number gives the same peas.

### Why cells are small

| Step | What happens |
|---|---|
| 1. Predict | A cell twice as wide: its surface per volume doubles, stays, or halves. Oxygen crosses 10 µm in milliseconds; 1 mm takes 100 times, 10,000 times, or the same. |
| 2. Try | A cube-shaped cell from 1 µm to 1 mm (a power-of-ten slider) and cut into 1 to 5 cubes a side, drawn in perspective. Surface, volume, surface over volume, and oxygen's time to reach the centre. *Noter* keeps a reading. |
| 3. Compare | After 3 different readings. \(6/s\) and \(t = x^2/2D\); a table from 10 µm to 1 mm. The predictions. |
| 4. Understand | Volume grows faster than surface; diffusion; dividing; big organisms. |
| 5. Check | An elephant's cells are the size of a mouse's. |

**The model** (`shared/discover/cells.ts`): surface, volume, cutting a
cube, diffusion time with oxygen's D in water, readable durations, and for
the check a face count and seeded random walks.

### Hares and lynxes

| Step | What happens |
|---|---|
| 1. Predict | Which peaks first (hares, lynxes, together). In the long run (both die out, they settle, they keep cycling). |
| 2. Try | Starting hares and lynxes (thousands); *Lancer* runs 40 years. The populations over time, and lynxes against hares: a closed loop around the equilibrium. The cycle's length and the lynxes' delay; a table of runs with the averages over whole cycles. |
| 3. Compare | After 2 different starts. The Lotka–Volterra equations; the equilibrium \(x^* = \gamma/\delta\), \(y^* = \alpha/\beta\), equal to the averages whatever the start; Euler's spiral, dotted on the loop, as what a naive simulation would show. The predictions. |
| 4. Understand | The cycle; the delay; the averages; the Hudson's Bay Company furs. |
| 5. Check | Hunting lynxes for a while does not change the averages afterwards. |

**The model** (`shared/discover/ecology.ts`): Lotka–Volterra with
Runge–Kutta, Euler as the negative control, the invariant, the equilibrium,
the small cycles' period, peaks.

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

The grids use the same generator: a grid is its number and its level. So
do Mendel's peas: each cross continues its own sequence of the experiment.

## What is saved

Nothing yet, in any lab, the physics, astronomy and biology labs included. Each lab's experiment, and each level's grid, lives in the page:
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

## Astronomy checks

`npm run check:astronomy` (a few seconds), in `server/check-astronomy.ts`:

- **The Moon:** the lit fraction \((1 - \cos\varphi)/2\) against an integration over the Moon's visible surface, every 7.5°; the phase names over the month; the full moon rising at 18 h; the umbra (about 4,600 km) and penumbra (8,176 km) at the Moon; the Moon in the Earth's shadow only within 1.2° to 1.7° of full moon, and never at the quarters.
- **The seasons:** the solstices at ±23.44°, the equinoxes on 20 March and 22 September; perihelion between 2 and 6 January at 0.983 AU; the daily sunlight formula against a minute-by-minute sum at every latitude, every 13 days; 12 h days at the equator and at the equinoxes, mirrored hemispheres; Geneva's noon Sun at 67° and 20°; polar day and night; June sunlight 2.5 times December's in Geneva, December's 1.8 times June's in Buenos Aires. With the tilt at zero: January gets 6–8 % more than July, and the year varies by less than 8 %.
- **Eclipses:** the Sun's apparent radius, the solar and lunar limits; total at perigee, annular at apogee, a total strip of 150 to 300 km; over 2,880 simulated years from 96 starts, 2 to 5 solar eclipses a year, at most 3 umbral lunar ones, every eclipse within 19° of a node, eclipses in seasons, more annular than total; without the tilt, one solar eclipse at every new moon and one lunar at every full moon.
- **The orbits:** \(T^2 = a^3\); back at perihelion after a year; twelve equal-time sectors of equal area to 10⁻⁵; vis-viva against the speed measured along the ellipse; Kepler's ellipse against Newton's gravity integrated step by step (velocity Verlet), for eccentricities up to 0.7; Mars' retrograde spells: 4 or 5 in 10 years, 55 to 85 days each, 2.1 years apart, each centred on the Earth overtaking Mars.

Browser tests (`tests/e2e/astronomy.spec.ts`): the home page group; each
lab through its five steps at 360 px without sideways scrolling, with the
figures computed by the models (the lit share, the noon Sun and the
sunlight, the eclipses of each year, the length of a year).

## Biology checks

`npm run check:biology` (a second or two), in `server/check-biology.ts`:

- **Molecules:** each of the ten skeletons has exactly one set of bond orders satisfying every valence, the expected one; the formula matches the atoms; the shapes and an octet around each central atom; any one bond off breaks a valence; lone pairs squeeze the angles below 109.47°.
- **Genetics:** eight crosses, one and two genes: the square's phenotype shares against a direct enumeration of the alleles; 3 : 1 and 9 : 3 : 3 : 1; the p-value against chi-square tables (3.841, 6.635, 7.815) and \(e^{-\chi^2/2}\) for 2 degrees of freedom; 2,000 seeded experiments rejected by the 5 % test about 5 % of the time; a quarter recessive over 100,000 children; the same number, the same peas.
- **Cells:** \(6s^2\) by counting the exposed faces of blocks of unit cubes; \(6/s\); cutting a cube; random walks (4,000 walkers) spreading as \(2Dt\) to 6 %; four times the time for twice the distance.
- **Hares and lynxes:** the equilibrium stays put; from four starts, Runge–Kutta keeps the invariant to 10⁻⁶ over 60 years while Euler loses it a hundredfold more; the averages over whole cycles at the equilibrium to 1 %; the lynxes peaking a tenth to a half cycle after the hares; small cycles at \(2\pi/\sqrt{\alpha\gamma}\).

Browser tests (`tests/e2e/biology.spec.ts`): the group's five cards; each
lab through its five steps at 360 px without sideways scrolling, with the
figures computed by the models (the bonds and shapes, the seeded peas and
their chi-square, the ratios and times, the cycles).

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
| `src/discover/activities.ts` | The ids of every Discover activity, and which are physics, astronomy or biology labs |
| `src/discover/physics-ui.ts` | What the physics labs share: head, sliders that redraw while dragged, SVG drawing, tables, formulas, verdicts, restart |
| `src/discover/throw.ts`, `pendulum.ts`, `lenses.ts`, `circuits.ts` | The four physics labs |
| `src/discover/physics-i18n.ts` | Their texts in French, Spanish and English; decimals and percentages in each language's format |
| `server/check-discover.ts` | `npm run check:discover` |
| `server/check-physics.ts` | `npm run check:physics` |
| `shared/discover/moon.ts`, `seasons.ts`, `eclipses.ts`, `orbits.ts` | The astronomy models |
| `src/discover/moon.ts`, `seasons.ts`, `eclipses.ts`, `planets.ts` | The four astronomy labs |
| `src/discover/astro-i18n.ts` | Their texts in French, Spanish and English |
| `shared/discover/molecules.ts`, `genetics.ts`, `cells.ts`, `ecology.ts` | The chemistry and biology models |
| `src/discover/molecules.ts`, `genetics.ts`, `cells.ts`, `ecology.ts` | The four chemistry and biology labs |
| `src/discover/bio-i18n.ts` | Their texts in French, Spanish and English |
| `server/check-astronomy.ts`, `server/check-biology.ts` | `npm run check:astronomy`, `npm run check:biology` |
| `tests/e2e/discover.spec.ts`, `physics.spec.ts`, `astronomy.spec.ts`, `biology.spec.ts` | Browser tests |
