# Mathematics — the essentials of the test

## How to use this course

This course goes with the maths test. Each part covers the topics of the test, gives the rules you need, and works one example. Read a part, then take the test on its topics; after the test, a wrong answer links back to the part that explains it.

**The four levels.**

| Level | What it asks |
|---|---|
| Beginner | The basic rules: polynomials, simple derivatives and primitives, first terms of sequences |
| Intermediate | Secondary-school mathematics at the end of the course: limits, exponentials, complex numbers, probability |
| Advanced | First year of university: integration by parts, differential equations, matrices, series |
| Expert | The harder cases of each: composite functions, eigenvalues, power series, several variables |

Series and functions of several variables start at Advanced. The questions are generated, so each test is new; the wrong options are the mistakes students usually make.

## Part 1 — Functions and their graphs

A function's graph shows its sign, its variations and its special points at a glance.

- A quadratic $ax^2+bx+c$ has its vertex at $x = -\frac{b}{2a}$ and real roots when $\Delta = b^2-4ac \ge 0$: $x = \frac{-b \pm \sqrt{\Delta}}{2a}$.
- The tangent at $a$ is $y = f(a) + f'(a)(x-a)$.
- A local maximum or minimum is where $f'$ changes sign; an inflection point where $f''$ changes sign.
- $y = f(x-h)+k$ shifts the graph by $h$ to the right and $k$ up; $y = a f(x)$ stretches it vertically, $y = f(bx)$ squeezes it horizontally.
- An oblique asymptote $y = mx+p$ exists when $f(x) - (mx+p) \to 0$ as $x \to \pm\infty$.

Example: $f(x) = x^2 - 4x + 3$ has its vertex at $x = 2$, $f(2) = -1$, and roots 1 and 3.

## Part 2 — Limits and derivatives

**Limits.** For a rational function at infinity, compare the leading terms: $\frac{3x^2+1}{x^2-5} \to 3$. Useful limits: $\frac{\sin x}{x} \to 1$ and $\frac{e^x-1}{x} \to 1$ as $x \to 0$; exponentials beat powers, which beat logarithms. Near 0, Taylor expansions settle hard cases: $\cos x = 1 - \frac{x^2}{2} + o(x^2)$.

**Derivatives.**

| Function | Derivative |
|---|---|
| $x^n$ | $n x^{n-1}$ |
| $e^x$, $\ln x$ | $e^x$, $\frac{1}{x}$ |
| $\sin x$, $\cos x$ | $\cos x$, $-\sin x$ |
| $\arctan x$ | $\frac{1}{1+x^2}$ |
| $u\,v$, $\frac{u}{v}$ | $u'v + uv'$, $\frac{u'v - uv'}{v^2}$ |
| $f(g(x))$ | $f'(g(x))\,g'(x)$ |

Example: $(x^2 \ln x)' = 2x\ln x + x$.

## Part 3 — Integrals

A primitive $F$ of $f$ satisfies $F' = f$, and $\int_a^b f(x)\,dx = F(b) - F(a)$.

- Read the derivative table backwards: $\int x^n\,dx = \frac{x^{n+1}}{n+1} + C$ for $n \ne -1$, $\int \frac{dx}{x} = \ln|x| + C$.
- Substitution: if the integrand has the form $f(g(x))\,g'(x)$, set $u = g(x)$.
- By parts: $\int u\,v' = uv - \int u'v$; choose $u$ to become simpler when differentiated ($x$, $\ln x$).

Example: $\int_0^1 x e^x\,dx = [x e^x]_0^1 - \int_0^1 e^x\,dx = e - (e - 1) = 1$.

## Part 4 — Exponentials, logarithms, trigonometry

**Exponential and logarithm.** $\ln(ab) = \ln a + \ln b$, $\ln(a^n) = n \ln a$, $e^{\ln x} = x$. To solve $e^{2x} = 5$, take logarithms: $x = \frac{\ln 5}{2}$. Another base: $a^x = e^{x\ln a}$. An equation in $e^{2x}$ and $e^x$ becomes quadratic with $X = e^x$, keeping only $X > 0$.

**Trigonometry.** Know the exact values at $0$, $\frac{\pi}{6}$, $\frac{\pi}{4}$, $\frac{\pi}{3}$, $\frac{\pi}{2}$, and the identities $\cos^2 x + \sin^2 x = 1$, $\cos 2x = 2\cos^2 x - 1$, $\sin 2x = 2\sin x\cos x$. $\cos x = \cos a$ gives $x = \pm a + 2k\pi$; $\sin x = \sin a$ gives $x = a + 2k\pi$ or $\pi - a + 2k\pi$. The period of $\sin(\omega x)$ is $\frac{2\pi}{\omega}$.

## Part 5 — Sequences and series

**Sequences.** Arithmetic: $u_n = u_0 + nr$, sum of terms $= $ number of terms $\times$ (first + last)/2. Geometric: $u_n = u_0 q^n$, $\sum_{k=0}^{n} q^k = \frac{1-q^{n+1}}{1-q}$; $q^n \to 0$ when $|q| < 1$. A sequence $u_{n+1} = f(u_n)$ that converges to $\ell$ with $f$ continuous has $f(\ell) = \ell$.

**Series** (Advanced). $\sum q^n = \frac{1}{1-q}$ for $|q|<1$. Telescoping sums cancel: $\sum \frac{1}{n(n+1)} = \sum \left(\frac1n - \frac{1}{n+1}\right) = 1$. $e^x = \sum \frac{x^n}{n!}$ for every $x$. A power series $\sum a_n x^n$ converges for $|x| < R$, with $R$ found by the ratio test.

## Part 6 — Complex numbers

$z = a + ib$ with $i^2 = -1$; $|z| = \sqrt{a^2+b^2}$; the argument is the angle of $(a, b)$. Exponential form: $z = r e^{i\theta}$, which turns products into $r_1 r_2 e^{i(\theta_1+\theta_2)}$.

- Divide by multiplying by the conjugate: $\frac{1}{a+ib} = \frac{a-ib}{a^2+b^2}$.
- De Moivre: $(\cos\theta + i\sin\theta)^n = \cos n\theta + i\sin n\theta$.
- A real quadratic with $\Delta < 0$ has the roots $\frac{-b \pm i\sqrt{-\Delta}}{2a}$.
- The $n$-th roots of $r e^{i\theta}$ are $r^{1/n} e^{i(\theta + 2k\pi)/n}$, $k = 0, \dots, n-1$.

Example: $(1+i)^2 = 2i$, so $|1+i| = \sqrt2$ and $\arg(1+i) = \frac{\pi}{4}$.

## Part 7 — Linear algebra and geometry

**Matrices.** $\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$; a matrix is invertible exactly when its determinant is not 0. Multiplying a row by $k$ multiplies the determinant by $k$, so $\det(kA) = k^n\det A$ for an $n \times n$ matrix. A product $AB$ takes rows of $A$ with columns of $B$, and $AB \ne BA$ in general. Eigenvalues solve $\det(A - \lambda I) = 0$.

**Geometry.** $\vec u \cdot \vec v = |\vec u|\,|\vec v|\cos\theta$. A plane with normal $(a, b, c)$ is $ax+by+cz+d = 0$, and the distance from a point is $\frac{|ax_0+by_0+cz_0+d|}{\sqrt{a^2+b^2+c^2}}$. The cross product $\vec u \times \vec v$ is perpendicular to both.

## Part 8 — Differential equations and several variables

**Differential equations.** $y' = ay$ gives $y = Ce^{ax}$; $y' = ay + b$ adds the constant solution $-\frac{b}{a}$. For $y'' + py' + qy = 0$, solve $r^2 + pr + q = 0$:

| Roots | Solutions |
|---|---|
| Two real $r_1 \ne r_2$ | $C_1 e^{r_1 x} + C_2 e^{r_2 x}$ |
| Double root $r$ | $(C_1 + C_2 x)e^{rx}$ |
| $\alpha \pm i\beta$ | $e^{\alpha x}(C_1\cos\beta x + C_2\sin\beta x)$ |

A separable equation $y' = f(x)g(y)$ is solved by $\int \frac{dy}{g(y)} = \int f(x)\,dx$.

**Several variables** (Advanced). A partial derivative treats the other variables as constants. The gradient $\nabla f$ collects them; critical points have $\nabla f = \vec 0$. A double integral over a rectangle is two single integrals in turn.

## Part 9 — Probability

- $P(A \cup B) = P(A) + P(B) - P(A \cap B)$; total probability: $P(B) = \sum P(B \mid A_i)P(A_i)$; Bayes: $P(A \mid B) = \frac{P(B \mid A)P(A)}{P(B)}$.
- Combinations: $\binom{n}{k} = \frac{n!}{k!(n-k)!}$.
- Binomial $\mathcal B(n, p)$: $P(X = k) = \binom{n}{k}p^k(1-p)^{n-k}$, mean $np$, variance $np(1-p)$.
- Poisson of mean $\lambda$: $P(X=k) = e^{-\lambda}\frac{\lambda^k}{k!}$. Exponential: $P(X > t) = e^{-\lambda t}$.
- Normal $\mathcal N(\mu, \sigma^2)$: standardise with $Z = \frac{X-\mu}{\sigma}$.

Example: with a test that is 99 % sensitive, 95 % specific and a prevalence of 1 %, Bayes gives $P(M \mid +) = \frac{0.99 \times 0.01}{0.99 \times 0.01 + 0.05 \times 0.99} \approx 0.17$.

## Sources

| Topic | Free reference |
|---|---|
| Functions, limits, derivatives, integrals | [OpenStax, Calculus Volume 1](https://openstax.org/details/books/calculus-volume-1) |
| Series, differential equations | [OpenStax, Calculus Volume 2](https://openstax.org/details/books/calculus-volume-2) |
| Several variables, vectors | [OpenStax, Calculus Volume 3](https://openstax.org/details/books/calculus-volume-3) |
| Probability | [OpenStax, Introductory Statistics](https://openstax.org/details/books/introductory-statistics) |
| Worked notes and exercises | [Paul's Online Math Notes](https://tutorial.math.lamar.edu/) |
