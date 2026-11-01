# Physical chemistry — the essentials of the test

## How to use this course

This course goes with the physical chemistry test. Each part gives the equations the test uses, the units to watch and one worked example. Every question is a calculation: choose the formula, convert to SI units, then compute.

| Level | What it asks |
|---|---|
| Beginner | One formula, given values: perfect gas, first-order kinetics, Beer–Lambert, photon energy |
| Intermediate | The core of a first course: thermodynamics, equilibrium, quantum basics, kinetics |
| Advanced | Real gases, mixtures, electrochemistry, spectroscopy, statistical thermodynamics |
| Expert | Two steps or more: Debye–Hückel, Marcus theory, partition functions, NMR relaxation |

Keep temperatures in kelvin, pressures in pascals when $R = 8.314\ \mathrm{J\,K^{-1}\,mol^{-1}}$, and energies per mole unless the question says per molecule.

## Part 1 — Gases

- Perfect gas: $pV = nRT$. Partial pressure: $p_J = x_J\,p$ (Dalton).
- Kinetic theory: $v_{\mathrm{rms}} = \sqrt{\frac{3RT}{M}}$ with $M$ in kg per mol; speeds scale as $\sqrt{T/M}$.
- Mean free path: $\lambda = \frac{kT}{\sigma p}$.
- Real gases: compression factor $Z = \frac{pV_m}{RT}$; van der Waals: $p = \frac{RT}{V_m - b} - \frac{a}{V_m^2}$, critical temperature $T_c = \frac{8a}{27Rb}$.

Example: 1.00 mol at 298 K in 24.8 L gives $p = \frac{8.314 \times 298}{0.0248} \approx 1.00 \times 10^5\ \mathrm{Pa}$.

## Part 2 — The first law

$\Delta U = q + w$. Expansion against a constant external pressure: $w = -p_{\mathrm{ex}}\Delta V$; reversible isothermal expansion of a perfect gas: $w = -nRT\ln\frac{V_f}{V_i}$.

- Enthalpy: $H = U + pV$, and $\Delta H = \Delta U + \Delta n_{\mathrm{gas}}RT$ for a reaction.
- Hess's law: reaction enthalpies add like the equations; $\Delta_r H^\circ = \sum \nu\,\Delta_f H^\circ(\text{products}) - \sum \nu\,\Delta_f H^\circ(\text{reactants})$.
- Kirchhoff: $\Delta_r H(T_2) = \Delta_r H(T_1) + \Delta_r C_p\,(T_2 - T_1)$.
- Reversible adiabatic perfect gas: $T V^{\gamma - 1}$ and $p V^{\gamma}$ are constant.

## Part 3 — The second law

- Heating: $\Delta S = C\ln\frac{T_f}{T_i}$; phase transition: $\Delta S = \frac{\Delta H}{T}$ (Trouton: about $85\ \mathrm{J\,K^{-1}\,mol^{-1}}$ on vaporisation); isothermal expansion: $\Delta S = nR\ln\frac{V_f}{V_i}$.
- Carnot efficiency: $\eta = 1 - \frac{T_c}{T_h}$.
- Gibbs energy: $\Delta G = \Delta H - T\Delta S$; a reaction becomes spontaneous above or below $T = \frac{\Delta H}{\Delta S}$ depending on the signs.
- Pressure: for a perfect gas $G(p_f) = G(p_i) + nRT\ln\frac{p_f}{p_i}$. Near 0 K, Debye: $S \approx \frac{C_p}{3}$.

## Part 4 — Phases and mixtures

**Phases.** Phase rule: $F = C - P + 2$. Clapeyron: $\frac{dp}{dT} = \frac{\Delta H}{T\Delta V}$; Clausius–Clapeyron: $\ln\frac{p_2}{p_1} = -\frac{\Delta_{\mathrm{vap}}H}{R}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)$.

**Mixtures.**

| Law | Formula |
|---|---|
| Raoult | $p_A = x_A\,p_A^*$ |
| Henry | $p_B = x_B\,K_B$ |
| Freezing depression | $\Delta T = K_f\,b$ |
| Osmotic pressure | $\Pi = [B]RT$ |
| Gibbs energy of mixing | $\Delta_{\mathrm{mix}}G = nRT(x_A\ln x_A + x_B\ln x_B)$ |

For ions: ionic strength $I = \frac12\sum b_i z_i^2$, and Debye–Hückel $\log\gamma_\pm = -A|z_+z_-|\sqrt I$ with $A = 0.509$ in water at 25 °C. The lever rule gives the amounts of two phases from the distances on a tie line.

## Part 5 — Equilibrium and electrochemistry

- $\Delta_r G^\circ = -RT\ln K$, and $\Delta_r G = \Delta_r G^\circ + RT\ln Q$; at equilibrium $Q = K$.
- Van 't Hoff: $\ln\frac{K_2}{K_1} = -\frac{\Delta_r H^\circ}{R}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)$.
- Cells: $\Delta_r G = -\nu F E$; Nernst: $E = E^\circ - \frac{RT}{\nu F}\ln Q$; $\ln K = \frac{\nu F E^\circ}{RT}$.
- Combining half-cells: add the $\Delta G^\circ$, not the potentials: $E^\circ_3 = \frac{\nu_1 E^\circ_1 + \nu_2 E^\circ_2}{\nu_3}$.

Example: $E^\circ = 1.10\ \mathrm{V}$ with $\nu = 2$ gives $\Delta_r G^\circ = -2 \times 96485 \times 1.10 \approx -212\ \mathrm{kJ\,mol^{-1}}$.

## Part 6 — Quantum theory and atoms

- Photons: $E = h\nu = \frac{hc}{\lambda}$; Wien: $\lambda_{\max}T = 2.9 \times 10^{-3}\ \mathrm{m\,K}$; photoelectric effect: $\frac12 m v^2 = h\nu - \Phi$.
- De Broglie: $\lambda = \frac{h}{p}$; uncertainty: $\Delta p\,\Delta x \ge \frac{\hbar}{2}$.
- Particle in a box: $E_n = \frac{n^2h^2}{8mL^2}$. Harmonic oscillator: $E_v = (v + \frac12)\hbar\omega$, zero-point energy $\frac12\hbar\omega$. Rigid rotor: $E_J = hc\tilde B J(J+1)$.
- Hydrogen: $\tilde\nu = R_H\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right)$; an orbital has $n - 1$ nodes, $l$ of them angular.

## Part 7 — Spectroscopy and magnetic resonance

**Spectroscopy.** Beer–Lambert: $A = \varepsilon c l$. Rotational lines are spaced by $2\tilde B$, and $\tilde B = \frac{\hbar}{4\pi c I}$ with $I = \mu R^2$ gives the bond length. A molecule of $N$ atoms has $3N - 6$ normal modes ($3N - 5$ if linear). Doppler and lifetime broadening widen lines: $\delta\tilde\nu \approx \frac{5.3\ \mathrm{cm^{-1}}}{\tau/\mathrm{ps}}$.

**Resonance.** Larmor frequency $\nu_L = \frac{\gamma B_0}{2\pi}$. A chemical shift in hertz is $\delta \times \nu_0 \times 10^{-6}$. $N$ equivalent spin-½ neighbours split a line into $N + 1$ lines (Pascal's triangle). The linewidth is $\Delta\nu_{1/2} = \frac{1}{\pi T_2}$. In EPR, $h\nu = g\mu_B B_0$.

## Part 8 — Statistical thermodynamics

- Boltzmann: $\frac{N_j}{N_i} = \frac{g_j}{g_i}e^{-\Delta\varepsilon/kT}$.
- Partition functions: translation $q = \frac{V}{\Lambda^3}$ with $\Lambda = \frac{h}{\sqrt{2\pi mkT}}$; rotation $q \approx \frac{kT}{\sigma hc\tilde B}$, with symmetry number $\sigma$ (2 for a homonuclear molecule); vibration $q = \frac{1}{1 - e^{-hc\tilde\nu/kT}}$.
- Mean energy: $\langle\varepsilon\rangle = -\frac{\partial\ln q}{\partial\beta}$; a two-level system gives $\frac{\varepsilon}{1 + e^{\beta\varepsilon}}$.
- Residual entropy: $S = k\ln W$, for example $R\ln 2$ per mole for two orientations.

## Part 9 — Kinetics and reaction dynamics

| Order | Integrated law | Half-life |
|---|---|---|
| First | $[A] = [A]_0 e^{-kt}$ | $\frac{\ln 2}{k}$ |
| Second | $\frac{1}{[A]} = \frac{1}{[A]_0} + kt$ | $\frac{1}{k[A]_0}$ |

- Arrhenius: $k = Ae^{-E_a/RT}$, so $\ln\frac{k_2}{k_1} = \frac{E_a}{R}\left(\frac{1}{T_1} - \frac{1}{T_2}\right)$.
- Enzymes: $v = \frac{v_{\max}[S]}{K_M + [S]}$. Quenching: $\frac{\phi_0}{\phi} = 1 + \tau_0 k_q[Q]$. FRET: $E = \frac{R_0^6}{R_0^6 + R^6}$.
- Eyring: $k = \frac{kT}{h}e^{-\Delta^\ddagger G/RT}$. Marcus: $\Delta^\ddagger G = \frac{(\Delta_r G^\circ + \lambda)^2}{4\lambda}$.

Example: $k = 0.0231\ \mathrm{s^{-1}}$ gives $t_{1/2} = \frac{0.693}{0.0231} = 30\ \mathrm{s}$.

## Sources

| Topic | Free reference |
|---|---|
| General chemistry, gases, thermochemistry | [OpenStax, Chemistry 2e](https://openstax.org/details/books/chemistry-2e) |
| Physical chemistry, all parts | [LibreTexts, Physical and Theoretical Chemistry](https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps) |
| Constants | [NIST, CODATA values](https://physics.nist.gov/cuu/Constants/) |
