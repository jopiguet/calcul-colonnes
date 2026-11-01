# Analyse — l'essentiel du test

## Comment utiliser ce cours

Ce cours accompagne le test d'analyse, qui suit un cursus universitaire des limites à l'analyse vectorielle et se termine par un premier regard sur le calcul stochastique. Beaucoup de questions montrent un graphe ou un tableau ; lisez l'image avant de calculer.

| Niveau | Ce qu'il demande |
|---|---|
| Débutant | Lire des limites et des pentes sur un graphe, les règles de base, les aires |
| Intermédiaire | Dérivées et intégrales d'une variable, exponentielles, équations différentielles simples |
| Avancé | Techniques d'intégration, séries, courbes paramétrées, plusieurs variables |
| Expert | Preuves en epsilon–delta, critères de convergence, théorème de Green, formule d'Itô |

## Partie 1 — Les limites

$\lim_{x\to a} f(x) = L$ signifie que $f(x)$ s'approche autant qu'on veut de $L$ quand $x$ est assez proche de $a$. Formellement : pour tout $\varepsilon > 0$ il existe $\delta > 0$ tel que $|f(x) - L| < \varepsilon$ dès que $0 < |x - a| < \delta$. Pour $f(x) = 3x + 1$ en $a = 2$, $\delta = \frac{\varepsilon}{3}$ convient. Une limite n'existe que si les deux limites latérales coïncident ; une fonction est continue en $a$ quand la limite vaut $f(a)$.

## Partie 2 — Les dérivées et leurs applications

La dérivée est la limite des pentes des sécantes : $f'(a) = \lim_{h\to0}\frac{f(a+h) - f(a)}{h}$, et la tangente est $y = f(a) + f'(a)(x - a)$.

- Les points critiques sont là où $f' = 0$ ou n'existe pas ; le test de la dérivée seconde les classe.
- Sur un intervalle fermé, les extremums sont aux points critiques ou aux bornes.
- La méthode de Newton trouve une racine en suivant les tangentes : $x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$.
- Les taux liés dérivent une équation par rapport au temps.

Exemple : pour $f(x) = x^2 - 2$ depuis $x_0 = 1$, Newton donne $x_1 = 1.5$, puis $x_2 \approx 1.4167$, proche de $\sqrt2$.

## Partie 3 — Intégrales et techniques

Une somme de Riemann $\sum f(x_i)\,\Delta x$ tend vers l'intégrale quand $\Delta x \to 0$. L'intégrale donne l'aire **algébrique** : les parties sous l'axe comptent négativement. Le théorème fondamental : $\frac{d}{dx}\int_a^x f(t)\,dt = f(x)$.

| Technique | Quand |
|---|---|
| Changement de variable | Une fonction et sa dérivée apparaissent ensemble |
| Par parties | Un produit comme $x e^x$ ou $x\ln x$ |
| Fractions partielles | Une fonction rationnelle |
| Substitution trigonométrique | $\sqrt{a^2 - x^2}$ et semblables |

Les méthodes des trapèzes et de Simpson approchent une intégrale numériquement. Une intégrale impropre est une limite : $\int_1^\infty \frac{dx}{x^p}$ converge exactement quand $p > 1$.

## Partie 4 — Les fonctions transcendantes

$\frac{d}{dx}e^x = e^x$, $\frac{d}{dx}\ln x = \frac1x$, $\frac{d}{dx}a^x = a^x\ln a$. La décroissance exponentielle $N(t) = N_0 e^{-kt}$ a pour demi-vie $\frac{\ln 2}{k}$. La règle de L'Hôpital règle les formes $\frac00$ et $\frac{\infty}{\infty}$ : $\lim_{x\to0}\frac{\sin x}{x} = \lim_{x\to0}\frac{\cos x}{1} = 1$. Les autres formes comme $0 \cdot \infty$ ou $1^\infty$ doivent d'abord être réécrites en quotient, souvent avec un logarithme.

## Partie 5 — Les équations différentielles

Un champ de pentes dessine $y' = f(x, y)$ en petits segments ; les courbes solutions les suivent. La méthode d'Euler avance pas à pas : $y_{n+1} = y_n + h\,f(x_n, y_n)$. Les équations à variables séparables s'intègrent de chaque côté. Le modèle logistique $P' = rP\left(1 - \frac{P}{K}\right)$ croît vers la capacité d'accueil $K$ ; un prélèvement à taux constant $H$ déplace les équilibres, et au-delà de $\frac{rK}{4}$ la population s'effondre.

## Partie 6 — Courbes paramétrées et coordonnées polaires

Une courbe paramétrée $(x(t), y(t))$ a pour pente $\frac{dy}{dx} = \frac{y'(t)}{x'(t)}$ et pour longueur $\int\sqrt{x'^2 + y'^2}\,dt$. En coordonnées polaires $x = r\cos\theta$, $y = r\sin\theta$, et l'aire balayée vaut $\frac12\int r^2\,d\theta$. La rosace $r = \cos(n\theta)$ a $n$ pétales quand $n$ est impair et $2n$ quand $n$ est pair.

## Partie 7 — Les séries

Une série géométrique $\sum ar^n$ converge vers $\frac{a}{1-r}$ quand $|r| < 1$. Critères : les termes doivent tendre vers 0 (nécessaire, pas suffisant — la série harmonique diverge) ; les critères de comparaison, de d'Alembert et des séries alternées tranchent la plupart des cas. Un polynôme de Taylor $\sum \frac{f^{(n)}(a)}{n!}(x-a)^n$ colle à la fonction près de $a$, et son graphe s'en écarte hors du rayon de convergence.

## Partie 8 — Vecteurs et plusieurs variables

$\vec u \cdot \vec v = |\vec u||\vec v|\cos\theta$ donne l'angle ; $|\vec u \times \vec v|$ est l'aire du parallélogramme qu'ils engendrent. Pour $f(x, y)$, le gradient $\nabla f$ pointe vers la montée, et la dérivée directionnelle selon un vecteur unitaire $\vec u$ vaut $\nabla f \cdot \vec u$. En un point critique, $D = f_{xx}f_{yy} - f_{xy}^2$ classe : $D > 0$ et $f_{xx} > 0$ un minimum, $D > 0$ et $f_{xx} < 0$ un maximum, $D < 0$ un point-selle.

## Partie 9 — L'analyse vectorielle

Une intégrale curviligne $\int_C \vec F \cdot d\vec r$ mesure le travail d'un champ le long d'une courbe ; pour un champ de gradient, elle ne dépend que des extrémités. Le théorème de Green transforme une circulation autour d'une courbe fermée en intégrale double sur la région intérieure :

$$
\oint_C P\,dx + Q\,dy = \iint_D \left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right)dA
$$

Le théorème de Stokes et celui de la divergence étendent la même idée aux surfaces et aux volumes.

## Partie 10 — Le calcul stochastique

Un mouvement brownien $W_t$ part de 0, a des accroissements indépendants, et $W_t - W_s$ suit une loi normale de moyenne 0 et de variance $t - s$. Ses trajectoires sont continues mais nulle part dérivables, et $(dW)^2 = dt$. La formule d'Itô est la règle de la chaîne avec un terme de plus :

$$
df(W_t) = f'(W_t)\,dW_t + \frac12 f''(W_t)\,dt
$$

Le mouvement brownien géométrique $dS = \mu S\,dt + \sigma S\,dW$ donne $S_t = S_0\exp\left(\left(\mu - \frac{\sigma^2}{2}\right)t + \sigma W_t\right)$, de moyenne $S_0e^{\mu t}$.

## Sources

| Thème | Référence gratuite |
|---|---|
| Des limites aux intégrales | [OpenStax, Calculus Volume 1](https://openstax.org/details/books/calculus-volume-1) |
| Techniques, équations différentielles, séries, courbes paramétrées | [OpenStax, Calculus Volume 2](https://openstax.org/details/books/calculus-volume-2) |
| Vecteurs, plusieurs variables, analyse vectorielle | [OpenStax, Calculus Volume 3](https://openstax.org/details/books/calculus-volume-3) |
| Calcul stochastique | [MIT OpenCourseWare, Topics in Mathematics with Applications in Finance](https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/) |
