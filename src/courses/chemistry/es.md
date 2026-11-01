# Química física — lo esencial del test

## Cómo usar este curso

Este curso acompaña al test de química física. Cada parte da las ecuaciones que usa el test, las unidades a vigilar y un ejemplo resuelto. Cada pregunta es un cálculo: elija la fórmula, pase a unidades SI y calcule.

| Nivel | Lo que pide |
|---|---|
| Principiante | Una fórmula, valores dados: gas perfecto, cinética de primer orden, Beer–Lambert, energía de un fotón |
| Intermedio | El núcleo de un primer curso: termodinámica, equilibrio, bases cuánticas, cinética |
| Avanzado | Gases reales, mezclas, electroquímica, espectroscopia, termodinámica estadística |
| Experto | Dos pasos o más: Debye–Hückel, teoría de Marcus, funciones de partición, relajación RMN |

Mantenga las temperaturas en kelvin, las presiones en pascales con $R = 8.314\ \mathrm{J\,K^{-1}\,mol^{-1}}$, y las energías por mol salvo que la pregunta diga por molécula.

## Parte 1 — Los gases

- Gas perfecto: $pV = nRT$. Presión parcial: $p_J = x_J\,p$ (Dalton).
- Teoría cinética: $v_{\mathrm{rms}} = \sqrt{\frac{3RT}{M}}$ con $M$ en kg por mol; las velocidades varían como $\sqrt{T/M}$.
- Recorrido libre medio: $\lambda = \frac{kT}{\sigma p}$.
- Gases reales: factor de compresión $Z = \frac{pV_m}{RT}$; van der Waals: $p = \frac{RT}{V_m - b} - \frac{a}{V_m^2}$, temperatura crítica $T_c = \frac{8a}{27Rb}$.

Ejemplo: 1.00 mol a 298 K en 24.8 L da $p = \frac{8.314 \times 298}{0.0248} \approx 1.00 \times 10^5\ \mathrm{Pa}$.

## Parte 2 — El primer principio

$\Delta U = q + w$. Expansión contra una presión externa constante: $w = -p_{\mathrm{ex}}\Delta V$; expansión isoterma reversible de un gas perfecto: $w = -nRT\ln\frac{V_f}{V_i}$.

- Entalpía: $H = U + pV$, y $\Delta H = \Delta U + \Delta n_{\mathrm{gas}}RT$ para una reacción.
- Ley de Hess: las entalpías de reacción se suman como las ecuaciones; $\Delta_r H^\circ = \sum \nu\,\Delta_f H^\circ(\text{productos}) - \sum \nu\,\Delta_f H^\circ(\text{reactivos})$.
- Kirchhoff: $\Delta_r H(T_2) = \Delta_r H(T_1) + \Delta_r C_p\,(T_2 - T_1)$.
- Gas perfecto, adiabática reversible: $T V^{\gamma - 1}$ y $p V^{\gamma}$ son constantes.

## Parte 3 — El segundo principio

- Calentamiento: $\Delta S = C\ln\frac{T_f}{T_i}$; cambio de fase: $\Delta S = \frac{\Delta H}{T}$ (Trouton: unos $85\ \mathrm{J\,K^{-1}\,mol^{-1}}$ en la vaporización); expansión isoterma: $\Delta S = nR\ln\frac{V_f}{V_i}$.
- Rendimiento de Carnot: $\eta = 1 - \frac{T_c}{T_h}$.
- Energía de Gibbs: $\Delta G = \Delta H - T\Delta S$; una reacción se vuelve espontánea por encima o por debajo de $T = \frac{\Delta H}{\Delta S}$ según los signos.
- Presión: para un gas perfecto $G(p_f) = G(p_i) + nRT\ln\frac{p_f}{p_i}$. Cerca de 0 K, Debye: $S \approx \frac{C_p}{3}$.

## Parte 4 — Fases y mezclas

**Fases.** Regla de las fases: $F = C - P + 2$. Clapeyron: $\frac{dp}{dT} = \frac{\Delta H}{T\Delta V}$; Clausius–Clapeyron: $\ln\frac{p_2}{p_1} = -\frac{\Delta_{\mathrm{vap}}H}{R}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)$.

**Mezclas.**

| Ley | Fórmula |
|---|---|
| Raoult | $p_A = x_A\,p_A^*$ |
| Henry | $p_B = x_B\,K_B$ |
| Descenso crioscópico | $\Delta T = K_f\,b$ |
| Presión osmótica | $\Pi = [B]RT$ |
| Energía de Gibbs de mezcla | $\Delta_{\mathrm{mix}}G = nRT(x_A\ln x_A + x_B\ln x_B)$ |

Para iones: fuerza iónica $I = \frac12\sum b_i z_i^2$, y Debye–Hückel $\log\gamma_\pm = -A|z_+z_-|\sqrt I$ con $A = 0.509$ en agua a 25 °C. La regla de la palanca da las cantidades de dos fases a partir de las distancias sobre una línea de reparto.

## Parte 5 — Equilibrio y electroquímica

- $\Delta_r G^\circ = -RT\ln K$, y $\Delta_r G = \Delta_r G^\circ + RT\ln Q$; en el equilibrio $Q = K$.
- Van 't Hoff: $\ln\frac{K_2}{K_1} = -\frac{\Delta_r H^\circ}{R}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)$.
- Pilas: $\Delta_r G = -\nu F E$; Nernst: $E = E^\circ - \frac{RT}{\nu F}\ln Q$; $\ln K = \frac{\nu F E^\circ}{RT}$.
- Combinar semipilas: sume los $\Delta G^\circ$, no los potenciales: $E^\circ_3 = \frac{\nu_1 E^\circ_1 + \nu_2 E^\circ_2}{\nu_3}$.

Ejemplo: $E^\circ = 1.10\ \mathrm{V}$ con $\nu = 2$ da $\Delta_r G^\circ = -2 \times 96485 \times 1.10 \approx -212\ \mathrm{kJ\,mol^{-1}}$.

## Parte 6 — Teoría cuántica y átomos

- Fotones: $E = h\nu = \frac{hc}{\lambda}$; Wien: $\lambda_{\max}T = 2.9 \times 10^{-3}\ \mathrm{m\,K}$; efecto fotoeléctrico: $\frac12 m v^2 = h\nu - \Phi$.
- De Broglie: $\lambda = \frac{h}{p}$; incertidumbre: $\Delta p\,\Delta x \ge \frac{\hbar}{2}$.
- Partícula en una caja: $E_n = \frac{n^2h^2}{8mL^2}$. Oscilador armónico: $E_v = (v + \frac12)\hbar\omega$, energía de punto cero $\frac12\hbar\omega$. Rotor rígido: $E_J = hc\tilde B J(J+1)$.
- Hidrógeno: $\tilde\nu = R_H\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right)$; un orbital tiene $n - 1$ nodos, $l$ de ellos angulares.

## Parte 7 — Espectroscopia y resonancia magnética

**Espectroscopia.** Beer–Lambert: $A = \varepsilon c l$. Las líneas de rotación están separadas $2\tilde B$, y $\tilde B = \frac{\hbar}{4\pi c I}$ con $I = \mu R^2$ da la longitud de enlace. Una molécula de $N$ átomos tiene $3N - 6$ modos normales ($3N - 5$ si es lineal). Los ensanchamientos Doppler y por tiempo de vida ensanchan las líneas: $\delta\tilde\nu \approx \frac{5.3\ \mathrm{cm^{-1}}}{\tau/\mathrm{ps}}$.

**Resonancia.** Frecuencia de Larmor $\nu_L = \frac{\gamma B_0}{2\pi}$. Un desplazamiento químico en hercios vale $\delta \times \nu_0 \times 10^{-6}$. $N$ vecinos equivalentes de espín ½ dividen una línea en $N + 1$ líneas (triángulo de Pascal). La anchura de línea es $\Delta\nu_{1/2} = \frac{1}{\pi T_2}$. En RPE, $h\nu = g\mu_B B_0$.

## Parte 8 — Termodinámica estadística

- Boltzmann: $\frac{N_j}{N_i} = \frac{g_j}{g_i}e^{-\Delta\varepsilon/kT}$.
- Funciones de partición: traslación $q = \frac{V}{\Lambda^3}$ con $\Lambda = \frac{h}{\sqrt{2\pi mkT}}$; rotación $q \approx \frac{kT}{\sigma hc\tilde B}$, con el número de simetría $\sigma$ (2 para una molécula homonuclear); vibración $q = \frac{1}{1 - e^{-hc\tilde\nu/kT}}$.
- Energía media: $\langle\varepsilon\rangle = -\frac{\partial\ln q}{\partial\beta}$; un sistema de dos niveles da $\frac{\varepsilon}{1 + e^{\beta\varepsilon}}$.
- Entropía residual: $S = k\ln W$, por ejemplo $R\ln 2$ por mol para dos orientaciones.

## Parte 9 — Cinética y dinámica de reacciones

| Orden | Ley integrada | Semivida |
|---|---|---|
| Primero | $[A] = [A]_0 e^{-kt}$ | $\frac{\ln 2}{k}$ |
| Segundo | $\frac{1}{[A]} = \frac{1}{[A]_0} + kt$ | $\frac{1}{k[A]_0}$ |

- Arrhenius: $k = Ae^{-E_a/RT}$, así que $\ln\frac{k_2}{k_1} = \frac{E_a}{R}\left(\frac{1}{T_1} - \frac{1}{T_2}\right)$.
- Enzimas: $v = \frac{v_{\max}[S]}{K_M + [S]}$. Extinción: $\frac{\phi_0}{\phi} = 1 + \tau_0 k_q[Q]$. FRET: $E = \frac{R_0^6}{R_0^6 + R^6}$.
- Eyring: $k = \frac{kT}{h}e^{-\Delta^\ddagger G/RT}$. Marcus: $\Delta^\ddagger G = \frac{(\Delta_r G^\circ + \lambda)^2}{4\lambda}$.

Ejemplo: $k = 0.0231\ \mathrm{s^{-1}}$ da $t_{1/2} = \frac{0.693}{0.0231} = 30\ \mathrm{s}$.

## Fuentes

| Tema | Referencia gratuita |
|---|---|
| Química general, gases, termoquímica | [OpenStax, Chemistry 2e](https://openstax.org/details/books/chemistry-2e) |
| Química física, todas las partes | [LibreTexts, Physical and Theoretical Chemistry](https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps) |
| Constantes | [NIST, valores CODATA](https://physics.nist.gov/cuu/Constants/) |
