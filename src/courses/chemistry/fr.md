# Chimie physique — l'essentiel du test

## Comment utiliser ce cours

Ce cours accompagne le test de chimie physique. Chaque partie donne les équations utilisées par le test, les unités à surveiller et un exemple résolu. Chaque question est un calcul : choisissez la formule, convertissez en unités SI, puis calculez.

| Niveau | Ce qu'il demande |
|---|---|
| Débutant | Une formule, des valeurs données : gaz parfait, cinétique d'ordre 1, Beer–Lambert, énergie d'un photon |
| Intermédiaire | Le cœur d'un premier cours : thermodynamique, équilibre, bases quantiques, cinétique |
| Avancé | Gaz réels, mélanges, électrochimie, spectroscopie, thermodynamique statistique |
| Expert | Deux étapes ou plus : Debye–Hückel, théorie de Marcus, fonctions de partition, relaxation RMN |

Gardez les températures en kelvins, les pressions en pascals avec $R = 8.314\ \mathrm{J\,K^{-1}\,mol^{-1}}$, et les énergies par mole sauf si la question dit par molécule.

## Partie 1 — Les gaz

- Gaz parfait : $pV = nRT$. Pression partielle : $p_J = x_J\,p$ (Dalton).
- Théorie cinétique : $v_{\mathrm{rms}} = \sqrt{\frac{3RT}{M}}$ avec $M$ en kg par mol ; les vitesses varient comme $\sqrt{T/M}$.
- Libre parcours moyen : $\lambda = \frac{kT}{\sigma p}$.
- Gaz réels : facteur de compression $Z = \frac{pV_m}{RT}$ ; van der Waals : $p = \frac{RT}{V_m - b} - \frac{a}{V_m^2}$, température critique $T_c = \frac{8a}{27Rb}$.

Exemple : 1.00 mol à 298 K dans 24.8 L donne $p = \frac{8.314 \times 298}{0.0248} \approx 1.00 \times 10^5\ \mathrm{Pa}$.

## Partie 2 — Le premier principe

$\Delta U = q + w$. Détente contre une pression extérieure constante : $w = -p_{\mathrm{ex}}\Delta V$ ; détente isotherme réversible d'un gaz parfait : $w = -nRT\ln\frac{V_f}{V_i}$.

- Enthalpie : $H = U + pV$, et $\Delta H = \Delta U + \Delta n_{\mathrm{gas}}RT$ pour une réaction.
- Loi de Hess : les enthalpies de réaction s'additionnent comme les équations ; $\Delta_r H^\circ = \sum \nu\,\Delta_f H^\circ(\text{produits}) - \sum \nu\,\Delta_f H^\circ(\text{réactifs})$.
- Kirchhoff : $\Delta_r H(T_2) = \Delta_r H(T_1) + \Delta_r C_p\,(T_2 - T_1)$.
- Gaz parfait, adiabatique réversible : $T V^{\gamma - 1}$ et $p V^{\gamma}$ sont constants.

## Partie 3 — Le second principe

- Chauffage : $\Delta S = C\ln\frac{T_f}{T_i}$ ; changement de phase : $\Delta S = \frac{\Delta H}{T}$ (Trouton : environ $85\ \mathrm{J\,K^{-1}\,mol^{-1}}$ à la vaporisation) ; détente isotherme : $\Delta S = nR\ln\frac{V_f}{V_i}$.
- Rendement de Carnot : $\eta = 1 - \frac{T_c}{T_h}$.
- Énergie de Gibbs : $\Delta G = \Delta H - T\Delta S$ ; une réaction devient spontanée au-dessus ou en dessous de $T = \frac{\Delta H}{\Delta S}$ selon les signes.
- Pression : pour un gaz parfait $G(p_f) = G(p_i) + nRT\ln\frac{p_f}{p_i}$. Près de 0 K, Debye : $S \approx \frac{C_p}{3}$.

## Partie 4 — Phases et mélanges

**Phases.** Règle des phases : $F = C - P + 2$. Clapeyron : $\frac{dp}{dT} = \frac{\Delta H}{T\Delta V}$ ; Clausius–Clapeyron : $\ln\frac{p_2}{p_1} = -\frac{\Delta_{\mathrm{vap}}H}{R}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)$.

**Mélanges.**

| Loi | Formule |
|---|---|
| Raoult | $p_A = x_A\,p_A^*$ |
| Henry | $p_B = x_B\,K_B$ |
| Abaissement cryoscopique | $\Delta T = K_f\,b$ |
| Pression osmotique | $\Pi = [B]RT$ |
| Énergie de Gibbs de mélange | $\Delta_{\mathrm{mix}}G = nRT(x_A\ln x_A + x_B\ln x_B)$ |

Pour les ions : force ionique $I = \frac12\sum b_i z_i^2$, et Debye–Hückel $\log\gamma_\pm = -A|z_+z_-|\sqrt I$ avec $A = 0.509$ dans l'eau à 25 °C. La règle des moments donne les quantités de deux phases à partir des distances sur une conode.

## Partie 5 — Équilibre et électrochimie

- $\Delta_r G^\circ = -RT\ln K$, et $\Delta_r G = \Delta_r G^\circ + RT\ln Q$ ; à l'équilibre $Q = K$.
- Van 't Hoff : $\ln\frac{K_2}{K_1} = -\frac{\Delta_r H^\circ}{R}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)$.
- Piles : $\Delta_r G = -\nu F E$ ; Nernst : $E = E^\circ - \frac{RT}{\nu F}\ln Q$ ; $\ln K = \frac{\nu F E^\circ}{RT}$.
- Combiner des demi-piles : additionnez les $\Delta G^\circ$, pas les potentiels : $E^\circ_3 = \frac{\nu_1 E^\circ_1 + \nu_2 E^\circ_2}{\nu_3}$.

Exemple : $E^\circ = 1.10\ \mathrm{V}$ avec $\nu = 2$ donne $\Delta_r G^\circ = -2 \times 96485 \times 1.10 \approx -212\ \mathrm{kJ\,mol^{-1}}$.

## Partie 6 — Théorie quantique et atomes

- Photons : $E = h\nu = \frac{hc}{\lambda}$ ; Wien : $\lambda_{\max}T = 2.9 \times 10^{-3}\ \mathrm{m\,K}$ ; effet photoélectrique : $\frac12 m v^2 = h\nu - \Phi$.
- De Broglie : $\lambda = \frac{h}{p}$ ; incertitude : $\Delta p\,\Delta x \ge \frac{\hbar}{2}$.
- Particule dans une boîte : $E_n = \frac{n^2h^2}{8mL^2}$. Oscillateur harmonique : $E_v = (v + \frac12)\hbar\omega$, énergie de point zéro $\frac12\hbar\omega$. Rotateur rigide : $E_J = hc\tilde B J(J+1)$.
- Hydrogène : $\tilde\nu = R_H\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right)$ ; une orbitale a $n - 1$ nœuds, dont $l$ angulaires.

## Partie 7 — Spectroscopie et résonance magnétique

**Spectroscopie.** Beer–Lambert : $A = \varepsilon c l$. Les raies de rotation sont espacées de $2\tilde B$, et $\tilde B = \frac{\hbar}{4\pi c I}$ avec $I = \mu R^2$ donne la longueur de liaison. Une molécule de $N$ atomes a $3N - 6$ modes normaux ($3N - 5$ si elle est linéaire). Les élargissements Doppler et de durée de vie élargissent les raies : $\delta\tilde\nu \approx \frac{5.3\ \mathrm{cm^{-1}}}{\tau/\mathrm{ps}}$.

**Résonance.** Fréquence de Larmor $\nu_L = \frac{\gamma B_0}{2\pi}$. Un déplacement chimique en hertz vaut $\delta \times \nu_0 \times 10^{-6}$. $N$ voisins équivalents de spin ½ divisent une raie en $N + 1$ raies (triangle de Pascal). La largeur de raie est $\Delta\nu_{1/2} = \frac{1}{\pi T_2}$. En RPE, $h\nu = g\mu_B B_0$.

## Partie 8 — Thermodynamique statistique

- Boltzmann : $\frac{N_j}{N_i} = \frac{g_j}{g_i}e^{-\Delta\varepsilon/kT}$.
- Fonctions de partition : translation $q = \frac{V}{\Lambda^3}$ avec $\Lambda = \frac{h}{\sqrt{2\pi mkT}}$ ; rotation $q \approx \frac{kT}{\sigma hc\tilde B}$, avec le nombre de symétrie $\sigma$ (2 pour une molécule homonucléaire) ; vibration $q = \frac{1}{1 - e^{-hc\tilde\nu/kT}}$.
- Énergie moyenne : $\langle\varepsilon\rangle = -\frac{\partial\ln q}{\partial\beta}$ ; un système à deux niveaux donne $\frac{\varepsilon}{1 + e^{\beta\varepsilon}}$.
- Entropie résiduelle : $S = k\ln W$, par exemple $R\ln 2$ par mole pour deux orientations.

## Partie 9 — Cinétique et dynamique des réactions

| Ordre | Loi intégrée | Demi-vie |
|---|---|---|
| Premier | $[A] = [A]_0 e^{-kt}$ | $\frac{\ln 2}{k}$ |
| Second | $\frac{1}{[A]} = \frac{1}{[A]_0} + kt$ | $\frac{1}{k[A]_0}$ |

- Arrhenius : $k = Ae^{-E_a/RT}$, donc $\ln\frac{k_2}{k_1} = \frac{E_a}{R}\left(\frac{1}{T_1} - \frac{1}{T_2}\right)$.
- Enzymes : $v = \frac{v_{\max}[S]}{K_M + [S]}$. Extinction : $\frac{\phi_0}{\phi} = 1 + \tau_0 k_q[Q]$. FRET : $E = \frac{R_0^6}{R_0^6 + R^6}$.
- Eyring : $k = \frac{kT}{h}e^{-\Delta^\ddagger G/RT}$. Marcus : $\Delta^\ddagger G = \frac{(\Delta_r G^\circ + \lambda)^2}{4\lambda}$.

Exemple : $k = 0.0231\ \mathrm{s^{-1}}$ donne $t_{1/2} = \frac{0.693}{0.0231} = 30\ \mathrm{s}$.

## Sources

| Thème | Référence gratuite |
|---|---|
| Chimie générale, gaz, thermochimie | [OpenStax, Chemistry 2e](https://openstax.org/details/books/chemistry-2e) |
| Chimie physique, toutes les parties | [LibreTexts, Physical and Theoretical Chemistry](https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps) |
| Constantes | [NIST, valeurs CODATA](https://physics.nist.gov/cuu/Constants/) |
