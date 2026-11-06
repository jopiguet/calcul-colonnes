# The home page

The player's home page (`src/home.ts`) lists every activity as a card, in
twelve groups: Mathématiques, Sciences, Informatique, Économie, Cours de
langues, Langues, Exercices des livres, Découvrir, Physique, Astronomie,
Curiosités mathématiques, Chimie et biologie. What a group holds and what each
card shows is in the [user guide](user-guide.md#home-page).

## Arranging

`src/home-layout.ts` arranges the groups once they are built:

- **One line.** A group is drawn on one line (`.activity-group.is-line`: the
  grid flows in columns and scrolls sideways) until its title, a button
  (`.activity-group-toggle`), opens it (`is-open`). The title's text stays the
  group's name; the chevron is drawn in CSS, the card count and *N en attente*
  sit beside it.
- **What waits first.** A card whose status waits (`card()` in `home.ts`,
  red: words due, notions to review) carries `data-due`, the number in its
  status. Outside the arranging mode, those cards come first in their group,
  the largest first (a stable sort: the rest keeps its order), and groups with
  something waiting come first on the page, by their total. Nothing is stored:
  when it is done, the card is back in its place.
- **The ⋯ of a card** opens a menu placed on the page (it would be cut by the
  group's sideways scroll): *✥ Réorganiser l'accueil*, *＋ Ajouter une
  activité*, *✕ Retirer de l'accueil*. A click elsewhere, Escape, or the card
  moving closes it.
- **Arranging mode** (`.is-arranging`, a module flag that survives a new
  drawing of the page, reset when an activity opens or the player changes):
  every group open, in the set order; cards tremble (not with *reduce
  motion*), do not open their activity, and show − (remove) and ◀ ▶; HTML drag
  and drop moves a card within its group; group headers show ▲ ▼ and
  *＋ Ajouter*, which lists the group's hidden activities (from
  `activityCatalog`) and puts one back, then draws the page again.

### What is stored

| | Where | Who may change it |
|---|---|---|
| Order of groups and cards, groups opened | `users.layout` (migration 036), JSON `{ "groups": […], "cards": { "<group>": […] }, "open": […] }`; `PUT /api/users/:id/layout` | The player's account, or the player in its own session; not another account it is shared with |
| Activities removed from the page | `users.hidden`, `PUT /api/users/:id/hidden` (as *Activités affichées* on the Account page) | The player's account only |

Group ids: `maths`, `sciences`, `computing`, `economics`, `courses`,
`languages`, `workbooks`, `discover`, `physics`, `astronomy`, `curiosities`,
`chembio`. A card's id is its activity id (`columns`, `vocab-<book>`,
`vocab-shelf-<lang>`, `lessons-<course>`…). The server keeps a layout to what
it may hold (`layoutOf` in `server/repository.ts`: known shapes, at most 30
groups and 200 cards a group, 20 kB); what it does not list (a new activity, a
new group) comes after what it does, in the app's order. Removing a shelf
card hides its books (`data-hides`); a shelf's own id is never stored.

## Tests

`tests/e2e/home-arrange.spec.ts`: one line and the title that opens it, kept
after a reload; the ⋯ menu, moving cards and groups, removing and putting
back, kept after a reload; a test left blank putting the Capital and
Économie first, and the set order in arranging mode. `check:family` checks the
layout route (cleaned, refused for another account).
