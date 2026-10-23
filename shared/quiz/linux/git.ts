/** Linux, git: commits, branches, undoing, remotes (6.14.0). */
import type { Install, LinuxQuestion } from "./types";

/** Git is not in a minimal Debian or Fedora; on macOS it also comes with `xcode-select --install`. */
const GIT: Install = { apt: "git", dnf: "git", brew: "git" };

const commits: LinuxQuestion[] = [
  {
    id: "lx-git-01",
    q: ["You edited `a.txt` and `b.txt`, then ran `git add a.txt` and `git commit -m fix`. What is in the commit?", "Vous avez modifié `a.txt` et `b.txt`, puis lancé `git add a.txt` et `git commit -m fix`. Que contient le commit ?", "Editó `a.txt` y `b.txt`, y luego ejecutó `git add a.txt` y `git commit -m fix`. ¿Qué contiene el commit?"],
    a: ["Only the changes to `a.txt`; `b.txt` stays modified, uncommitted", "Seulement les changements de `a.txt` ; `b.txt` reste modifié, hors du commit", "Solo los cambios de `a.txt`; `b.txt` sigue modificado, fuera del commit"],
    w: [
      ["Both files: `commit` takes every change", "Les deux fichiers : `commit` prend tous les changements", "Los dos archivos: `commit` toma todos los cambios"],
      ["Nothing until `git commit -a`", "Rien tant qu'on n'a pas fait `git commit -a`", "Nada hasta hacer `git commit -a`"],
      ["Only `b.txt`, the file not yet added", "Seulement `b.txt`, le fichier pas encore ajouté", "Solo `b.txt`, el archivo aún no añadido"],
    ],
    e: [
      "`git add` puts a change in the staging area (the index); `git commit` records what is staged. `git status` shows both lists.",
      "`git add` place un changement dans la zone de préparation (l'index) ; `git commit` enregistre ce qui y est. `git status` montre les deux listes.",
      "`git add` pone un cambio en el área de preparación (el índice); `git commit` registra lo que hay en ella. `git status` muestra las dos listas.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-02",
    q: ["What does `git commit -a` leave out?", "Que laisse de côté `git commit -a` ?", "¿Qué deja fuera `git commit -a`?"],
    a: ["New files that git does not track yet", "Les nouveaux fichiers que git ne suit pas encore", "Los archivos nuevos que git aún no sigue"],
    w: [
      ["Deleted files", "Les fichiers supprimés", "Los archivos borrados"],
      ["Files modified since the last commit", "Les fichiers modifiés depuis le dernier commit", "Los archivos modificados desde el último commit"],
      ["Files in subdirectories", "Les fichiers des sous-répertoires", "Los archivos de los subdirectorios"],
    ],
    e: [
      "`-a` stages the modified and deleted files git already tracks. A new file needs `git add` once; `git add -A` takes everything.",
      "`-a` prépare les fichiers modifiés et supprimés que git suit déjà. Un nouveau fichier demande un `git add` une première fois ; `git add -A` prend tout.",
      "`-a` prepara los archivos modificados y borrados que git ya sigue. Un archivo nuevo necesita un `git add` la primera vez; `git add -A` lo toma todo.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-03",
    q: ["You staged all your changes and `git diff` now shows nothing. Why?", "Vous avez préparé tous vos changements et `git diff` n'affiche plus rien. Pourquoi ?", "Preparó todos sus cambios y `git diff` ya no muestra nada. ¿Por qué?"],
    a: ["`git diff` compares the working tree with the staging area; what is staged shows with `git diff --staged`", "`git diff` compare l'arbre de travail à la zone de préparation ; ce qui est préparé se voit avec `git diff --staged`", "`git diff` compara el árbol de trabajo con el área de preparación; lo preparado se ve con `git diff --staged`"],
    w: [
      ["Staging saves the changes, so there is no difference left", "Préparer enregistre les changements : il ne reste aucune différence", "Preparar guarda los cambios: ya no queda ninguna diferencia"],
      ["`git diff` only works after a commit", "`git diff` ne marche qu'après un commit", "`git diff` solo funciona tras un commit"],
      ["The changes were lost by `git add`", "Les changements ont été perdus par `git add`", "Los cambios se perdieron con `git add`"],
    ],
    e: [
      "Three states: working tree, index, last commit. `git diff HEAD` compares the working tree with the last commit directly.",
      "Trois états : l'arbre de travail, l'index, le dernier commit. `git diff HEAD` compare directement l'arbre de travail au dernier commit.",
      "Tres estados: el árbol de trabajo, el índice, el último commit. `git diff HEAD` compara directamente el árbol de trabajo con el último commit.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-04",
    q: ["You added `secrets.env` to `.gitignore`, but git still reports its changes. Why?", "Vous avez ajouté `secrets.env` à `.gitignore`, mais git signale toujours ses changements. Pourquoi ?", "Añadió `secrets.env` a `.gitignore`, pero git sigue informando de sus cambios. ¿Por qué?"],
    a: ["`.gitignore` only concerns untracked files; stop tracking it with `git rm --cached secrets.env`", "`.gitignore` ne concerne que les fichiers non suivis ; cesser de le suivre avec `git rm --cached secrets.env`", "`.gitignore` solo afecta a los archivos no seguidos; dejar de seguirlo con `git rm --cached secrets.env`"],
    w: [
      ["`.gitignore` takes effect after the next push", "`.gitignore` prend effet après le prochain push", "`.gitignore` surte efecto tras el próximo push"],
      ["The file name must start with a slash", "Le nom doit commencer par une barre oblique", "El nombre debe empezar por una barra"],
      ["`.gitignore` only works for directories", "`.gitignore` ne marche que pour les répertoires", "`.gitignore` solo funciona con directorios"],
    ],
    e: [
      "`--cached` removes it from the index and keeps the file on disk. A secret already committed stays in the history: change it.",
      "`--cached` le retire de l'index et garde le fichier sur le disque. Un secret déjà commité reste dans l'historique : le changer.",
      "`--cached` lo quita del índice y deja el archivo en el disco. Un secreto ya incluido en un commit sigue en el historial: cambiarlo.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-05",
    q: ["What does `git commit --amend` do?", "Que fait `git commit --amend` ?", "¿Qué hace `git commit --amend`?"],
    a: ["Replaces the last commit with a new one: the staged changes added, the message editable", "Remplace le dernier commit par un nouveau : les changements préparés ajoutés, le message modifiable", "Sustituye el último commit por uno nuevo: con los cambios preparados añadidos y el mensaje editable"],
    w: [
      ["Adds a new commit after the last one", "Ajoute un nouveau commit après le dernier", "Añade un commit nuevo tras el último"],
      ["Undoes the last commit and its changes", "Annule le dernier commit et ses changements", "Deshace el último commit y sus cambios"],
      ["Edits any commit of the history", "Modifie n'importe quel commit de l'historique", "Modifica cualquier commit del historial"],
    ],
    e: [
      "The amended commit has a new id. Once the old one is pushed and others have it, amending forces a rewrite: avoid it on shared branches.",
      "Le commit corrigé a un nouvel identifiant. Si l'ancien est déjà poussé et que d'autres l'ont, corriger oblige à réécrire : à éviter sur les branches partagées.",
      "El commit corregido tiene un identificador nuevo. Si el anterior ya se envió y otros lo tienen, corregir obliga a reescribir: evitarlo en ramas compartidas.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-06",
    q: ["What does `git show HEAD~2` show?", "Qu'affiche `git show HEAD~2` ?", "¿Qué muestra `git show HEAD~2`?"],
    a: ["The commit two before the current one, following first parents", "Le commit situé deux crans avant le commit courant, en suivant les premiers parents", "El commit dos pasos antes del actual, siguiendo los primeros padres"],
    w: [
      ["The last two commits", "Les deux derniers commits", "Los dos últimos commits"],
      ["The second commit of the repository", "Le deuxième commit du dépôt", "El segundo commit del repositorio"],
      ["The second parent of a merge", "Le second parent d'une fusion", "El segundo padre de una fusión"],
    ],
    e: [
      "`HEAD~1` is the parent, `HEAD~2` the grandparent. `HEAD^2` is the second parent of a merge commit. `git log -2` shows the last two.",
      "`HEAD~1` est le parent, `HEAD~2` le grand-parent. `HEAD^2` est le second parent d'un commit de fusion. `git log -2` montre les deux derniers.",
      "`HEAD~1` es el padre, `HEAD~2` el abuelo. `HEAD^2` es el segundo padre de un commit de fusión. `git log -2` muestra los dos últimos.",
    ],
    install: GIT,
  },
];

const branches: LinuxQuestion[] = [
  {
    id: "lx-git-07",
    q: ["What does `git switch -c feature` do?", "Que fait `git switch -c feature` ?", "¿Qué hace `git switch -c feature`?"],
    a: ["Creates the branch `feature` at the current commit and moves to it", "Crée la branche `feature` sur le commit courant et s'y place", "Crea la rama `feature` en el commit actual y se cambia a ella"],
    w: [
      ["Moves to `feature`, which must already exist", "Se place sur `feature`, qui doit déjà exister", "Se cambia a `feature`, que ya debe existir"],
      ["Copies the branch `feature` from the server", "Copie la branche `feature` depuis le serveur", "Copia la rama `feature` desde el servidor"],
      ["Merges `feature` into the current branch", "Fusionne `feature` dans la branche courante", "Fusiona `feature` en la rama actual"],
    ],
    e: [
      "The older form is `git checkout -b feature`. Uncommitted changes follow you to the new branch.",
      "La forme plus ancienne est `git checkout -b feature`. Les changements non commités vous suivent sur la nouvelle branche.",
      "La forma antigua es `git checkout -b feature`. Los cambios sin commit le acompañan a la nueva rama.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-08",
    q: ["`main` has not moved since `feature` branched off. What does `git merge feature`, run on `main`, do?", "`main` n'a pas bougé depuis que `feature` en est partie. Que fait `git merge feature`, lancé sur `main` ?", "`main` no se ha movido desde que salió `feature`. ¿Qué hace `git merge feature`, ejecutado en `main`?"],
    a: ["A fast-forward: `main` simply moves up to `feature`'s last commit, with no merge commit", "Une avance rapide : `main` avance simplement jusqu'au dernier commit de `feature`, sans commit de fusion", "Un avance rápido: `main` simplemente avanza hasta el último commit de `feature`, sin commit de fusión"],
    w: [
      ["It always creates a merge commit", "Il crée toujours un commit de fusion", "Siempre crea un commit de fusión"],
      ["It copies `feature`'s commits with new ids", "Il copie les commits de `feature` avec de nouveaux identifiants", "Copia los commits de `feature` con identificadores nuevos"],
      ["It stops with a conflict", "Il s'arrête sur un conflit", "Se detiene con un conflicto"],
    ],
    e: [
      "`git merge --no-ff feature` forces a merge commit, to keep a trace of the branch; `--ff-only` refuses anything but a fast-forward.",
      "`git merge --no-ff feature` impose un commit de fusion, pour garder une trace de la branche ; `--ff-only` refuse tout sauf une avance rapide.",
      "`git merge --no-ff feature` fuerza un commit de fusión, para dejar rastro de la rama; `--ff-only` rechaza todo salvo un avance rápido.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-09",
    q: ["On `feature`, what does `git rebase main` do?", "Sur `feature`, que fait `git rebase main` ?", "En `feature`, ¿qué hace `git rebase main`?"],
    a: ["Replays `feature`'s own commits on top of `main`, as new commits: a straight history", "Rejoue les commits propres à `feature` par-dessus `main`, comme de nouveaux commits : un historique linéaire", "Vuelve a aplicar los commits propios de `feature` encima de `main`, como commits nuevos: un historial lineal"],
    w: [
      ["Merges `main` into `feature` with a merge commit", "Fusionne `main` dans `feature` avec un commit de fusion", "Fusiona `main` en `feature` con un commit de fusión"],
      ["Moves `main` to `feature`", "Déplace `main` sur `feature`", "Mueve `main` a `feature`"],
      ["Deletes `feature` once merged", "Supprime `feature` une fois fusionnée", "Borra `feature` una vez fusionada"],
    ],
    e: [
      "The replayed commits get new ids, so a pushed branch then needs a forced push. `git rebase -i` also lets you reorder, squash or edit commits.",
      "Les commits rejoués ont de nouveaux identifiants : une branche déjà poussée demande alors un push forcé. `git rebase -i` permet aussi de réordonner, fusionner ou modifier des commits.",
      "Los commits reaplicados tienen identificadores nuevos: una rama ya enviada necesita entonces un push forzado. `git rebase -i` también permite reordenar, combinar o editar commits.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-10",
    q: ["A merge stopped on a conflict. You edited the file and removed the `<<<<<<<`, `=======` and `>>>>>>>` markers. What next?", "Une fusion s'est arrêtée sur un conflit. Vous avez corrigé le fichier et retiré les marqueurs `<<<<<<<`, `=======` et `>>>>>>>`. Et ensuite ?", "Una fusión se paró en un conflicto. Corrigió el archivo y quitó los marcadores `<<<<<<<`, `=======` y `>>>>>>>`. ¿Y luego?"],
    a: ["`git add` the file to mark it resolved, then `git commit` (or `git merge --continue`)", "`git add` sur le fichier pour le marquer résolu, puis `git commit` (ou `git merge --continue`)", "`git add` del archivo para marcarlo resuelto, y luego `git commit` (o `git merge --continue`)"],
    w: [
      ["Nothing: saving the file ends the merge", "Rien : enregistrer le fichier termine la fusion", "Nada: guardar el archivo termina la fusión"],
      ["`git push`, which finishes the merge on the server", "`git push`, qui termine la fusion sur le serveur", "`git push`, que termina la fusión en el servidor"],
      ["`git resolve` on the file", "`git resolve` sur le fichier", "`git resolve` sobre el archivo"],
    ],
    e: [
      "`git status` lists the files still in conflict. `git merge --abort` goes back to before the merge.",
      "`git status` liste les fichiers encore en conflit. `git merge --abort` revient à l'état d'avant la fusion.",
      "`git status` lista los archivos aún en conflicto. `git merge --abort` vuelve al estado anterior a la fusión.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-11",
    q: ["After `git checkout 4f2a9c1`, git warns of a 'detached HEAD'. What does it mean?", "Après `git checkout 4f2a9c1`, git signale une « detached HEAD ». Qu'est-ce que cela veut dire ?", "Tras `git checkout 4f2a9c1`, git avisa de una «detached HEAD». ¿Qué significa?"],
    a: ["You are on a commit, not on a branch: new commits belong to no branch unless you create one (`git switch -c fix`)", "Vous êtes sur un commit, pas sur une branche : les nouveaux commits n'appartiennent à aucune branche sauf si vous en créez une (`git switch -c fix`)", "Está en un commit, no en una rama: los commits nuevos no pertenecen a ninguna rama salvo que cree una (`git switch -c fix`)"],
    w: [
      ["The repository is damaged", "Le dépôt est endommagé", "El repositorio está dañado"],
      ["The commit was deleted from the history", "Le commit a été supprimé de l'historique", "El commit se borró del historial"],
      ["You are no longer connected to the server", "Vous n'êtes plus connecté au serveur", "Ya no está conectado al servidor"],
    ],
    e: [
      "Looking around is safe. `git switch -` goes back to the branch you were on; commits made while detached can still be found with `git reflog`.",
      "Regarder ne risque rien. `git switch -` revient à la branche d'avant ; les commits faits en mode détaché se retrouvent encore avec `git reflog`.",
      "Mirar no tiene riesgo. `git switch -` vuelve a la rama anterior; los commits hechos en modo separado aún se encuentran con `git reflog`.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-12",
    q: ["`git branch -d old` refuses to delete the branch. Why might it?", "`git branch -d old` refuse de supprimer la branche. Pourquoi ?", "`git branch -d old` se niega a borrar la rama. ¿Por qué?"],
    a: ["`old` has commits merged nowhere; `-D` would delete it anyway", "`old` a des commits fusionnés nulle part ; `-D` la supprimerait quand même", "`old` tiene commits sin fusionar en ninguna parte; `-D` la borraría igualmente"],
    w: [
      ["Branches can only be deleted on the server", "Les branches ne se suppriment que sur le serveur", "Las ramas solo se borran en el servidor"],
      ["`-d` only works on the current branch", "`-d` ne marche que sur la branche courante", "`-d` solo funciona en la rama actual"],
      ["A branch with more than one commit cannot be deleted", "Une branche de plus d'un commit ne se supprime pas", "Una rama de más de un commit no se puede borrar"],
    ],
    e: [
      "Deleting a branch removes only the name; its commits stay reachable through `git reflog` for a while. The branch you are on cannot be deleted.",
      "Supprimer une branche n'enlève que le nom ; ses commits restent accessibles un temps par `git reflog`. La branche courante ne peut pas être supprimée.",
      "Borrar una rama solo quita el nombre; sus commits siguen accesibles un tiempo con `git reflog`. La rama actual no se puede borrar.",
    ],
    install: GIT,
  },
];

const undo: LinuxQuestion[] = [
  {
    id: "lx-git-13",
    q: ["What does `git restore app.js` do?", "Que fait `git restore app.js` ?", "¿Qué hace `git restore app.js`?"],
    a: ["Throws away the unstaged changes to `app.js`, for good", "Jette les changements non préparés de `app.js`, définitivement", "Descarta los cambios no preparados de `app.js`, para siempre"],
    w: [
      ["Unstages `app.js`, keeping its changes", "Retire `app.js` de la zone de préparation en gardant ses changements", "Saca `app.js` del área de preparación conservando sus cambios"],
      ["Undoes the last commit that touched `app.js`", "Annule le dernier commit qui a touché `app.js`", "Deshace el último commit que tocó `app.js`"],
      ["Brings back a deleted branch", "Ramène une branche supprimée", "Recupera una rama borrada"],
    ],
    e: [
      "The file goes back to its staged (or committed) version; changes never committed cannot be recovered. Unstaging is `git restore --staged app.js`.",
      "Le fichier revient à sa version préparée (ou commitée) ; des changements jamais commités ne se récupèrent pas. Retirer de la préparation, c'est `git restore --staged app.js`.",
      "El archivo vuelve a su versión preparada (o del commit); los cambios que nunca entraron en un commit no se recuperan. Sacar de la preparación es `git restore --staged app.js`.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-14",
    q: ["A bad commit is already pushed to a shared `main`. Which command undoes it safely?", "Un mauvais commit est déjà poussé sur un `main` partagé. Quelle commande l'annule sans risque ?", "Un commit erróneo ya está enviado a un `main` compartido. ¿Qué orden lo deshace sin riesgo?"],
    a: ["`git revert <commit>`: a new commit that undoes its changes", "`git revert <commit>` : un nouveau commit qui défait ses changements", "`git revert <commit>`: un commit nuevo que deshace sus cambios"],
    w: [["`git reset --hard HEAD~1` then `git push --force`", "`git reset --hard HEAD~1` puis `git push --force`", "`git reset --hard HEAD~1` y luego `git push --force`"], ["`git restore .`", "`git restore .`", "`git restore .`"], ["`git commit --amend`", "`git commit --amend`", "`git commit --amend`"]],
    e: [
      "`revert` adds to the history instead of rewriting it, so nobody else's copy breaks. A reset and a forced push remove commits others may have built on.",
      "`revert` ajoute à l'historique au lieu de le réécrire : la copie des autres ne casse pas. Un reset suivi d'un push forcé retire des commits sur lesquels d'autres ont pu bâtir.",
      "`revert` añade al historial en vez de reescribirlo: la copia de los demás no se rompe. Un reset con push forzado quita commits sobre los que otros pueden haber trabajado.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-15",
    q: ["What is the difference between `git reset --soft HEAD~1` and `git reset --hard HEAD~1`?", "Quelle différence entre `git reset --soft HEAD~1` et `git reset --hard HEAD~1` ?", "¿Qué diferencia hay entre `git reset --soft HEAD~1` y `git reset --hard HEAD~1`?"],
    a: ["Both move the branch back one commit; `--soft` keeps its changes staged, `--hard` discards them and every uncommitted change", "Les deux reculent la branche d'un commit ; `--soft` garde ses changements préparés, `--hard` les jette avec tous les changements non commités", "Los dos retroceden la rama un commit; `--soft` conserva sus cambios preparados, `--hard` los descarta junto con todo cambio sin commit"],
    w: [
      ["`--soft` asks for confirmation, `--hard` does not", "`--soft` demande une confirmation, `--hard` non", "`--soft` pide confirmación, `--hard` no"],
      ["`--soft` acts locally, `--hard` on the server too", "`--soft` agit localement, `--hard` aussi sur le serveur", "`--soft` actúa en local, `--hard` también en el servidor"],
      ["`--hard` deletes the commit for good; `--soft` hides it", "`--hard` supprime le commit pour de bon ; `--soft` le cache", "`--hard` borra el commit para siempre; `--soft` lo oculta"],
    ],
    e: [
      "The default, `--mixed`, keeps the changes in the working tree, unstaged. The commit left behind is still in `git reflog`.",
      "Par défaut, `--mixed` garde les changements dans l'arbre de travail, non préparés. Le commit laissé derrière est encore dans `git reflog`.",
      "Por defecto, `--mixed` deja los cambios en el árbol de trabajo, sin preparar. El commit que queda atrás sigue en `git reflog`.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-16",
    q: ["After a `git reset --hard`, you want back the commit you just dropped. Where do you find it?", "Après un `git reset --hard`, vous voulez récupérer le commit que vous venez de perdre. Où le trouver ?", "Tras un `git reset --hard`, quiere recuperar el commit que acaba de perder. ¿Dónde lo encuentra?"],
    a: ["In `git reflog`, which lists where `HEAD` has been; then `git reset --hard <id>`", "Dans `git reflog`, qui liste où `HEAD` est passé ; puis `git reset --hard <id>`", "En `git reflog`, que lista por dónde ha pasado `HEAD`; luego `git reset --hard <id>`"],
    w: [
      ["Nowhere: `--hard` deletes it at once", "Nulle part : `--hard` le supprime aussitôt", "En ninguna parte: `--hard` lo borra al instante"],
      ["In `git log`, which shows every commit ever made", "Dans `git log`, qui montre tous les commits jamais faits", "En `git log`, que muestra todos los commits que se han hecho"],
      ["In the stash", "Dans la remise (stash)", "En el stash"],
    ],
    e: [
      "`git log` only shows commits reachable from a branch. Unreachable commits are kept until garbage collection, 30 days or more by default.",
      "`git log` ne montre que les commits accessibles depuis une branche. Les commits inaccessibles sont gardés jusqu'au ramasse-miettes, 30 jours ou plus par défaut.",
      "`git log` solo muestra los commits accesibles desde una rama. Los inaccesibles se conservan hasta la recolección de basura, 30 días o más por defecto.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-17",
    q: ["Your changes are half done and you must fix a bug on `main` first. What does `git stash` do for you?", "Vos changements sont à moitié faits et vous devez d'abord corriger un bug sur `main`. Que fait `git stash` pour vous ?", "Sus cambios están a medias y antes debe corregir un fallo en `main`. ¿Qué hace `git stash` por usted?"],
    a: ["Sets the uncommitted changes aside and leaves a clean tree; `git stash pop` brings them back", "Met de côté les changements non commités et laisse un arbre propre ; `git stash pop` les ramène", "Aparta los cambios sin commit y deja el árbol limpio; `git stash pop` los recupera"],
    w: [
      ["Commits them on a hidden branch on the server", "Les commite sur une branche cachée du serveur", "Los incluye en un commit en una rama oculta del servidor"],
      ["Deletes them so that you can switch branch", "Les supprime pour qu'on puisse changer de branche", "Los borra para poder cambiar de rama"],
      ["Copies them to the other branch", "Les copie sur l'autre branche", "Los copia a la otra rama"],
    ],
    e: [
      "The stash is local. New untracked files stay unless you use `git stash -u`. `git stash list` shows what is kept.",
      "La remise est locale. Les nouveaux fichiers non suivis restent en place sauf avec `git stash -u`. `git stash list` montre ce qui est gardé.",
      "El stash es local. Los archivos nuevos no seguidos se quedan salvo con `git stash -u`. `git stash list` muestra lo guardado.",
    ],
    install: GIT,
  },
];

const remotes: LinuxQuestion[] = [
  {
    id: "lx-git-18",
    q: ["What is the difference between `git fetch` and `git pull`?", "Quelle différence entre `git fetch` et `git pull` ?", "¿Qué diferencia hay entre `git fetch` y `git pull`?"],
    a: ["`fetch` downloads and updates `origin/main` without touching your branch; `pull` fetches, then merges (or rebases) into it", "`fetch` télécharge et met à jour `origin/main` sans toucher votre branche ; `pull` fait un fetch, puis fusionne (ou rebase) dans votre branche", "`fetch` descarga y actualiza `origin/main` sin tocar su rama; `pull` hace un fetch y luego fusiona (o hace rebase) en su rama"],
    w: [
      ["`fetch` downloads one file, `pull` the whole repository", "`fetch` télécharge un fichier, `pull` tout le dépôt", "`fetch` descarga un archivo, `pull` todo el repositorio"],
      ["`pull` sends your commits, `fetch` receives others'", "`pull` envoie vos commits, `fetch` reçoit ceux des autres", "`pull` envía sus commits, `fetch` recibe los de otros"],
      ["They are the same command", "C'est la même commande", "Son la misma orden"],
    ],
    e: [
      "After a fetch, `git log main..origin/main` shows what came in. `git config pull.rebase true` makes `pull` rebase instead of merge.",
      "Après un fetch, `git log main..origin/main` montre ce qui est arrivé. `git config pull.rebase true` fait rebaser `pull` au lieu de fusionner.",
      "Tras un fetch, `git log main..origin/main` muestra lo que ha llegado. `git config pull.rebase true` hace que `pull` haga rebase en vez de fusionar.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-19",
    q: ["`git push` is rejected as 'non-fast-forward'. What does it mean?", "`git push` est refusé comme « non-fast-forward ». Qu'est-ce que cela veut dire ?", "`git push` se rechaza como «non-fast-forward». ¿Qué significa?"],
    a: ["The server's branch has commits you do not have: pull (merge or rebase) first, then push", "La branche du serveur a des commits que vous n'avez pas : faire d'abord un pull (fusion ou rebase), puis pousser", "La rama del servidor tiene commits que usted no tiene: primero un pull (fusión o rebase), luego push"],
    w: [
      ["You have no right to write to the repository", "Vous n'avez pas le droit d'écrire dans le dépôt", "No tiene derecho a escribir en el repositorio"],
      ["Pushing always needs `--force`", "Pousser demande toujours `--force`", "Enviar siempre necesita `--force`"],
      ["The branch was deleted on the server", "La branche a été supprimée sur le serveur", "La rama se borró en el servidor"],
    ],
    e: [
      "Forcing would erase the others' commits. A refusal for lack of rights says 'permission denied' or '403' instead.",
      "Forcer effacerait les commits des autres. Un refus faute de droits dit plutôt « permission denied » ou « 403 ».",
      "Forzar borraría los commits de los demás. Un rechazo por falta de permisos dice más bien «permission denied» o «403».",
    ],
    install: GIT,
  },
  {
    id: "lx-git-20",
    q: ["Why prefer `git push --force-with-lease` to `git push --force`?", "Pourquoi préférer `git push --force-with-lease` à `git push --force` ?", "¿Por qué preferir `git push --force-with-lease` a `git push --force`?"],
    a: ["It refuses if the server's branch moved since your last fetch, so it cannot erase a colleague's new commits", "Il refuse si la branche du serveur a bougé depuis votre dernier fetch : il ne peut pas effacer les nouveaux commits d'un collègue", "Se niega si la rama del servidor se movió desde su último fetch: no puede borrar los commits nuevos de un compañero"],
    w: [
      ["It is faster on large repositories", "Il est plus rapide sur les gros dépôts", "Es más rápido en repositorios grandes"],
      ["It keeps a backup of the old branch on the server", "Il garde une sauvegarde de l'ancienne branche sur le serveur", "Guarda una copia de la rama antigua en el servidor"],
      ["It only forces for an hour", "Il ne force que pendant une heure", "Solo fuerza durante una hora"],
    ],
    e: [
      "The usual case is a branch rebased after review. A fetch run in the background can defeat the check; `--force-if-includes` closes that gap.",
      "Le cas habituel est une branche rebasée après relecture. Un fetch lancé en arrière-plan peut déjouer la vérification ; `--force-if-includes` comble ce trou.",
      "El caso habitual es una rama con rebase tras la revisión. Un fetch en segundo plano puede burlar la comprobación; `--force-if-includes` cierra ese hueco.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-21",
    q: ["After `git clone`, what is `origin`?", "Après `git clone`, qu'est-ce que `origin` ?", "Tras `git clone`, ¿qué es `origin`?"],
    a: ["The name git gives the remote repository you cloned from", "Le nom que git donne au dépôt distant d'où vous avez cloné", "El nombre que git da al repositorio remoto del que clonó"],
    w: [
      ["The first commit of the repository", "Le premier commit du dépôt", "El primer commit del repositorio"],
      ["The default branch", "La branche par défaut", "La rama por defecto"],
      ["The directory the clone was written to", "Le répertoire où le clone a été écrit", "El directorio donde se escribió el clon"],
    ],
    e: [
      "It is only a name: `git remote -v` shows its URL, `git remote add upstream <url>` adds another (the original of a fork, say).",
      "Ce n'est qu'un nom : `git remote -v` montre son URL, `git remote add upstream <url>` en ajoute un autre (l'original d'un fork, par exemple).",
      "Es solo un nombre: `git remote -v` muestra su URL, `git remote add upstream <url>` añade otro (el original de un fork, por ejemplo).",
    ],
    install: GIT,
  },
  {
    id: "lx-git-22",
    q: ["What does `-u` add to `git push -u origin feature`?", "Qu'apporte `-u` à `git push -u origin feature` ?", "¿Qué añade `-u` a `git push -u origin feature`?"],
    a: ["It links `feature` to `origin/feature`, so a plain `git push` or `git pull` knows where to go next time", "Il relie `feature` à `origin/feature` : la prochaine fois, un simple `git push` ou `git pull` sait où aller", "Enlaza `feature` con `origin/feature`: la próxima vez, un simple `git push` o `git pull` sabe adónde ir"],
    w: [
      ["It updates the server's other branches too", "Il met aussi à jour les autres branches du serveur", "También actualiza las demás ramas del servidor"],
      ["It pushes without asking for a password", "Il pousse sans demander de mot de passe", "Envía sin pedir contraseña"],
      ["It undoes the previous push", "Il annule le push précédent", "Deshace el push anterior"],
    ],
    e: [
      "`-u` is `--set-upstream`. `git status` then says how many commits you are ahead or behind.",
      "`-u` est `--set-upstream`. `git status` dit alors de combien de commits vous êtes en avance ou en retard.",
      "`-u` es `--set-upstream`. `git status` dice entonces cuántos commits va por delante o por detrás.",
    ],
    install: GIT,
  },
  {
    id: "lx-git-23",
    q: ["A colleague pushed to `main` an hour ago, but `origin/main` on your machine does not show it. Why?", "Un collègue a poussé sur `main` il y a une heure, mais `origin/main` sur votre machine ne le montre pas. Pourquoi ?", "Un compañero envió a `main` hace una hora, pero `origin/main` en su máquina no lo muestra. ¿Por qué?"],
    a: ["`origin/main` is your local copy of where `main` was at your last fetch; it moves only with `git fetch` (or `pull`)", "`origin/main` est votre copie locale de l'endroit où était `main` à votre dernier fetch ; elle ne bouge qu'avec `git fetch` (ou `pull`)", "`origin/main` es su copia local de dónde estaba `main` en su último fetch; solo se mueve con `git fetch` (o `pull`)"],
    w: [
      ["The server takes an hour to publish a push", "Le serveur met une heure à publier un push", "El servidor tarda una hora en publicar un push"],
      ["Their push went to their own `origin`", "Son push est allé dans son propre `origin`", "Su push fue a su propio `origin`"],
      ["`origin/main` only shows your own commits", "`origin/main` ne montre que vos propres commits", "`origin/main` solo muestra sus propios commits"],
    ],
    e: [
      "Remote-tracking branches never update by themselves. `git fetch --prune` also drops the ones whose branch was deleted on the server.",
      "Les branches de suivi distantes ne se mettent jamais à jour seules. `git fetch --prune` retire aussi celles dont la branche a été supprimée sur le serveur.",
      "Las ramas de seguimiento remotas nunca se actualizan solas. `git fetch --prune` también quita aquellas cuya rama se borró en el servidor.",
    ],
    install: GIT,
  },
];

export const git = { commits, branches, undo, remotes };
