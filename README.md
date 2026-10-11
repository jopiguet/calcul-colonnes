# Calcul en colonnes

Additions et soustractions posées en colonnes. La saisie commence par les
unités, puis passe aux dizaines, aux centaines, etc.

```sh
npm install
npm run dev      # serveur de développement
npm run build    # vérification des types + build dans dist/
```

- `src/exercise.ts` — génération des exercices (portage du module Python) et lecture de la réponse
- `src/main.ts` — interface et gestion du clavier
- `src/style.css` — styles

Clavier : chiffres pour remplir, `Retour arrière` pour revenir d'une colonne,
flèches gauche/droite pour se déplacer, `Entrée` pour valider puis passer à la suite.

Retenues : `↑` (ou un appui) ouvre la petite case au-dessus de la colonne ; une
fois le chiffre écrit, le curseur redescend sur la réponse. Elles servent de
brouillon et ne sont pas corrigées.

Le champ « Nombre du haut jusqu'à » fixe le maximum du nombre du haut (de 10 à
999 999) ; le nombre de colonnes s'adapte et le réglage est mémorisé.
