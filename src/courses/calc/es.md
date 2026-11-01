# Cálculo — lo esencial del test

## Cómo usar este curso

Este curso acompaña al test de cálculo, que sigue un programa universitario desde los límites hasta el cálculo vectorial y termina con un primer vistazo al cálculo estocástico. Muchas preguntas muestran una gráfica o una tabla; lea la imagen antes de calcular.

| Nivel | Lo que pide |
|---|---|
| Principiante | Leer límites y pendientes en una gráfica, las reglas básicas, las áreas |
| Intermedio | Derivadas e integrales de una variable, exponenciales, ecuaciones diferenciales sencillas |
| Avanzado | Técnicas de integración, series, curvas paramétricas, varias variables |
| Experto | Demostraciones épsilon–delta, criterios de convergencia, teorema de Green, fórmula de Itô |

## Parte 1 — Los límites

$\lim_{x\to a} f(x) = L$ significa que $f(x)$ se acerca tanto como se quiera a $L$ cuando $x$ está lo bastante cerca de $a$. Formalmente: para todo $\varepsilon > 0$ existe $\delta > 0$ tal que $|f(x) - L| < \varepsilon$ siempre que $0 < |x - a| < \delta$. Para $f(x) = 3x + 1$ en $a = 2$, sirve $\delta = \frac{\varepsilon}{3}$. Un límite solo existe si coinciden los dos límites laterales; una función es continua en $a$ cuando el límite vale $f(a)$.

## Parte 2 — Las derivadas y sus aplicaciones

La derivada es el límite de las pendientes de las secantes: $f'(a) = \lim_{h\to0}\frac{f(a+h) - f(a)}{h}$, y la recta tangente es $y = f(a) + f'(a)(x - a)$.

- Los puntos críticos están donde $f' = 0$ o no existe; el criterio de la segunda derivada los clasifica.
- En un intervalo cerrado, los extremos están en los puntos críticos o en los bordes.
- El método de Newton encuentra una raíz siguiendo tangentes: $x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$.
- Las tasas relacionadas derivan una ecuación respecto del tiempo.

Ejemplo: para $f(x) = x^2 - 2$ desde $x_0 = 1$, Newton da $x_1 = 1.5$, luego $x_2 \approx 1.4167$, cerca de $\sqrt2$.

## Parte 3 — Integrales y técnicas

Una suma de Riemann $\sum f(x_i)\,\Delta x$ tiende a la integral cuando $\Delta x \to 0$. La integral da el área **neta**: las partes bajo el eje cuentan en negativo. El teorema fundamental: $\frac{d}{dx}\int_a^x f(t)\,dt = f(x)$.

| Técnica | Cuándo |
|---|---|
| Sustitución | Una función y su derivada aparecen juntas |
| Por partes | Un producto como $x e^x$ o $x\ln x$ |
| Fracciones parciales | Una función racional |
| Sustitución trigonométrica | $\sqrt{a^2 - x^2}$ y similares |

Las reglas del trapecio y de Simpson aproximan una integral numéricamente. Una integral impropia es un límite: $\int_1^\infty \frac{dx}{x^p}$ converge exactamente cuando $p > 1$.

## Parte 4 — Las funciones trascendentes

$\frac{d}{dx}e^x = e^x$, $\frac{d}{dx}\ln x = \frac1x$, $\frac{d}{dx}a^x = a^x\ln a$. El decaimiento exponencial $N(t) = N_0 e^{-kt}$ tiene semivida $\frac{\ln 2}{k}$. La regla de L'Hôpital resuelve las formas $\frac00$ y $\frac{\infty}{\infty}$: $\lim_{x\to0}\frac{\sin x}{x} = \lim_{x\to0}\frac{\cos x}{1} = 1$. Otras formas como $0 \cdot \infty$ o $1^\infty$ deben reescribirse antes como cociente, a menudo con un logaritmo.

## Parte 5 — Las ecuaciones diferenciales

Un campo de pendientes dibuja $y' = f(x, y)$ como pequeños segmentos; las curvas solución los siguen. El método de Euler avanza paso a paso: $y_{n+1} = y_n + h\,f(x_n, y_n)$. Las ecuaciones separables se integran a cada lado. El modelo logístico $P' = rP\left(1 - \frac{P}{K}\right)$ crece hacia la capacidad de carga $K$; una captura a tasa constante $H$ desplaza los equilibrios, y por encima de $\frac{rK}{4}$ la población colapsa.

## Parte 6 — Curvas paramétricas y coordenadas polares

Una curva paramétrica $(x(t), y(t))$ tiene pendiente $\frac{dy}{dx} = \frac{y'(t)}{x'(t)}$ y longitud $\int\sqrt{x'^2 + y'^2}\,dt$. En coordenadas polares $x = r\cos\theta$, $y = r\sin\theta$, y el área barrida es $\frac12\int r^2\,d\theta$. La rosa $r = \cos(n\theta)$ tiene $n$ pétalos cuando $n$ es impar y $2n$ cuando $n$ es par.

## Parte 7 — Las series

Una serie geométrica $\sum ar^n$ converge a $\frac{a}{1-r}$ cuando $|r| < 1$. Criterios: los términos deben tender a 0 (necesario, no suficiente — la serie armónica diverge); los criterios de comparación, del cociente y de series alternadas deciden la mayoría de los casos. Un polinomio de Taylor $\sum \frac{f^{(n)}(a)}{n!}(x-a)^n$ se ajusta a la función cerca de $a$, y su gráfica se separa de ella fuera del radio de convergencia.

## Parte 8 — Vectores y varias variables

$\vec u \cdot \vec v = |\vec u||\vec v|\cos\theta$ da el ángulo; $|\vec u \times \vec v|$ es el área del paralelogramo que generan. Para $f(x, y)$, el gradiente $\nabla f$ apunta cuesta arriba, y la derivada direccional según un vector unitario $\vec u$ es $\nabla f \cdot \vec u$. En un punto crítico, $D = f_{xx}f_{yy} - f_{xy}^2$ clasifica: $D > 0$ y $f_{xx} > 0$ un mínimo, $D > 0$ y $f_{xx} < 0$ un máximo, $D < 0$ un punto de silla.

## Parte 9 — El cálculo vectorial

Una integral de línea $\int_C \vec F \cdot d\vec r$ mide el trabajo de un campo a lo largo de una curva; para un campo gradiente solo depende de los extremos. El teorema de Green convierte una circulación alrededor de una curva cerrada en una integral doble sobre la región interior:

$$
\oint_C P\,dx + Q\,dy = \iint_D \left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right)dA
$$

El teorema de Stokes y el de la divergencia extienden la misma idea a superficies y volúmenes.

## Parte 10 — El cálculo estocástico

Un movimiento browniano $W_t$ parte de 0, tiene incrementos independientes, y $W_t - W_s$ es normal de media 0 y varianza $t - s$. Sus trayectorias son continuas pero no derivables en ningún punto, y $(dW)^2 = dt$. La fórmula de Itô es la regla de la cadena con un término más:

$$
df(W_t) = f'(W_t)\,dW_t + \frac12 f''(W_t)\,dt
$$

El movimiento browniano geométrico $dS = \mu S\,dt + \sigma S\,dW$ da $S_t = S_0\exp\left(\left(\mu - \frac{\sigma^2}{2}\right)t + \sigma W_t\right)$, de media $S_0e^{\mu t}$.

## Fuentes

| Tema | Referencia gratuita |
|---|---|
| De los límites a las integrales | [OpenStax, Calculus Volume 1](https://openstax.org/details/books/calculus-volume-1) |
| Técnicas, ecuaciones diferenciales, series, curvas paramétricas | [OpenStax, Calculus Volume 2](https://openstax.org/details/books/calculus-volume-2) |
| Vectores, varias variables, cálculo vectorial | [OpenStax, Calculus Volume 3](https://openstax.org/details/books/calculus-volume-3) |
| Cálculo estocástico | [MIT OpenCourseWare, Topics in Mathematics with Applications in Finance](https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/) |
