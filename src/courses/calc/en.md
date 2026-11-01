# Calculus — the essentials of the test

## How to use this course

This course goes with the calculus test, which follows a university calculus sequence from limits to vector calculus and ends with a first look at stochastic calculus. Many questions show a graph or a table; read the picture before computing.

| Level | What it asks |
|---|---|
| Beginner | Reading limits and slopes from a graph, basic rules, areas |
| Intermediate | Derivatives and integrals of one variable, exponentials, simple differential equations |
| Advanced | Integration techniques, series, parametric curves, several variables |
| Expert | Epsilon–delta proofs, convergence tests, Green's theorem, Itô's formula |

## Part 1 — Limits

$\lim_{x\to a} f(x) = L$ means $f(x)$ gets as close to $L$ as you like when $x$ is close enough to $a$. Formally: for every $\varepsilon > 0$ there is $\delta > 0$ with $|f(x) - L| < \varepsilon$ whenever $0 < |x - a| < \delta$. For $f(x) = 3x + 1$ at $a = 2$, $\delta = \frac{\varepsilon}{3}$ works. A limit exists only if both one-sided limits agree; a function is continuous at $a$ when the limit equals $f(a)$.

## Part 2 — Derivatives and their applications

The derivative is the limit of secant slopes: $f'(a) = \lim_{h\to0}\frac{f(a+h) - f(a)}{h}$, and the tangent line is $y = f(a) + f'(a)(x - a)$.

- Critical points are where $f' = 0$ or does not exist; the second derivative test classifies them.
- On a closed interval, the extreme values are at critical points or at the ends.
- Newton's method finds a root by following tangents: $x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$.
- Related rates differentiate an equation with respect to time.

Example: for $f(x) = x^2 - 2$ from $x_0 = 1$, Newton gives $x_1 = 1.5$, then $x_2 \approx 1.4167$, close to $\sqrt2$.

## Part 3 — Integrals and techniques

A Riemann sum $\sum f(x_i)\,\Delta x$ approaches the integral as $\Delta x \to 0$. The integral gives **net** area: parts below the axis count negatively. The fundamental theorem: $\frac{d}{dx}\int_a^x f(t)\,dt = f(x)$.

| Technique | When |
|---|---|
| Substitution | A function and its derivative appear together |
| By parts | A product such as $x e^x$ or $x\ln x$ |
| Partial fractions | A rational function |
| Trigonometric substitution | $\sqrt{a^2 - x^2}$ and similar |

The trapezoidal and Simpson rules approximate an integral numerically. An improper integral is a limit: $\int_1^\infty \frac{dx}{x^p}$ converges exactly when $p > 1$.

## Part 4 — Transcendental functions

$\frac{d}{dx}e^x = e^x$, $\frac{d}{dx}\ln x = \frac1x$, $\frac{d}{dx}a^x = a^x\ln a$. Exponential decay $N(t) = N_0 e^{-kt}$ has half-life $\frac{\ln 2}{k}$. L'Hôpital's rule settles $\frac00$ and $\frac{\infty}{\infty}$ forms: $\lim_{x\to0}\frac{\sin x}{x} = \lim_{x\to0}\frac{\cos x}{1} = 1$. Other forms such as $0 \cdot \infty$ or $1^\infty$ must first be rewritten as a quotient, often with a logarithm.

## Part 5 — Differential equations

A slope field draws $y' = f(x, y)$ as small segments; solution curves follow them. Euler's method steps along: $y_{n+1} = y_n + h\,f(x_n, y_n)$. Separable equations integrate each side. The logistic model $P' = rP\left(1 - \frac{P}{K}\right)$ grows towards the carrying capacity $K$; harvesting at a constant rate $H$ shifts the equilibria, and above $\frac{rK}{4}$ the population collapses.

## Part 6 — Parametric curves and polar coordinates

A parametric curve $(x(t), y(t))$ has slope $\frac{dy}{dx} = \frac{y'(t)}{x'(t)}$ and length $\int\sqrt{x'^2 + y'^2}\,dt$. In polar coordinates $x = r\cos\theta$, $y = r\sin\theta$, and the area swept is $\frac12\int r^2\,d\theta$. The rose $r = \cos(n\theta)$ has $n$ petals when $n$ is odd and $2n$ when $n$ is even.

## Part 7 — Series

A geometric series $\sum ar^n$ converges to $\frac{a}{1-r}$ when $|r| < 1$. Tests: the terms must tend to 0 (necessary, not sufficient — the harmonic series diverges); comparison, ratio and alternating-series tests decide most cases. A Taylor polynomial $\sum \frac{f^{(n)}(a)}{n!}(x-a)^n$ matches the function near $a$, and its graph peels away from the function outside the radius of convergence.

## Part 8 — Vectors and several variables

$\vec u \cdot \vec v = |\vec u||\vec v|\cos\theta$ gives the angle; $|\vec u \times \vec v|$ is the area of the parallelogram they span. For $f(x, y)$, the gradient $\nabla f$ points uphill, and the directional derivative along a unit vector $\vec u$ is $\nabla f \cdot \vec u$. At a critical point, $D = f_{xx}f_{yy} - f_{xy}^2$ classifies: $D > 0$ and $f_{xx} > 0$ a minimum, $D > 0$ and $f_{xx} < 0$ a maximum, $D < 0$ a saddle.

## Part 9 — Vector calculus

A line integral $\int_C \vec F \cdot d\vec r$ measures the work of a field along a curve; for a gradient field it depends only on the ends. Green's theorem turns a circulation around a closed curve into a double integral over the region inside:

$$
\oint_C P\,dx + Q\,dy = \iint_D \left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right)dA
$$

Stokes's theorem and the divergence theorem extend the same idea to surfaces and volumes.

## Part 10 — Stochastic calculus

A Brownian motion $W_t$ starts at 0, has independent increments, and $W_t - W_s$ is normal with mean 0 and variance $t - s$. Its paths are continuous but nowhere differentiable, and $(dW)^2 = dt$. Itô's formula is the chain rule with an extra term:

$$
df(W_t) = f'(W_t)\,dW_t + \frac12 f''(W_t)\,dt
$$

Geometric Brownian motion $dS = \mu S\,dt + \sigma S\,dW$ gives $S_t = S_0\exp\left(\left(\mu - \frac{\sigma^2}{2}\right)t + \sigma W_t\right)$, with mean $S_0e^{\mu t}$.

## Sources

| Topic | Free reference |
|---|---|
| Limits to integrals | [OpenStax, Calculus Volume 1](https://openstax.org/details/books/calculus-volume-1) |
| Techniques, ODEs, series, parametric | [OpenStax, Calculus Volume 2](https://openstax.org/details/books/calculus-volume-2) |
| Vectors, several variables, vector calculus | [OpenStax, Calculus Volume 3](https://openstax.org/details/books/calculus-volume-3) |
| Stochastic calculus | [MIT OpenCourseWare, Topics in Mathematics with Applications in Finance](https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/) |
