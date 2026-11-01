# Mathématiques — l'essentiel du test

## Comment utiliser ce cours

Ce cours accompagne le test de mathématiques. Chaque partie couvre des thèmes du test, donne les règles utiles et traite un exemple. Lisez une partie, puis faites le test sur ses thèmes ; après le test, une mauvaise réponse renvoie à la partie qui l'explique.

**Les quatre niveaux.**

| Niveau | Ce qu'il demande |
|---|---|
| Débutant | Les règles de base : polynômes, dérivées et primitives simples, premiers termes des suites |
| Intermédiaire | Les mathématiques de fin de lycée : limites, exponentielles, nombres complexes, probabilités |
| Avancé | Première année d'université : intégration par parties, équations différentielles, matrices, séries |
| Expert | Les cas difficiles de chacun : fonctions composées, valeurs propres, séries entières, plusieurs variables |

Les séries et les fonctions de plusieurs variables commencent au niveau Avancé. Les questions sont générées, chaque test est donc nouveau ; les mauvaises réponses proposées sont les erreurs que font habituellement les élèves.

## Partie 1 — Les fonctions et leurs graphes

Le graphe d'une fonction montre d'un coup d'œil son signe, ses variations et ses points particuliers.

- Un trinôme $ax^2+bx+c$ a son sommet en $x = -\frac{b}{2a}$ et des racines réelles quand $\Delta = b^2-4ac \ge 0$ : $x = \frac{-b \pm \sqrt{\Delta}}{2a}$.
- La tangente en $a$ est $y = f(a) + f'(a)(x-a)$.
- Un maximum ou un minimum local se trouve là où $f'$ change de signe ; un point d'inflexion là où $f''$ change de signe.
- $y = f(x-h)+k$ décale le graphe de $h$ vers la droite et de $k$ vers le haut ; $y = a f(x)$ l'étire verticalement, $y = f(bx)$ le comprime horizontalement.
- Une asymptote oblique $y = mx+p$ existe quand $f(x) - (mx+p) \to 0$ pour $x \to \pm\infty$.

Exemple : $f(x) = x^2 - 4x + 3$ a son sommet en $x = 2$, $f(2) = -1$, et pour racines 1 et 3.

## Partie 2 — Limites et dérivées

**Limites.** Pour une fonction rationnelle à l'infini, comparez les termes de plus haut degré : $\frac{3x^2+1}{x^2-5} \to 3$. Limites utiles : $\frac{\sin x}{x} \to 1$ et $\frac{e^x-1}{x} \to 1$ quand $x \to 0$ ; les exponentielles l'emportent sur les puissances, qui l'emportent sur les logarithmes. Près de 0, les développements de Taylor règlent les cas difficiles : $\cos x = 1 - \frac{x^2}{2} + o(x^2)$.

**Dérivées.**

| Fonction | Dérivée |
|---|---|
| $x^n$ | $n x^{n-1}$ |
| $e^x$, $\ln x$ | $e^x$, $\frac{1}{x}$ |
| $\sin x$, $\cos x$ | $\cos x$, $-\sin x$ |
| $\arctan x$ | $\frac{1}{1+x^2}$ |
| $u\,v$, $\frac{u}{v}$ | $u'v + uv'$, $\frac{u'v - uv'}{v^2}$ |
| $f(g(x))$ | $f'(g(x))\,g'(x)$ |

Exemple : $(x^2 \ln x)' = 2x\ln x + x$.

## Partie 3 — Intégrales

Une primitive $F$ de $f$ vérifie $F' = f$, et $\int_a^b f(x)\,dx = F(b) - F(a)$.

- Lisez le tableau des dérivées à l'envers : $\int x^n\,dx = \frac{x^{n+1}}{n+1} + C$ pour $n \ne -1$, $\int \frac{dx}{x} = \ln|x| + C$.
- Changement de variable : si l'intégrande a la forme $f(g(x))\,g'(x)$, posez $u = g(x)$.
- Par parties : $\int u\,v' = uv - \int u'v$ ; choisissez pour $u$ ce qui se simplifie en dérivant ($x$, $\ln x$).

Exemple : $\int_0^1 x e^x\,dx = [x e^x]_0^1 - \int_0^1 e^x\,dx = e - (e - 1) = 1$.

## Partie 4 — Exponentielles, logarithmes, trigonométrie

**Exponentielle et logarithme.** $\ln(ab) = \ln a + \ln b$, $\ln(a^n) = n \ln a$, $e^{\ln x} = x$. Pour résoudre $e^{2x} = 5$, prenez le logarithme : $x = \frac{\ln 5}{2}$. Autre base : $a^x = e^{x\ln a}$. Une équation en $e^{2x}$ et $e^x$ devient du second degré avec $X = e^x$, en ne gardant que $X > 0$.

**Trigonométrie.** Connaissez les valeurs exactes en $0$, $\frac{\pi}{6}$, $\frac{\pi}{4}$, $\frac{\pi}{3}$, $\frac{\pi}{2}$, et les identités $\cos^2 x + \sin^2 x = 1$, $\cos 2x = 2\cos^2 x - 1$, $\sin 2x = 2\sin x\cos x$. $\cos x = \cos a$ donne $x = \pm a + 2k\pi$ ; $\sin x = \sin a$ donne $x = a + 2k\pi$ ou $\pi - a + 2k\pi$. La période de $\sin(\omega x)$ est $\frac{2\pi}{\omega}$.

## Partie 5 — Suites et séries

**Suites.** Arithmétique : $u_n = u_0 + nr$, somme des termes $= $ nombre de termes $\times$ (premier + dernier)/2. Géométrique : $u_n = u_0 q^n$, $\sum_{k=0}^{n} q^k = \frac{1-q^{n+1}}{1-q}$ ; $q^n \to 0$ quand $|q| < 1$. Une suite $u_{n+1} = f(u_n)$ qui converge vers $\ell$, avec $f$ continue, vérifie $f(\ell) = \ell$.

**Séries** (Avancé). $\sum q^n = \frac{1}{1-q}$ pour $|q|<1$. Les sommes télescopiques se simplifient : $\sum \frac{1}{n(n+1)} = \sum \left(\frac1n - \frac{1}{n+1}\right) = 1$. $e^x = \sum \frac{x^n}{n!}$ pour tout $x$. Une série entière $\sum a_n x^n$ converge pour $|x| < R$, le rayon $R$ se trouvant par la règle de d'Alembert.

## Partie 6 — Nombres complexes

$z = a + ib$ avec $i^2 = -1$ ; $|z| = \sqrt{a^2+b^2}$ ; l'argument est l'angle de $(a, b)$. Forme exponentielle : $z = r e^{i\theta}$, qui transforme les produits en $r_1 r_2 e^{i(\theta_1+\theta_2)}$.

- Divisez en multipliant par le conjugué : $\frac{1}{a+ib} = \frac{a-ib}{a^2+b^2}$.
- Moivre : $(\cos\theta + i\sin\theta)^n = \cos n\theta + i\sin n\theta$.
- Un trinôme réel avec $\Delta < 0$ a pour racines $\frac{-b \pm i\sqrt{-\Delta}}{2a}$.
- Les racines $n$-ièmes de $r e^{i\theta}$ sont $r^{1/n} e^{i(\theta + 2k\pi)/n}$, $k = 0, \dots, n-1$.

Exemple : $(1+i)^2 = 2i$, donc $|1+i| = \sqrt2$ et $\arg(1+i) = \frac{\pi}{4}$.

## Partie 7 — Algèbre linéaire et géométrie

**Matrices.** $\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$ ; une matrice est inversible exactement quand son déterminant n'est pas nul. Multiplier une ligne par $k$ multiplie le déterminant par $k$, donc $\det(kA) = k^n\det A$ pour une matrice $n \times n$. Un produit $AB$ prend les lignes de $A$ avec les colonnes de $B$, et $AB \ne BA$ en général. Les valeurs propres résolvent $\det(A - \lambda I) = 0$.

**Géométrie.** $\vec u \cdot \vec v = |\vec u|\,|\vec v|\cos\theta$. Un plan de vecteur normal $(a, b, c)$ s'écrit $ax+by+cz+d = 0$, et la distance d'un point est $\frac{|ax_0+by_0+cz_0+d|}{\sqrt{a^2+b^2+c^2}}$. Le produit vectoriel $\vec u \times \vec v$ est perpendiculaire aux deux.

## Partie 8 — Équations différentielles et plusieurs variables

**Équations différentielles.** $y' = ay$ donne $y = Ce^{ax}$ ; $y' = ay + b$ ajoute la solution constante $-\frac{b}{a}$. Pour $y'' + py' + qy = 0$, résolvez $r^2 + pr + q = 0$ :

| Racines | Solutions |
|---|---|
| Deux réelles $r_1 \ne r_2$ | $C_1 e^{r_1 x} + C_2 e^{r_2 x}$ |
| Racine double $r$ | $(C_1 + C_2 x)e^{rx}$ |
| $\alpha \pm i\beta$ | $e^{\alpha x}(C_1\cos\beta x + C_2\sin\beta x)$ |

Une équation à variables séparables $y' = f(x)g(y)$ se résout par $\int \frac{dy}{g(y)} = \int f(x)\,dx$.

**Plusieurs variables** (Avancé). Une dérivée partielle traite les autres variables comme des constantes. Le gradient $\nabla f$ les rassemble ; les points critiques vérifient $\nabla f = \vec 0$. Une intégrale double sur un rectangle se calcule en deux intégrales simples successives.

## Partie 9 — Probabilités

- $P(A \cup B) = P(A) + P(B) - P(A \cap B)$ ; probabilités totales : $P(B) = \sum P(B \mid A_i)P(A_i)$ ; Bayes : $P(A \mid B) = \frac{P(B \mid A)P(A)}{P(B)}$.
- Combinaisons : $\binom{n}{k} = \frac{n!}{k!(n-k)!}$.
- Binomiale $\mathcal B(n, p)$ : $P(X = k) = \binom{n}{k}p^k(1-p)^{n-k}$, espérance $np$, variance $np(1-p)$.
- Poisson de moyenne $\lambda$ : $P(X=k) = e^{-\lambda}\frac{\lambda^k}{k!}$. Exponentielle : $P(X > t) = e^{-\lambda t}$.
- Normale $\mathcal N(\mu, \sigma^2)$ : centrez-réduisez avec $Z = \frac{X-\mu}{\sigma}$.

Exemple : avec un test sensible à 99 %, spécifique à 95 % et une prévalence de 1 %, Bayes donne $P(M \mid +) = \frac{0.99 \times 0.01}{0.99 \times 0.01 + 0.05 \times 0.99} \approx 0.17$.

## Sources

| Thème | Référence gratuite |
|---|---|
| Fonctions, limites, dérivées, intégrales | [OpenStax, Calculus Volume 1](https://openstax.org/details/books/calculus-volume-1) |
| Séries, équations différentielles | [OpenStax, Calculus Volume 2](https://openstax.org/details/books/calculus-volume-2) |
| Plusieurs variables, vecteurs | [OpenStax, Calculus Volume 3](https://openstax.org/details/books/calculus-volume-3) |
| Probabilités | [OpenStax, Introductory Statistics](https://openstax.org/details/books/introductory-statistics) |
| Notes et exercices corrigés (en anglais) | [Paul's Online Math Notes](https://tutorial.math.lamar.edu/) |
