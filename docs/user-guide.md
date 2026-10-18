# User guide

This guide is for the adults setting the app up for children or students. It
describes every screen, every setting and the keyboard shortcuts.

- [Signing in](#signing-in)
- [Account page](#account-page)
- [Players](#players)
- [Column arithmetic](#column-arithmetic)
- [Printable worksheet](#printable-worksheet)
- [Multiple-choice tests](#multiple-choice-tests)
- [Progress and review of mistakes](#progress-and-review-of-mistakes)
- [Scores](#scores)
- [Language](#language)
- [What is stored where](#what-is-stored-where)

## Signing in

The app opens on **Connexion / Iniciar sesión / Sign in**.

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
- **Players' own sign-in**, for each player:
  - **Username and password:** the child signs in with the username, for example `lea.m`. Saving again replaces them and signs the child out.
  - **Link a provider:** for an older child with their own Google or Microsoft account.
  - **Remove:** their sign-in stops working at once.
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
all their results.

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
| Topics | Derivatives, integrals, trigonometry, limits, exponentials and logarithms; at least one |
| Number of questions | 5, 10, 15 or 20 |
| 🔁 Revoir mes erreurs | On by default; see [review of mistakes](#progress-and-review-of-mistakes) |

The topics in a test are taken in turn, so a test covers all the chosen ones
evenly. The [question generators](question-generators.md#the-39-kinds-of-question)
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

**Progress page.** Open it from the test settings, from a test's results, or
by clicking a player's name on the Scores screen. It shows:

- **Each kind met in tests:** its status, its last five answers (oldest on the left) and its total.
- **Frequent mistakes:** the six mistakes the player makes most often in tests, with how many times and in which kinds of question. A mistake keeps its count after the kind is mastered: it shows the habits to watch, not what is still to review.
- **Column arithmetic:** today's and all-time results per operation.

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

## What is stored where

| Where | What |
|---|---|
| The server's database | Accounts and their ways to sign in (passwords only as hashes), sessions, players, every checked arithmetic answer, every finished test and each of its answers |
| The browser (cookie) | The session, unreadable by the page's scripts |
| The browser (`localStorage`) | Language, operation and test settings, last player |

Clearing the browser's site data signs out and resets the settings, not the
results. An account's results are the same in every browser where it signs in.
