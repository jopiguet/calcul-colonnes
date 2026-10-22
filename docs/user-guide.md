# User guide

This guide is for the adults setting the app up for children or students. It
describes every screen, every setting and the keyboard shortcuts.

- [Signing in](#signing-in)
- [Account page](#account-page)
- [Players](#players)
- [Home page](#home-page)
- [Column arithmetic](#column-arithmetic)
- [Printable worksheet](#printable-worksheet)
- [Multiple-choice tests](#multiple-choice-tests)
- [Physical chemistry](#physical-chemistry)
- [Linux](#linux)
- [Chemical equations](#chemical-equations)
- [Progress and review of mistakes](#progress-and-review-of-mistakes)
- [Vocabulary](#vocabulary)
- [Discover](#discover)
- [Physics](#physics)
- [Astronomy](#astronomy)
- [Chemistry and biology labs](#chemistry-and-biology-labs)
- [Scores](#scores)
- [Language](#language)
- [On a phone or tablet](#on-a-phone-or-tablet)
- [What is stored where](#what-is-stored-where)

## Signing in

A first visit opens on a short presentation of the app, with *Créer un compte*
and *J'ai déjà un compte*. A browser that has been signed in before opens
directly on **Connexion / Iniciar sesión / Sign in**. Both forms have their own
address, to bookmark or send: `/#sign-in` and `/#sign-up`; the presentation
is at `/#about`.

- **Create an account:** *Pas encore de compte ? Créer un compte*. Name, email and a password of at least 10 characters. A short sentence is easier to remember than a complicated word.
- **Sign in:** with the account's email, or with a player's username, and the password.
- **With a provider:** *Continuer avec Google* (or Microsoft, GitHub…) when the server offers it. The first time, it creates an account.
- **Stay signed in:** a browser stays signed in for 30 days after its last use.

**An account and its players.** The account belongs to an adult. It holds the
players: the account sees all of them and their results, and manages them.
A child can also get a sign-in of their own (see below): they then see only
their own exercises and results, and cannot switch to another player.

If the app was used before sign-in existed, the **first account created**
receives all existing players and their results.

**An email already used.** Signing in with a provider whose email already has
an account here is refused. Sign in to that account first, then link the
provider from the Account page. This prevents someone from entering an account
just by using the same email elsewhere.

## Account page

The ⚙️ button at the top opens the Account page (not shown in a player's own
session).

- **Ways to sign in:** the password and linked providers, with the date of last use.
  - **Link Google / GitHub…** adds a provider: then either the password or the provider signs in.
  - **Remove** takes one away. The last one cannot be removed.
- **Change password** (or **Add a password** for an account created through a provider). Changing it signs out every other device.
- **Players**, one block each:
  - **Activités affichées:** untick what the player should not see on their home page, for example the column arithmetic for an older child. It is saved at once, for every device. New books show until unticked.
  - **Partage:** *Créer un code de partage* gives a code such as `K7QF2-9XMRA`, valid a week and once, for another account (the other parent, a teacher). The accounts that see the player are listed, each with *Retirer*.
  - **Own sign-in:**
    - **Username and password:** the child signs in with the username, for example `lea.m`. Saving again replaces them and signs the child out.
    - **Link a provider:** for an older child with their own Google or Microsoft account.
    - **Remove:** their sign-in stops working at once.
  - A player another account shares with this one shows only *Partagé par …* and **Ne plus voir …**: its activities, sharing and sign-in are its owner's.
- **Ajouter un joueur partagé:** type the code received from the player's account.
- **Devices:**
  - **Sign out other devices:** for a lost phone or a shared computer.
  - **Sign out:** this device only.

In a player's own session, the 🚪 button at the top signs out.

## Players

After signing in, the app shows **Qui joue ? / ¿Quién juega? / Who's playing?**.

- **Choose a player:** click their name.
- **Add a player:** type a first name (20 characters at most) and press *Ajouter*. Names must be unique within the account, ignoring case.
- **Remembered:** the browser remembers the last player, so the app reopens on their work.
- **Switch player:** click the 👤 name chip at the top left.

A player can be deleted from the [Scores](#scores) screen, which also deletes
all their results. A shared player, marked *partagé*, is only removed from
this account's list: the player and their results stay with their own
account.

## Home page

After choosing a player, and at each visit, the app opens on the player's
home page: **Que fait-on, Léa ?**

| Group | Activities | Shows |
|---|---|---|
| Mathématiques | 🧮 Calcul en colonnes, 📐 QCM | For the QCM, how many kinds of question are to review |
| Langues | 💬 one per vocabulary book: *Vocabulaire espagnol*, *Vocabulaire anglais*… | Words due today, *À jour*, or the book's number of words if not started |
| Sciences | ⚗️ Chimie physique | Kinds of question to review, counted apart from the QCM |
| Chimie et biologie | ⚗️ Équations chimiques, 🧬 Construire des molécules, 🫛 Les pois de Mendel, 🦠 Pourquoi les cellules sont petites, 🐇 Lièvres et lynx | For the test, kinds of question to review |
| Découvrir | 🎲 Le labo des probabilités, 🪙 Pile ou face, 🧩 Grilles logiques | |
| Physique | 🏀 Lancer une balle, ⏱️ Le pendule, 🔍 Les lentilles, 💡 Les circuits | |
| Astronomie | 🌓 Les phases de la Lune, 🌍 Les saisons, 🌑 Les éclipses, 🪐 Les orbites des planètes | |

Click an activity to open it. Every activity has *← Accueil* at the top to
come back.

**On a large screen** the page uses the width: subjects with one or two
activities sit side by side, and a group's cards fill its row. On a phone the
groups follow one another.

**📈 Mes progrès**, next to the greeting, opens the overview of the player's
progress (see [Progress](#progress-and-review-of-mistakes)).

## Column arithmetic

Tab **🧮 Calcul en colonnes**.

### Settings

| Setting | Values | Effect |
|---|---|---|
| Operations `+ − × ÷` | at least one ticked | Each exercise is drawn among the ticked operations. |
| *Jusqu'à* (up to) | 20 to 100 by 10, then 200 to 1000 by 100 | Largest value of the top number, or of the dividend. |
| *× ÷ par un nombre jusqu'à* | 2 to 12 | Largest multiplier and divisor. Shown when `×` or `÷` is ticked. |

Settings are remembered by the browser. The score shown at the top right
counts the current sitting; the saved totals are on the [Scores](#scores)
screen.

### How exercises are built

- **Addition and subtraction:** the top number is between 10 and the maximum, the bottom number between 1 and the top number. Subtractions never go negative.
- **Multiplication:** the multiplier is drawn first, between 2 and its limit, then the top number between 10 and the maximum.
- **Division:** built from its solution. A divisor between 2 and its limit, a whole quotient and a remainder smaller than the divisor are drawn first; the dividend is then divisor × quotient + remainder, never above the maximum.

### Writing the answer

<img src="images/columns-addition.png" width="260" alt="Addition with a carry written above the tens">

The cursor starts on the **units**. Each digit typed moves the cursor one
column left, to the tens, then the hundreds, as on paper.

| Key | Effect |
|---|---|
| digit | Writes the digit and moves to the next column |
| `Backspace` | On an empty box, goes back one column and erases it |
| `←` `→` | Moves between columns |
| `↑` | Opens the **carry** box above the current column; writing the carry returns the cursor to the answer |
| `↓` | From a carry box, back to the answer |
| `Enter` | Checks the answer; pressed again, goes to the next exercise |

Anything other than a digit is ignored. **Carries are scratch work and are
never marked.** An empty answer, or a gap between two digits, gets a message
and does not count as an attempt.

### Multiplication by a two-digit number

<img src="images/columns-multiplication.png" width="260" alt="Multiplication by 12 with two partial-product lines">

With a multiplier of 10 or more, three result lines appear:

1. The first partial product (top number × units digit).
2. The second partial product (top number × tens digit), shifted one column left.
3. The total, under a thin rule.

The cursor starts on the units of the first line. `Enter` on a partial line
moves to the next line, and from the second line to the total; `↑` and `↓`
move between lines in the same column. **Only the total is marked**: the
partial lines are the child's working.

### Euclidean division

<img src="images/columns-division.png" width="260" alt="Division of 66 by 4 with quotient 16 and remainder 2">

The layout is the French and Spanish one: the dividend on the left, the
divisor on the right above a horizontal line, and the quotient below that
line. A vertical bar separates the two sides.

- **Quotient:** written left to right. The cursor starts there.
- **Working lines:** dashed boxes under the dividend, one line per step of the division (one per digit of the quotient), for partial dividends and remainders. They are not marked.
- **Remainder:** on the last line, marked *Reste / Resto*. It must be written even when it is 0. `Enter` with the remainder still empty asks for it and moves the cursor there.

The answer is right only if both quotient and remainder are right.

## Printable worksheet

<img src="images/worksheet.png" width="300" alt="A4 worksheet of 20 operations">

**🖨️ Fiche PDF de 20 calculs** opens a one-page A4 PDF in a new tab:

- 20 new operations, drawn among the ticked operations within the current ranges.
- A first-name and date line at the top.
- Room above each operation for carries.

The sheet is in the chosen language. If the browser blocks the new tab, the
PDF downloads instead. Worksheets are not recorded and there is no answer key.

## Multiple-choice tests

Tab **📐 QCM** (**Test** in Spanish).

### Settings

<img src="images/quiz-setup.png" width="260" alt="Test settings">

| Setting | Values |
|---|---|
| Level | *Lycée / Bachillerato*, or *Université / Universidad* |
| Topics | By group. **Analyse:** reading graphs, function study, sequences, derivatives, integrals, limits, exponentials and logarithms, trigonometry, differential equations, and at university series and functions of two variables. **Algèbre:** complex numbers, matrices and systems. **Géométrie:** vectors, planes and distances in space. **Probabilités:** the binomial law, trees and Bayes' formula, counting, expectation, and at university the Poisson, exponential and normal laws. Only the topics of the chosen level are shown; at least one |
| Number of questions | 5, 10, 15 or 20 |
| Réponses | *4 choix*, or *Au clavier*: questions whose answer is a number are answered by typing it (see [typed answers](#typed-answers)) |
| 🔁 Revoir mes erreurs | On by default; see [review of mistakes](#progress-and-review-of-mistakes) |

The topics in a test are taken in turn, so a test covers all the chosen ones
evenly. The [question generators](question-generators.md#the-110-kinds-of-question)
page lists what each topic and level contains.

### Taking a test

<img src="images/quiz-question.png" width="260" alt="A limit question with four options">

One question at a time with four options. A progress bar fills as questions
are answered.

| Key | Effect |
|---|---|
| `1`–`4` or `A`–`D` | Chooses an option |
| `→` / `←` | Next / previous question |
| `Enter` | Next question; on the last one, finishes the test |

Answers can be changed until the test is finished. Finishing with blank
answers asks for confirmation; a blank counts as wrong. *Abandonner* drops the
test without saving it. Changing the language during a test keeps the test.

**Graph questions** (*Lecture graphique*) show a curve and ask for another:
which curve is f′, which is g(x) = f(x − 2), which plane has this equation.
The four options are drawn two by two and named by their letter only; their
formulas appear in the corrections.

#### Typed answers

With *Réponses: Au clavier*, a question whose answer is a number shows a field
instead of four options; the others keep their options. Under the field, the
app shows what it reads (≈ 2,0944) as you type, and a row of keys adds the
symbols phones hide: π, √, /, ^, −, e and brackets. `Enter` goes on.

| Typed | Read as |
|---|---|
| `7/45`, `2π/3`, `2pi/3`, `√2`, `sqrt(2)/2`, `e^2 − 1`, `ln 3`, `3√2` | an exact value |
| `1,05` or `1.05` | a rounding, right to its last digit: π/3 = 1.0472 is accepted, `1` or `1,0` is not |

A rounding is never allowed more than 0.6 % of the answer. A value typed
that matches a wrong option counts as that option, and its mistake is named
in the corrections, as when it is picked. The server reads the text again
and decides.

### Results

The mark comes first, then each question with the answer chosen, the right
answer and a short explanation with its formula. For a wrong answer, the
**mistake** it stands for is named, for example *Dérivée de l'intérieur
oubliée* (inner derivative forgotten) or *Solution oubliée* (solution missed).
The buttons:

- **Nouveau test:** a new test with the same settings.
- **Refaire le même test:** exactly the same questions again.
- **Changer les réglages:** back to the settings.
- **📈 Mes progrès:** the [progress page](#progress-and-review-of-mistakes).

The result is saved by the server, which recomputes the mark itself. If the
server cannot be reached, the page says *Résultat non enregistré*.

## Physical chemistry

Activity **⚗️ Chimie physique** (*Química física*, *Physical chemistry*), in
the *Sciences* group: multiple-choice tests on *Atkins' Physical Chemistry*,
12th edition. Settings, keys, typed answers and results work as for the
[QCM](#multiple-choice-tests), with two levels:

| Niveau | Questions |
|---|---|
| *Fondamental* | Calculations and concept questions of the course |
| *Avancé* | Reasoning and derivations, a step beyond the course: a free expansion of a van der Waals gas, why $pV^{\gamma}$ needs a reversible change, what a negative expansion coefficient does to entropy. No calculations. |

| Topic | Atkins | Content |
|---|---|---|
| 1 · Les gaz | Focus 1 | Perfect gas, kinetic model, real gases |
| 2 · Premier principe | Focus 2 | Work, heat, internal energy, enthalpy, thermochemistry, adiabatic changes |
| 3 · Deuxième et troisième principes | Focus 3 | Entropy, its measurement, Helmholtz and Gibbs energies, the fundamental equations |
| 4 · Transformations physiques | Focus 4 | Phase diagrams, the phase rule, the Clapeyron and Clausius–Clapeyron equations |
| 5 · Les mélanges | Focus 5 | Partial molar quantities, ideal and dilute solutions, colligative properties, binary and ternary phase diagrams, activities, ionic strength |
| 6 · L'équilibre chimique | Focus 6 | K and ΔrG°, Le Chatelier and van 't Hoff, cells, the Nernst equation, electrode potentials |
| 7 · Théorie quantique | Focus 7 | Photons and black bodies, the photoelectric effect, de Broglie, uncertainty, the particle in a box, vibration and rotation, tunnelling |
| 8 · Structure atomique et spectres | Focus 8 | Hydrogenic atoms and their spectra, orbitals and nodes, many-electron atoms, term symbols and spin–orbit coupling |

A test mixes two kinds of question:

- **Calculations,** generated with new data each time: the pressure of a gas, the work of an expansion, an entropy of heating, ΔG at a temperature, a vapour pressure, a freezing-point depression, an equilibrium constant, a cell potential. Data are given to three significant figures and the options carry their unit; the wrong options are the usual slips, such as °C used for K, kJ mixed with J, or C_p taken for C_V. With *Au clavier*, the number is typed in the unit shown, unless the options are too close to tell apart by typing. Equilibrium constants, which span powers of ten, are always chosen from the four options.
- **Concept questions,** written from the book. Each shows its section (*Atkins 2B.1*) and, in the corrections, why the answer is right. They are in the app's language: French, Spanish or English.

In the progress page, each Topic of the book is one kind of question per
level (*Notions 2B – L'enthalpie*, *Avancé 2B – L'enthalpie*), next to the
calculations.

**⚑ Signaler cette question.** Under each question of the corrections: a
question that looks wrong or unclear can be reported, with a note. Reports
are read with `npm run quiz:flags` (see [Question bank](question-bank.md#flags)).

The concept questions are imported on the server from a file kept by its
administrator. Without it, the page says so and tests hold calculations
only.

## Linux

Activity **🐧 Linux**, in the *Informatique* group (*Informática*,
*Computing*): multiple-choice tests on the command line. Settings, keys,
typed answers and results work as for the [QCM](#multiple-choice-tests);
there is one level.

| Topic | Content |
|---|---|
| Fichiers et permissions | `cd`, `ls`, links, `find`, `chmod` and `umask`, `tar` and `zip` |
| Traitement de texte | `grep`, `sed`, `awk`, `cut`, `sort`, `uniq`, pipelines |
| Le shell | Redirections, expansions, conditions and loops, variables |
| Processus et services | `ps`, signals, jobs, `systemctl`, `cron` and `at` |
| Système, disques, paquets | `df`, `du`, `mount`, users and groups, `apt` and `dnf` |
| Réseau et SSH | `ip`, `ss`, `curl`, `rsync`, `ssh`, `dig` |
| Outils à installer | `rg`, `fd`, `fzf`, `bat`, `jq`, `htop`, `tmux`, `hyperfine`, `shellcheck`, `mtr`, `nmap`… |

Commands are shown as code. A question about a command that a default
install does not have shows a *📦* badge with the package name, and its
correction says how to install it on Debian and Ubuntu, Fedora and macOS.

Some questions are generated each time: `chmod` modes in both directions,
the modes left by a `umask`, and when a crontab line runs. An octal mode can
be typed with *Au clavier*.

## Chemical equations

Activity **⚗️ Équations chimiques**, in the *Chimie et biologie* group
(*Química y biología*, *Chemistry and biology*): tests on balancing
equations. Settings, keys, typed answers and results work as for the
[QCM](#multiple-choice-tests); there is one level and one topic.

Each question shows an unbalanced equation, such as
C₃H₈ + O₂ → CO₂ + H₂O, and four equations to choose from: the one
balanced with the smallest whole numbers, and the usual slips:

- a subscript changed instead of a coefficient (H₄O₂ for 2 H₂O): the atoms balance, but it is another substance;
- coefficients that balance but are not the smallest (all doubled);
- one coefficient off, so an element is not balanced;
- O₂ written O.

Some questions ask for a single coefficient, shown as “?”; it can be typed
with *Au clavier*. The correction counts the atoms of each element on each
side.

## Progress and review of mistakes

<img src="images/progress.png" width="260" alt="Progress page">

Every test answer is filed under its **kind of question**, for example
*Dérivée d'un produit* or *Équations cos x = a*. For each kind, the player's
latest answers give a status:

| Status | Rule |
|---|---|
| **À revoir / Por repasar** (to review) | One of the last two answers is wrong |
| **Acquis / Dominado** (mastered) | The last three answers are right |
| **En cours / En curso** (in progress) | Otherwise |

**Review of mistakes.** With *🔁 Revoir mes erreurs* ticked, a new test
brings back the kinds to review:

- **Which kinds:** those that fit the chosen level and topics, most recent mistakes first.
- **How many:** about 40% of the test, at most two questions of each kind.
- **How they look:** these questions carry a **🔁 À revoir** badge.
- **For how long:** a kind keeps coming back until it is answered right twice in a row.

The settings screen says how many kinds will be reviewed before the test starts.

**Each activity's progress, inside it.** *📈 Mes progrès* in the QCM, in
Chimie physique and in Linux (on the settings screen and with a test's
results) opens that subject's page:

- **Each kind met in tests:** its status, its last five answers (oldest on the left) and its total.
- **Frequent mistakes:** the six mistakes the player makes most often in that subject's tests, with how many times and in which kinds of question. A mistake keeps its count after the kind is mastered: it shows the habits to watch, not what is still to review.

In Calcul en colonnes, *📈 Mes progrès* under the exercise shows today's and
all-time results per operation. A vocabulary book has its own
*📊 Statistiques* (see [Vocabulary](#vocabulary)).

**The overview.** *📈 Mes progrès* on the home page, or a player's name on
the Scores screen, opens every activity at a glance:

- **Aujourd'hui:** today's sums, test answers and vocabulary answers, right out of how many.
- **Par activité:** one card per activity the player sees. Column arithmetic: right out of total. Each test subject: a bar of its kinds of question (mastered, in progress, to review) and their counts. Each vocabulary book: words started, the bar of mastered, known and learning words, the words due today and those skipped.
- **Détails** on a card opens that activity's page, whose button goes back to the overview; for a book, *Statistiques du livre* opens its statistics.

## Vocabulary

One activity per book imported on the server (see
[Vocabulary › Importing a book](vocabulary.md#importing-a-book)), for example:

- **Vocabulaire espagnol** (*3000 words and phrases*): Spanish words and phrases with their English meaning.
- **Vocabulaire japonais** (*Themed vocabulary*): Japanese words by theme with their English meaning. The rōmaji is shown under the Japanese, and under each Japanese option. To write a Japanese word, type it in kanji or kana with a Japanese keyboard, or in rōmaji with a normal one: *gakkō*, *gakko* and *gakkou* are all right for 学校.
- **Vocabulaire allemand** (*3000 words and phrases*): German words and phrases with their English meaning, in the same chapters as the Spanish book. Nouns come with their article, which is part of the answer. *Strasse* is as right as *Straße*, *Kueche* as *Küche*; buttons under the field add *ä ö ü ß*.
- **Vocabulaire arabe** (*3000 words and phrases*): Arabic words and phrases with their English meaning, right to left, the transliteration under each word. To write an Arabic word, type it with an Arabic keyboard, vowel marks optional, or in transliteration with a normal one: الأسبوع and *al usbou’* are both right for الأُسبوع. *Transcription › Après la réponse* hides the transliteration until the answer.
- **Vocabulaire anglais** (*Vocabulary 4000*): demanding English words with a short English definition, plus prefixes, roots and suffixes. Here the definition is always chosen from four; the word itself can be written. After each answer about a word part, an example is shown (*corp* → *corporeal*).

- **Kanji et kana** (*Kana and jōyō kanji*): hiragana, katakana, then the kanji grade by grade as in Japanese schools. A kana is asked by its sound; a kanji by its meaning, by its reading (one is enough, in kana or rōmaji) and from its meaning. The character is shown large; when it must be found, four characters are offered. After a kanji: its readings (on and kun), example words made only of kanji already learnt, and the player's own words that use it. Characters met in the Japanese words come first among the new ones. See [Kanji and kana](characters.md).

Each book's page works the same way.

**The screen**

- **Mots à réviser:** the words of this book whose review is due, across every lesson. *Réviser maintenant* starts a session with them. This is the first thing to do each day.
- **Réviser tout le vocabulaire:** every word already learnt, due or not, the weakest first. Useful before a test.
- **Cartes par séance:** 15, 30 or 50.
- **Nouveaux mots:** *Au hasard* or *Dans l'ordre du livre*. For the English word list, random is the default, so a child doesn't learn every word in *a* first.
- **Apprendre au hasard dans tout le livre:** a learning session whose new words come from anywhere in the book.
- **Questions:** *Mélangé* (multiple choice for new words, written answers once they are known), *Choix multiples* or *Écrit*. Mixed suits most children.
- **Rōmaji** (Japanese only): *Toujours* shows the rōmaji under the Japanese during the question; *Après la réponse* shows the Japanese alone, and the rōmaji once answered. The second is the step towards reading kana. Remembered per book.
- **Lessons:** click one to see its sections. Each section shows its number of words, how many are due, and a bar that fills as its words are learnt, then known, then mastered. 
  - *Apprendre* starts a section, *Continuer* goes on with it: words due, then up to 8 new ones.
  - *Réviser* goes back over the section's words already learnt, without new ones.
  - *Apprendre la leçon* and *Réviser la leçon* do the same for every section of the chapter.
  - *📖 Voir les mots* lists the lesson's words, section by section: the word, its reading, its meaning in the app's language, and how far it is learnt.

**Skipping a word.** In a lesson's word list, *Passer* skips a word the
player already knows, or does not want: it no longer comes up in lessons or
reviews, from any of the book's buttons. It is crossed out in the list and
counted apart under its section (*2 passés*); *Remettre* puts it back, with
the progress it had.

**📊 Statistiques**, under the book's title, opens the player's statistics
for this book:

- **Four figures:** words seen (out of the book's), words mastered (and known), the share of right answers over 30 days, and the days in a row with at least one answer (with the record).
- **The last 30 days:** right and wrong answers per day. Hover a bar (or tap it) for the day's figures and the number of new words.
- **Where the words stand:** mastered, known, learning, new.
- **To review, next 14 days:** how many cards come due each day; today includes the overdue ones. A tall first bar means reviews are piling up.
- **Cards per box:** for each direction, how many cards are in boxes 1 to 6.
- **By kind of question:** the share right in multiple choice and in writing, recognising a word and recalling it; written answers by verdict (exact, accents, nearly, article, wrong).
- **By lesson:** words seen out of the lesson's, with the progress bar.
- **The hardest words:** the 12 words with the most mistakes, with their rōmaji in Japanese.

Days end at midnight where the browser is.

**Reviewing ahead of time** is practice: a word answered right before its date
stays in its box, so an evening of revision does not push words weeks away. A
word answered wrong goes back to the start.

**A session:**

- **Two kinds of card:**
  - The word shown (*la llave*, *abase*): find its meaning (*key*, *degrade*).
  - The meaning shown: give the word. This comes once the word is recognised.
- **Multiple choice:** click an option, or press 1–4 or A–D.
- **Written:** type the answer and press Enter. For Spanish answers, buttons under the field add *á é í ó ú ü ñ ¿ ¡*.
  - A missing accent or a single slip in a long word is counted right, and the correct spelling is shown.
  - A missing or wrong article (*lápiz* for *el lápiz*) is counted wrong: the gender belongs to the word.
- **After each answer:** Enter goes on. The six dots show the word's box. A wrong answer comes back at the end of the session.
- **The summary** lists the words to review, with their answers.

**How words come back.** Each right answer puts a word in the next box and
spaces its next review: 10 minutes, then 1, 3, 7, 16 and 35 days. A wrong
answer sends it back to the first box. A few minutes a day is enough; a long
session once a week is less effective. The method is described in
[Vocabulary › The learning method](vocabulary.md#the-learning-method).

## Discover

**🎲 Le labo des probabilités.** Two dice; what is the sum?

1. **Prévoir:** choose the sum you think will come up most often (or *Toutes autant*), and set how many 7s you expect in 100 rolls. Then *Lancer les dés*.
2. **Lancer:** roll once, 10, 100 or 1,000 times, as often as you like. Under the dice:
   - how many times each sum came up;
   - the series of 10 (each *× 10* adds one): how many 7s in each, and how much they differ;
   - the share of 7s after each roll.
3. **Comparer**, from 100 rolls: the 36 ways two dice can land, the six that make 7, the theory (1 in 6, about 16.7 %), the table of every sum, and what you predicted next to what happened. You can keep rolling: the curve gets closer to the 1-in-6 line.
4. **Comprendre:** three sentences on chance, large numbers and dice without memory.
5. **Vérifier:** one question. After three 7s in a row, is a 7 less likely?

**Experiment numbers.** The number at the top (*Expérience n° 4821*) is the
experiment: *Refaire l'expérience n°* with the same number gives exactly the
same rolls. Two children can each predict, roll the same dice, and compare.

**🪙 Pile ou face.** A coin, and its streaks.

1. **Prévoir:** in 100 flips, how many times in a row the same side, at most? And which of two sequences of 6 flips is likelier: six times *face*, a mixed one, or both the same?
2. **Lancer:** flip once, 10, 100 or 1,000 times. Under the coin:
   - the last 100 flips, with streaks of 5 or more circled;
   - after a streak of 3 or more, whether the next flip continued it or broke it;
   - how many streaks of each length;
   - the share of *face*.
3. **Comparer**, from 100 flips:
   - your longest streak against the exact chances (in 100 flips, most often 6);
   - the 64 sequences of 6 flips, each 1 in 64;
   - what followed your streaks, against one in two.
4. **Comprendre**, then **Vérifier:** a made-up list of flips, or a real one: which has a streak of 4?

**🧩 Grilles logiques.** Place the numbers 1 to 4 (5, 6) so that each row and
each column has each one once.

- **Niveau:**
  - 1 is a 4 × 4 grid with some numbers given;
  - 2 to 4 have cages: the numbers in a cage, with its operation, make the number in its corner (*7+*, *2÷*).
- **Writing:** tap a square, then a number. On a computer: arrows, digits, Backspace, and N for **Notes** (small numbers, what the square could be).
- **Red at once:** a number twice in a row or column, or a full cage that is wrong.
- **Vérifier:** shows which numbers are not the solution's.
- **Indice:** circles a square and says what to look at. Press again (*Explique*) for the reasoning and the number. If a number written is wrong, the hint says so first.
- **Every grid can be solved without guessing.** At the end: the time and the hints used.
- **Grille n°:** the same number at the same level gives the same grid.

Each lab keeps its experiment, and each level its grid, while you go elsewhere and back. Nothing is
saved yet: a new visit starts a new experiment. Details in
[Discover](discover.md).

## Physics

Four labs in the *Physique* group (*Física*, *Physics*), in the same five
steps as Discover: predict, try, compare, understand, check. There are no
experiment numbers: the same settings always give the same result.

**🏀 Lancer une balle.** A ball thrown at 15 m/s.

1. **Prévoir:** the angle that throws farthest (15° to 75°), and a flag where a throw at 30° will land.
2. **Lancer:** set the angle, the speed and the launch height, then *Lancer*. The ball flies on the field, its path stays, and the distance is written where it lands, next to your flag for the predicted throw. Every throw goes in a table: distance, time in the air, highest point.
3. **Comparer**, from 3 throws: the distance for every angle at that speed and height, the formulas, each throw's distance against the formula's, and your predictions.
4. **Comprendre**, then **Vérifier:** one marble dropped from a table, one pushed off at the same moment: which lands first? A multi-flash picture shows both, always at the same height.

**⏱️ Le pendule.** A ball on a string.

1. **Prévoir:** does a heavy ball swing faster than a light one? How much longer is a swing on a string 4 times longer?
2. **Essayer:** set the length, the mass and the release angle; the pendulum swings. *Chronométrer 10 oscillations* adds a line to the table and a point to the chart of time against length.
3. **Comparer**, from 3 measurements: \(T = 2\pi\sqrt{L/g}\), each measurement against it and against the exact period (a little longer at large angles), and your predictions, with your own measurements that differ by the mass alone.
4. **Comprendre**, then **Vérifier:** a child and an adult on the same swing.

**🔍 Les lentilles.** A lit arrow, a lens and a screen.

1. **Prévoir:** a card over the top half of the lens, what does the image lose? The arrow comes closer: where must the screen go?
2. **Essayer:** move the arrow and the screen; the light from the arrow's tip is drawn through the lens, and *Sur l'écran* shows the image, sharp or blurred, with how much light gets through. Choose the focal length (10, 15 or 20 cm), and put the card on. *Noter cette position* once the image is sharp.
3. **Comparer**, from 3 sharp positions with the arrow at different distances: the thin lens equation against your positions, the three rays that find an image, and your predictions.
4. **Comprendre**, then **Vérifier:** can the image in a magnifying glass be caught on a screen?

**💡 Les circuits.** A 6 V battery and identical bulbs.

1. **Prévoir:** two bulbs in series, two in parallel: does each shine more, the same or less than a bulb alone?
2. **Brancher:** six circuits, from one bulb to one plus two in parallel. Bulbs glow by their power; ammeters show the current at several points. Touch a bulb (or press Enter on it) to unscrew it.
3. **Comparer**, once a series and a parallel circuit have been tried: every circuit's bulbs and battery current, the formulas, and your predictions.
4. **Comprendre**, then **Vérifier:** 0.25 A goes into the first bulb in series; how much comes out of the second?

Each lab keeps what you did while you go elsewhere and back; nothing is
saved. Details in [Discover › The physics playground](discover.md#the-physics-playground).

## Astronomy

Four labs in the *Astronomie* group (*Astronomía*, *Astronomy*), in the same
five steps. The drawings are not to scale, and say so.

- **🌓 Les phases de la Lune.** Predict why we see a crescent, and where the full moon is. A slider moves the Moon through the month: seen from above the North Pole, with the Earth's shadow, and seen from the Earth. The shadow only reaches the Moon at full moon: that is an eclipse, not a phase. The check: when a lunar eclipse can happen.
- **🌍 Les saisons.** Predict why summer is warm and when the Earth is closest to the Sun. Choose a date, a latitude and the tilt of the axis: the orbit, the Sun at noon, the day's length, the sunlight of the day, and a year of sunlight. With the axis upright, the seasons go. The check: summer in Spain, winter in Argentina.
- **🌑 Les éclipses.** Predict why there is not an eclipse every month. Follow the Moon a year at a time: its height above the Earth's orbit at each new and full moon, and the eclipses of the year. Without the tilt, one every month. The Moon's distance decides total or annular. The check: why a total eclipse is seen only from a narrow strip.
- **🪐 Les orbites des planètes.** Predict where a planet is fastest and how long a Mars year is. Draw an orbit in twelve slices of equal time; watch Mars seen from the Earth go backwards for a while. The check: why Mars goes backwards.

Details in [Discover › Astronomy](discover.md#astronomy).

## Chemistry and biology labs

Four labs next to the test in *Chimie et biologie*.

- **🧬 Construire des molécules.** Predict the shapes of water and CO₂. Pick a molecule and set each bond single, double or triple until every atom has its number of bonds; then its shape and angle are shown. The check: why water is bent and CO₂ straight.
- **🫛 Les pois de Mendel.** Predict the share of green peas from two Aa parents, and whether three yellow ones make green more likely next. Pick a cross, read its square, breed peas 1 to 1,000 at a time. Like the probability labs it has an experiment number. The comparison gives each cross's chi-square. The check: Aa × aa.
- **🦠 Pourquoi les cellules sont petites.** Predict what happens to surface per volume, and to diffusion time, when a cell grows. Change the size from 1 µm to 1 mm and cut it into smaller cubes. The check: an elephant's cells and a mouse's.
- **🐇 Lièvres et lynx.** Predict which peaks first and what happens in the long run. Choose the starting numbers and run 40 years: the populations over time and as a loop. The check: what hunting lynxes does to the averages.

Details in [Discover › Chemistry and biology](discover.md#chemistry-and-biology).

## Scores

**🏆 Scores** lists every player of the account (in a player's own session,
only that player):

- **Column arithmetic:** results today, in total, and the success rate.
- **QCM:** a second table for players who took tests, with the number of tests, right answers and success rate.

Clicking a name opens that player's progress page. The 🗑️ button deletes a
player and **all** their results, after confirmation; this cannot be undone.
It is not available in a player's own session.

## Language

The dropdown at the top right switches between **Français**, **Español** and
**English** on every screen, including the PDF worksheet and the test
questions. On a first visit the app uses the browser's language if it is one
of these three, French otherwise; the choice is then remembered.

- **Spanish:** formulas use the Spanish notation `sen` and `arcsen`.
- **English:** the column layouts stay the French and Spanish ones taught in Europe. In particular, the division is the bracket layout, not the English long-division layout.

## On a phone or tablet

Luma can be put on the home screen and then opens like an app, full screen,
without the browser's address bar.

- **Android (Chrome):** menu ⋮ › *Install app* (or *Add to Home screen*).
- **iPhone and iPad (Safari):** share button › *Add to Home Screen*.

The icon is named *Luma*. Sign in once in the installed app: on iPhone it
keeps its own sign-in, separate from Safari's. The app still needs the
connection to the server; it does not work offline.

**Updates come by themselves**, in an installed app (phone, or Chrome's
*Install Luma* on a computer) as in a tab left open:

- When the window comes back to the front, and every 15 minutes while it is in front, the app asks the server whether a new version is out.
- If so, on the home page or the list of players, it reloads at once.
- Inside an activity it never interrupts: a bar at the bottom offers *Mettre à jour*, and otherwise the update happens on the next return to the home page.
- Coming back to the home page after a few minutes, it is redrawn from the server: the words due are current, and a newly imported book appears.

## What is stored where

| Where | What |
|---|---|
| The server's database | Accounts and their ways to sign in (passwords only as hashes), sessions, players, every checked arithmetic answer, every finished test and each of its answers, the imported vocabulary, each player's box for every word, every vocabulary answer |
| The browser (cookie) | The session, unreadable by the page's scripts |
| The browser (`localStorage`) | Language, operation and test settings, last player |

Clearing the browser's site data signs out and resets the settings, not the
results. An account's results are the same in every browser where it signs in.
