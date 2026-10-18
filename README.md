# Calcul en colonnes

Additions, soustractions et multiplications posées en colonnes (la saisie
commence par les unités, puis passe aux dizaines, aux centaines, etc.) et
divisions euclidiennes avec quotient et reste, et QCM de mathématiques
(dérivées, intégrales, trigonométrie, limites, exponentielles et logarithmes)
au niveau lycée ou université. Interface en français et en espagnol.

```sh
npm install
cp .env.example .env
npm run dev      # API (port 8787) + Vite avec rechargement, sur http://localhost:5173
```

En production, un seul processus sert l'application et l'API :

```sh
npm run build    # vérification des types + build dans dist/
npm start        # http://localhost:8787
```

- `src/exercise.ts` — génération des exercices (portage du module Python) et lecture de la réponse
- `src/boards.ts` — affichage d'un exercice et saisie : opération en colonnes, division
- `src/main.ts` — écrans, réglages, validation
- `src/i18n.ts` — textes français et espagnols ; `src/settings.ts` — réglages du navigateur
- `src/worksheet.ts` — fiche PDF A4 de 20 calculs (PDF écrit à la main, sans dépendance)
- `src/quiz.ts` — QCM : réglages, questions, résultats ; `src/quiz-i18n.ts` — leurs textes
- `src/progress.ts` — page « Progrès » d'un joueur
- `src/store.ts` — appels à l'API pour les joueurs et les scores
- `shared/quiz/` — génération des questions de QCM (partagée par le navigateur et le serveur)
- `src/style.css` — styles
- `shared/types.ts` — types communs au navigateur et au serveur
- `server/app.ts` — API JSON (Hono) ; `server/repository.ts` — les requêtes SQL
- `server/db/` — accès SQLite / PostgreSQL et migrations ; `server/migrations/` — schéma

Clavier : chiffres pour remplir, `Retour arrière` pour revenir d'une colonne,
flèches gauche/droite pour se déplacer, `Entrée` pour valider puis passer à la suite.

Retenues : `↑` (ou un appui) ouvre la petite case au-dessus de la colonne ; une
fois le chiffre écrit, le curseur redescend sur la réponse. Elles servent de
brouillon et ne sont pas corrigées.

## Réglages

Mémorisés dans le navigateur (`localStorage`) :

- **Langue** — liste déroulante en haut à droite : français ou espagnol. Pour
  en ajouter une, ajouter un dictionnaire dans `src/i18n.ts`.
- **Opérations** — cases à cocher `+ − × ÷` ; au moins une reste cochée, et
  chaque exercice est tiré parmi celles qui le sont.
- **Maximum du grand nombre** (nombre du haut, ou dividende) — de 10 en 10
  jusqu'à 100 (à partir de 20), puis de 100 en 100 jusqu'à 1000.
- **Maximum du petit nombre** (multiplicateur et diviseur) — de 2 à 12 ;
  affiché quand `×` ou `÷` est coché.

Construction des exercices :

- `+`, `−` : nombre du haut entre 10 et le maximum, nombre du bas entre 1 et lui.
- `×` : multiplicateur entre 2 et sa limite, nombre du haut entre 10 et le maximum.
  Avec un multiplicateur à plusieurs chiffres, une ligne de produit partiel par
  chiffre (décalée d'un rang à chaque fois), puis le total ; seul le total est corrigé.
- `÷` : construite à partir de sa solution — diviseur entre 2 et sa limite,
  quotient entier, reste inférieur au diviseur ; le dividende
  (diviseur × quotient + reste) ne dépasse pas le maximum. Le quotient puis le
  reste s'écrivent de gauche à droite ; il faut écrire le reste, même nul.
  Disposition sur papier : sous le dividende, une ligne de calcul par étape
  (brouillon non corrigé), puis le reste ; le quotient sous le diviseur.

## QCM

Onglet « 📐 QCM ». Réglages (mémorisés) : niveau (lycée / université), thèmes
(au moins un), nombre de questions (5, 10, 15 ou 20). Un test présente une
question à la fois avec quatre réponses ; touches `1` à `4` (ou `A` à `D`) pour
répondre, `←` `→` pour naviguer. À la fin : note, puis correction de chaque
question avec une explication. « Refaire le même test » rejoue les mêmes
questions.

Les questions sont **générées**, pas tirées d'une banque : chaque générateur
(`shared/quiz/<thème>.ts`) tire des paramètres, calcule la bonne réponse et
propose des erreurs classiques comme mauvaises réponses (exposant non abaissé,
dérivée de l'intérieur oubliée, signe, constante d'intégration, etc.). Les
mauvaises réponses équivalentes à la bonne sont écartées automatiquement
(comparaison numérique ; à une constante près pour les primitives).

Un test est entièrement déterminé par `(graine, niveau, thèmes, nombre)` :
le navigateur l'affiche, le serveur le régénère pour le corriger, et seuls ces
paramètres et les réponses choisies sont enregistrés.

Vérification : `npm run check:quiz` (ou `npm run check:quiz -- 1500`) génère des
milliers de tests et vérifie chaque question indépendamment du générateur —
dérivée, intégrale et limite numériques, racines par balayage — : la réponse
marquée est juste, aucune mauvaise réponse ne l'est aussi, et toutes les
formules passent dans KaTeX. Modifier un générateur change les questions
associées aux graines déjà enregistrées ; les notes enregistrées, elles, restent.

### Suivi des erreurs

Chaque réponse est classée sous son **type de question** (`derivatives.product`,
`trigonometry.trigEquation`… : un par générateur, 39 en tout) dans la table
`quiz_answers`. Pour chaque type, d'après les dernières réponses du joueur :

- **à revoir** : une des deux dernières réponses est fausse ;
- **acquis** : les trois dernières sont justes ;
- **en cours** : sinon.

Avec « 🔁 Revoir mes erreurs » (coché par défaut), un nouveau test reprend les
types à revoir compatibles avec le niveau et les thèmes choisis, les erreurs
les plus récentes d'abord : environ 40 % des questions, au plus deux par type ;
ces questions portent le badge « 🔁 À revoir ». Un type revient donc jusqu'à
être réussi deux fois de suite (règle dans `shared/quiz/progress.ts`).

Page « 📈 Progrès » : depuis les réglages ou les résultats d'un QCM, ou en
cliquant sur un nom dans les scores. Pour chaque type rencontré : statut, cinq
dernières réponses, total ; plus le calcul en colonnes par opération.

Les types revus font partie de la définition d'un test (`focus`), comme la
graine. Les tests enregistrés avant cette version ont été recalculés depuis
leur graine au démarrage pour remplir `quiz_answers`.

**Version du générateur.** Un test étant stocké sous forme de graine, toute
modification qui change les questions d'une graine incrémente `QUIZ_VERSION`
(`shared/quiz/index.ts`) et doit laisser les versions précédentes intactes ; la
version est enregistrée avec chaque test. Version 2 : la version 1 confondait
±∞ avec n'importe quel nombre en éliminant les doublons de réponses, si bien
que les limites infinies (croissances comparées, fractions rationnelles de
degré supérieur) n'apparaissaient jamais. Les tests de version 1 sont recalculés
tels quels.

## Joueurs et scores

Les joueurs et leurs scores sont enregistrés par le serveur, dans une base
SQLite (`./data/calcul-colonnes.sqlite`, créée au premier démarrage). Quatre
tables :

- `users` — `id`, `name`, `name_key` (nom en minuscules, unique), `created_at`
- `quiz_results` — une ligne par QCM terminé : `user_id`, `at`, `level`,
  `topics`, `seed`, `question_count`, `correct`, `answers` (JSON, -1 = sans réponse),
  `focus` (types revus), `version` (version du générateur)
- `quiz_answers` — une ligne par question de QCM : `quiz_id`, `user_id`, `at`,
  `position`, `skill`, `topic`, `given`, `correct`, `review`
- `attempts` — une ligne par opération validée : `user_id`, `at`, `maximum`,
  `operator` (`+`, `-`, `*`, `/`), `top`, `bottom`, `given`, `correct`,
  `given_remainder` (divisions : `top` = dividende, `bottom` = diviseur,
  `given` = quotient écrit, `given_remainder` = reste écrit)

C'est le serveur qui décide si une réponse est juste. L'écran « Scores »
calcule, par joueur, le résultat du jour, le total et le taux de réussite.
Supprimer un joueur supprime aussi ses lignes (`ON DELETE CASCADE`).

API : `GET /api/users`, `POST /api/users`, `DELETE /api/users/:id`,
`POST /api/attempts`, `POST /api/quizzes`, `GET /api/stats?since=<ms>`,
`GET /api/users/:id/profile?since=<ms>`,
`GET /api/health`.

## Passer à Neon (PostgreSQL)

Le moteur est choisi par `DATABASE_URL` : vide → SQLite, renseignée → PostgreSQL.
Les requêtes sont écrites une seule fois, dans le SQL commun aux deux moteurs ;
seules les migrations ont un fichier par moteur (`NNN_nom.sqlite.sql`,
`NNN_nom.postgres.sql`), parce que le DDL diffère.

1. Créer une base vide sur Neon et copier sa chaîne de connexion dans `.env` :
   `DATABASE_URL=postgresql://…neon.tech/…?sslmode=require`
2. Pour reprendre les données SQLite existantes (identifiants conservés) :
   `npm run db:copy-to-postgres` — refuse de tourner si la base cible contient
   déjà des joueurs.
3. `npm start` : le schéma est créé au démarrage s'il manque, et le journal
   affiche la base utilisée (`database: PostgreSQL (…)`).

Pour revenir à SQLite, vider `DATABASE_URL`. Les dates sont stockées en
millisecondes depuis l'époque (`BIGINT`) et `correct` en 0/1, pour que les deux
moteurs aient exactement les mêmes colonnes.

Nouvelle migration : ajouter `server/migrations/005_nom.sql` (commun) ou
`005_nom.sqlite.sql` + `005_nom.postgres.sql` ; elle est appliquée au démarrage.

Le bouton « Fiche PDF de 20 calculs » tire 20 nouvelles opérations parmi celles
qui sont cochées, avec les limites courantes, et ouvre la fiche A4 dans un
nouvel onglet, dans la langue choisie.
