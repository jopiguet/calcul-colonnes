# Matemáticas — lo esencial del test

## Cómo usar este curso

Este curso acompaña al test de matemáticas. Cada parte cubre temas del test, da las reglas necesarias y resuelve un ejemplo. Lea una parte y haga el test sobre sus temas; después del test, una respuesta errónea remite a la parte que la explica.

**Los cuatro niveles.**

| Nivel | Lo que pide |
|---|---|
| Principiante | Las reglas básicas: polinomios, derivadas y primitivas sencillas, primeros términos de sucesiones |
| Intermedio | Las matemáticas del final del bachillerato: límites, exponenciales, números complejos, probabilidad |
| Avanzado | Primer año de universidad: integración por partes, ecuaciones diferenciales, matrices, series |
| Experto | Los casos difíciles de cada uno: funciones compuestas, valores propios, series de potencias, varias variables |

Las series y las funciones de varias variables empiezan en Avanzado. Las preguntas se generan, así que cada test es nuevo; las opciones erróneas son los errores que suelen cometer los estudiantes.

## Parte 1 — Las funciones y sus gráficas

La gráfica de una función muestra de un vistazo su signo, sus variaciones y sus puntos especiales.

- Una cuadrática $ax^2+bx+c$ tiene el vértice en $x = -\frac{b}{2a}$ y raíces reales cuando $\Delta = b^2-4ac \ge 0$: $x = \frac{-b \pm \sqrt{\Delta}}{2a}$.
- La tangente en $a$ es $y = f(a) + f'(a)(x-a)$.
- Un máximo o mínimo local está donde $f'$ cambia de signo; un punto de inflexión, donde $f''$ cambia de signo.
- $y = f(x-h)+k$ desplaza la gráfica $h$ a la derecha y $k$ hacia arriba; $y = a f(x)$ la estira verticalmente, $y = f(bx)$ la comprime horizontalmente.
- Existe una asíntota oblicua $y = mx+p$ cuando $f(x) - (mx+p) \to 0$ para $x \to \pm\infty$.

Ejemplo: $f(x) = x^2 - 4x + 3$ tiene el vértice en $x = 2$, $f(2) = -1$, y raíces 1 y 3.

## Parte 2 — Límites y derivadas

**Límites.** Para una función racional en el infinito, compare los términos de mayor grado: $\frac{3x^2+1}{x^2-5} \to 3$. Límites útiles: $\frac{\sin x}{x} \to 1$ y $\frac{e^x-1}{x} \to 1$ cuando $x \to 0$; las exponenciales ganan a las potencias, que ganan a los logaritmos. Cerca de 0, los desarrollos de Taylor resuelven los casos difíciles: $\cos x = 1 - \frac{x^2}{2} + o(x^2)$.

**Derivadas.**

| Función | Derivada |
|---|---|
| $x^n$ | $n x^{n-1}$ |
| $e^x$, $\ln x$ | $e^x$, $\frac{1}{x}$ |
| $\sin x$, $\cos x$ | $\cos x$, $-\sin x$ |
| $\arctan x$ | $\frac{1}{1+x^2}$ |
| $u\,v$, $\frac{u}{v}$ | $u'v + uv'$, $\frac{u'v - uv'}{v^2}$ |
| $f(g(x))$ | $f'(g(x))\,g'(x)$ |

Ejemplo: $(x^2 \ln x)' = 2x\ln x + x$.

## Parte 3 — Integrales

Una primitiva $F$ de $f$ cumple $F' = f$, y $\int_a^b f(x)\,dx = F(b) - F(a)$.

- Lea la tabla de derivadas al revés: $\int x^n\,dx = \frac{x^{n+1}}{n+1} + C$ para $n \ne -1$, $\int \frac{dx}{x} = \ln|x| + C$.
- Sustitución: si el integrando tiene la forma $f(g(x))\,g'(x)$, tome $u = g(x)$.
- Por partes: $\int u\,v' = uv - \int u'v$; elija como $u$ lo que se simplifica al derivar ($x$, $\ln x$).

Ejemplo: $\int_0^1 x e^x\,dx = [x e^x]_0^1 - \int_0^1 e^x\,dx = e - (e - 1) = 1$.

## Parte 4 — Exponenciales, logaritmos, trigonometría

**Exponencial y logaritmo.** $\ln(ab) = \ln a + \ln b$, $\ln(a^n) = n \ln a$, $e^{\ln x} = x$. Para resolver $e^{2x} = 5$, tome logaritmos: $x = \frac{\ln 5}{2}$. Otra base: $a^x = e^{x\ln a}$. Una ecuación en $e^{2x}$ y $e^x$ se vuelve cuadrática con $X = e^x$, conservando solo $X > 0$.

**Trigonometría.** Conozca los valores exactos en $0$, $\frac{\pi}{6}$, $\frac{\pi}{4}$, $\frac{\pi}{3}$, $\frac{\pi}{2}$, y las identidades $\cos^2 x + \sin^2 x = 1$, $\cos 2x = 2\cos^2 x - 1$, $\sin 2x = 2\sin x\cos x$. $\cos x = \cos a$ da $x = \pm a + 2k\pi$; $\sin x = \sin a$ da $x = a + 2k\pi$ o $\pi - a + 2k\pi$. El periodo de $\sin(\omega x)$ es $\frac{2\pi}{\omega}$.

## Parte 5 — Sucesiones y series

**Sucesiones.** Aritmética: $u_n = u_0 + nr$, suma de términos $= $ número de términos $\times$ (primero + último)/2. Geométrica: $u_n = u_0 q^n$, $\sum_{k=0}^{n} q^k = \frac{1-q^{n+1}}{1-q}$; $q^n \to 0$ cuando $|q| < 1$. Una sucesión $u_{n+1} = f(u_n)$ que converge a $\ell$, con $f$ continua, cumple $f(\ell) = \ell$.

**Series** (Avanzado). $\sum q^n = \frac{1}{1-q}$ para $|q|<1$. Las sumas telescópicas se cancelan: $\sum \frac{1}{n(n+1)} = \sum \left(\frac1n - \frac{1}{n+1}\right) = 1$. $e^x = \sum \frac{x^n}{n!}$ para todo $x$. Una serie de potencias $\sum a_n x^n$ converge para $|x| < R$, con $R$ obtenido por el criterio del cociente.

## Parte 6 — Números complejos

$z = a + ib$ con $i^2 = -1$; $|z| = \sqrt{a^2+b^2}$; el argumento es el ángulo de $(a, b)$. Forma exponencial: $z = r e^{i\theta}$, que convierte los productos en $r_1 r_2 e^{i(\theta_1+\theta_2)}$.

- Divida multiplicando por el conjugado: $\frac{1}{a+ib} = \frac{a-ib}{a^2+b^2}$.
- De Moivre: $(\cos\theta + i\sin\theta)^n = \cos n\theta + i\sin n\theta$.
- Una cuadrática real con $\Delta < 0$ tiene las raíces $\frac{-b \pm i\sqrt{-\Delta}}{2a}$.
- Las raíces $n$-ésimas de $r e^{i\theta}$ son $r^{1/n} e^{i(\theta + 2k\pi)/n}$, $k = 0, \dots, n-1$.

Ejemplo: $(1+i)^2 = 2i$, así que $|1+i| = \sqrt2$ y $\arg(1+i) = \frac{\pi}{4}$.

## Parte 7 — Álgebra lineal y geometría

**Matrices.** $\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$; una matriz es invertible exactamente cuando su determinante no es 0. Multiplicar una fila por $k$ multiplica el determinante por $k$, así que $\det(kA) = k^n\det A$ para una matriz $n \times n$. Un producto $AB$ toma filas de $A$ con columnas de $B$, y $AB \ne BA$ en general. Los valores propios resuelven $\det(A - \lambda I) = 0$.

**Geometría.** $\vec u \cdot \vec v = |\vec u|\,|\vec v|\cos\theta$. Un plano de normal $(a, b, c)$ es $ax+by+cz+d = 0$, y la distancia de un punto es $\frac{|ax_0+by_0+cz_0+d|}{\sqrt{a^2+b^2+c^2}}$. El producto vectorial $\vec u \times \vec v$ es perpendicular a ambos.

## Parte 8 — Ecuaciones diferenciales y varias variables

**Ecuaciones diferenciales.** $y' = ay$ da $y = Ce^{ax}$; $y' = ay + b$ añade la solución constante $-\frac{b}{a}$. Para $y'' + py' + qy = 0$, resuelva $r^2 + pr + q = 0$:

| Raíces | Soluciones |
|---|---|
| Dos reales $r_1 \ne r_2$ | $C_1 e^{r_1 x} + C_2 e^{r_2 x}$ |
| Raíz doble $r$ | $(C_1 + C_2 x)e^{rx}$ |
| $\alpha \pm i\beta$ | $e^{\alpha x}(C_1\cos\beta x + C_2\sin\beta x)$ |

Una ecuación separable $y' = f(x)g(y)$ se resuelve con $\int \frac{dy}{g(y)} = \int f(x)\,dx$.

**Varias variables** (Avanzado). Una derivada parcial trata las demás variables como constantes. El gradiente $\nabla f$ las reúne; los puntos críticos cumplen $\nabla f = \vec 0$. Una integral doble sobre un rectángulo son dos integrales simples sucesivas.

## Parte 9 — Probabilidad

- $P(A \cup B) = P(A) + P(B) - P(A \cap B)$; probabilidad total: $P(B) = \sum P(B \mid A_i)P(A_i)$; Bayes: $P(A \mid B) = \frac{P(B \mid A)P(A)}{P(B)}$.
- Combinaciones: $\binom{n}{k} = \frac{n!}{k!(n-k)!}$.
- Binomial $\mathcal B(n, p)$: $P(X = k) = \binom{n}{k}p^k(1-p)^{n-k}$, media $np$, varianza $np(1-p)$.
- Poisson de media $\lambda$: $P(X=k) = e^{-\lambda}\frac{\lambda^k}{k!}$. Exponencial: $P(X > t) = e^{-\lambda t}$.
- Normal $\mathcal N(\mu, \sigma^2)$: tipifique con $Z = \frac{X-\mu}{\sigma}$.

Ejemplo: con un test de sensibilidad 99 %, especificidad 95 % y una prevalencia del 1 %, Bayes da $P(M \mid +) = \frac{0.99 \times 0.01}{0.99 \times 0.01 + 0.05 \times 0.99} \approx 0.17$.

## Fuentes

| Tema | Referencia gratuita |
|---|---|
| Funciones, límites, derivadas, integrales | [OpenStax, Calculus Volume 1](https://openstax.org/details/books/calculus-volume-1) |
| Series, ecuaciones diferenciales | [OpenStax, Calculus Volume 2](https://openstax.org/details/books/calculus-volume-2) |
| Varias variables, vectores | [OpenStax, Calculus Volume 3](https://openstax.org/details/books/calculus-volume-3) |
| Probabilidad | [OpenStax, Introductory Statistics](https://openstax.org/details/books/introductory-statistics) |
| Apuntes y ejercicios resueltos (en inglés) | [Paul's Online Math Notes](https://tutorial.math.lamar.edu/) |
