/**
 * Texts of the physical chemistry calculations of Focuses 17–18 (chemical
 * kinetics, reaction dynamics), in French, Spanish and English: merged into
 * the tables of quiz-i18n.ts.
 */
type Lang = "fr" | "es" | "en";

export type KineticsKey =
  | "firstOrderConcentration" | "firstOrderHalfLife" | "secondOrderConcentration" | "secondOrderHalfLife"
  | "arrheniusRatio" | "activationEnergy" | "relaxation" | "michaelisMenten" | "polymerization" | "quantumYield"
  | "fretEfficiency" | "sternVolmer" | "collisionFactor" | "diffusionLimit" | "activationEnthalpy" | "eyringRate"
  | "saltEffect" | "isotopeEffect" | "marcusBarrier";

export type KineticsMistake = "orderConfused" | "halfLifeForTau" | "timeUnits" | "distancePower";

export const KN_GROUP: Record<Lang, string> = { fr: "Cinétique", es: "Cinética", en: "Kinetics" };

export const KN_PROMPTS: Record<Lang, Record<KineticsKey, string>> = {
  fr: {
    firstOrderConcentration: "Réaction du premier ordre A → P : concentration de A au temps t.",
    firstOrderHalfLife: "Demi-vie d'une réaction du premier ordre, de constante de vitesse donnée :",
    secondOrderConcentration: "Réaction du second ordre, d[A]/dt = −k[A]² : concentration de A au temps t.",
    secondOrderHalfLife: "Demi-vie de A dans une réaction du second ordre, d[A]/dt = −k[A]² :",
    arrheniusRatio: "Par quel facteur la constante de vitesse est-elle multipliée entre les deux températures ?",
    activationEnergy: "Énergie d'activation tirée des constantes de vitesse mesurées à deux températures :",
    relaxation: "Après un saut de température, l'équilibre A ⇌ B (premier ordre dans les deux sens) relaxe avec le temps τ. Constante de vitesse directe :",
    michaelisMenten: "Vitesse initiale d'une réaction enzymatique de Michaelis–Menten :",
    polymerization: "Polymérisation par étapes : nombre moyen de monomères par chaîne quand une fraction p des groupes a réagi.",
    quantumYield: "Une substance est éclairée par un laser ; une fraction f de la lumière est absorbée et n mol de la substance se décomposent. Rendement quantique :",
    fretEfficiency: "Efficacité du transfert d'énergie par résonance (Förster) à la distance R :",
    sternVolmer: "Durée de vie de fluorescence sans désactivateur (τ₀) et avec (τ) : constante de vitesse de désactivation.",
    collisionFactor: "Facteur de fréquence de la théorie des collisions pour la réaction de ces deux gaz :",
    diffusionLimit: "Constante de vitesse d'une réaction contrôlée par la diffusion dans un solvant de viscosité η :",
    activationEnthalpy: "Enthalpie d'activation d'une réaction en solution d'énergie d'activation Eₐ :",
    eyringRate: "Constante de vitesse d'une réaction du premier ordre, par l'équation d'Eyring :",
    saltEffect: "Effet de sel cinétique dans l'eau à 25 °C (A = 0,509) : constante de vitesse à la force ionique I.",
    isotopeEffect: "Effet isotopique cinétique primaire quand la liaison C–H se rompt dans l'étape déterminante :",
    marcusBarrier: "Théorie de Marcus : enthalpie libre d'activation du transfert d'électron.",
  },
  es: {
    firstOrderConcentration: "Reacción de primer orden A → P: concentración de A en el instante t.",
    firstOrderHalfLife: "Vida media de una reacción de primer orden, con la constante de velocidad dada:",
    secondOrderConcentration: "Reacción de segundo orden, d[A]/dt = −k[A]²: concentración de A en el instante t.",
    secondOrderHalfLife: "Vida media de A en una reacción de segundo orden, d[A]/dt = −k[A]²:",
    arrheniusRatio: "¿Por qué factor se multiplica la constante de velocidad entre las dos temperaturas?",
    activationEnergy: "Energía de activación a partir de las constantes de velocidad medidas a dos temperaturas:",
    relaxation: "Tras un salto de temperatura, el equilibrio A ⇌ B (primer orden en ambos sentidos) se relaja con el tiempo τ. Constante de velocidad directa:",
    michaelisMenten: "Velocidad inicial de una reacción enzimática de Michaelis–Menten:",
    polymerization: "Polimerización por etapas: número medio de monómeros por cadena cuando ha reaccionado una fracción p de los grupos.",
    quantumYield: "Una sustancia se ilumina con un láser; se absorbe una fracción f de la luz y se descomponen n mol de la sustancia. Rendimiento cuántico:",
    fretEfficiency: "Eficiencia de la transferencia de energía por resonancia (Förster) a la distancia R:",
    sternVolmer: "Vida de fluorescencia sin desactivador (τ₀) y con él (τ): constante de velocidad de desactivación.",
    collisionFactor: "Factor de frecuencia de la teoría de colisiones para la reacción de estos dos gases:",
    diffusionLimit: "Constante de velocidad de una reacción controlada por difusión en un disolvente de viscosidad η:",
    activationEnthalpy: "Entalpía de activación de una reacción en disolución con energía de activación Eₐ:",
    eyringRate: "Constante de velocidad de una reacción de primer orden, por la ecuación de Eyring:",
    saltEffect: "Efecto salino cinético en agua a 25 °C (A = 0,509): constante de velocidad a la fuerza iónica I.",
    isotopeEffect: "Efecto isotópico cinético primario cuando el enlace C–H se rompe en la etapa determinante:",
    marcusBarrier: "Teoría de Marcus: energía de Gibbs de activación de la transferencia electrónica.",
  },
  en: {
    firstOrderConcentration: "First-order reaction A → P: the concentration of A at time t.",
    firstOrderHalfLife: "Half-life of a first-order reaction with the rate constant given:",
    secondOrderConcentration: "Second-order reaction, d[A]/dt = −k[A]²: the concentration of A at time t.",
    secondOrderHalfLife: "Half-life of A in a second-order reaction, d[A]/dt = −k[A]²:",
    arrheniusRatio: "By what factor is the rate constant multiplied between the two temperatures?",
    activationEnergy: "Activation energy from rate constants measured at two temperatures:",
    relaxation: "After a temperature jump, the equilibrium A ⇌ B (first order both ways) relaxes with time constant τ. Forward rate constant:",
    michaelisMenten: "Initial rate of a Michaelis–Menten enzyme reaction:",
    polymerization: "Stepwise polymerization: average number of monomers per chain when a fraction p of the groups has reacted.",
    quantumYield: "A substance is irradiated by a laser; a fraction f of the light is absorbed and n mol of the substance decompose. Quantum yield:",
    fretEfficiency: "Efficiency of resonance energy transfer (Förster) at distance R:",
    sternVolmer: "Fluorescence lifetime without quencher (τ₀) and with it (τ): the quenching rate constant.",
    collisionFactor: "Collision-theory frequency factor for the reaction of these two gases:",
    diffusionLimit: "Rate constant of a diffusion-controlled reaction in a solvent of viscosity η:",
    activationEnthalpy: "Enthalpy of activation of a reaction in solution with activation energy Eₐ:",
    eyringRate: "Rate constant of a first-order reaction, from the Eyring equation:",
    saltEffect: "Kinetic salt effect in water at 25 °C (A = 0.509): the rate constant at ionic strength I.",
    isotopeEffect: "Primary kinetic isotope effect when the C–H bond breaks in the rate-determining step:",
    marcusBarrier: "Marcus theory: the Gibbs energy of activation of the electron transfer.",
  },
};

export const KN_EXPLANATIONS: Record<Lang, Record<KineticsKey, string>> = {
  fr: {
    firstOrderConcentration: "ln([A]/[A]₀) = −kt : la concentration décroît exponentiellement, avec e, pas 10.",
    firstOrderHalfLife: "t½ = ln 2/k, à ne pas confondre avec la constante de temps τ = 1/k. Puis convertir les secondes en minutes.",
    secondOrderConcentration: "1/[A] − 1/[A]₀ = kt : c'est 1/[A] qui croît linéairement.",
    secondOrderHalfLife: "Au second ordre, t½ = 1/(k[A]₀) dépend de la concentration initiale.",
    arrheniusRatio: "ln(k₂/k₁) = (Eₐ/R)(1/T₁ − 1/T₂), avec les températures en kelvins et Eₐ en J mol⁻¹.",
    activationEnergy: "Eₐ = R ln(k₂/k₁)/(1/T₁ − 1/T₂), en kelvins et avec le logarithme népérien.",
    relaxation: "1/τ = k + k′ et K = k/k′ : deux équations pour deux inconnues, d'où k = K/{(1 + K)τ}.",
    michaelisMenten: "v = vmax[S]₀/(KM + [S]₀) : proportionnelle à [S]₀ quand elle est faible, vers vmax quand elle est grande.",
    polymerization: "Il reste (1 − p)[A]₀ groupes terminaux, un par chaîne : ⟨N⟩ = 1/(1 − p).",
    quantumYield: "Les photons absorbés : f·Pt/(hc/λ), en moles en divisant par NA ; le rendement est le rapport des moles décomposées aux moles de photons absorbés.",
    fretEfficiency: "Förster : η = R₀⁶/(R₀⁶ + R⁶), une moitié à R = R₀ et une chute très rapide au-delà.",
    sternVolmer: "1/τ = 1/τ₀ + kQ[Q] : la désactivation ajoute une voie de désexcitation en parallèle ; les durées en secondes.",
    collisionFactor: "A = σ(8kT/πμ)^½ NA, avec μ la masse réduite en kg et σ en m², puis 10³ dm³ par m³.",
    diffusionLimit: "kd = 8RT/3η, avec η en Pa s (1 mPa s = 10⁻³ Pa s) ; le résultat sort en m³ mol⁻¹ s⁻¹.",
    activationEnthalpy: "Pour une réaction en solution, Δ‡H = Eₐ − RT (Eₐ − 2RT pour une réaction bimoléculaire en phase gazeuse).",
    eyringRate: "k = κ(kT/h) e^(−Δ‡G/RT) : kT/h vaut environ 6 × 10¹² s⁻¹ à température ambiante.",
    saltEffect: "log k = log k° + 2A·zA·zB I^½ : des ions de même signe accélèrent avec la force ionique, de signes opposés ralentissent.",
    isotopeEffect: "La liaison C–D a une énergie de point zéro plus basse : la barrière est plus haute de ½ħω(1 − (μ(C–H)/μ(C–D))^½).",
    marcusBarrier: "Δ‡G = (ΔrG° + ΔER)²/4ΔER : nulle quand −ΔrG° = ΔER ; au-delà, la région inversée.",
  },
  es: {
    firstOrderConcentration: "ln([A]/[A]₀) = −kt: la concentración decae exponencialmente, con e, no con 10.",
    firstOrderHalfLife: "t½ = ln 2/k, que no hay que confundir con la constante de tiempo τ = 1/k. Luego convertir los segundos en minutos.",
    secondOrderConcentration: "1/[A] − 1/[A]₀ = kt: es 1/[A] lo que crece linealmente.",
    secondOrderHalfLife: "En segundo orden, t½ = 1/(k[A]₀) depende de la concentración inicial.",
    arrheniusRatio: "ln(k₂/k₁) = (Eₐ/R)(1/T₁ − 1/T₂), con las temperaturas en kelvin y Eₐ en J mol⁻¹.",
    activationEnergy: "Eₐ = R ln(k₂/k₁)/(1/T₁ − 1/T₂), en kelvin y con el logaritmo neperiano.",
    relaxation: "1/τ = k + k′ y K = k/k′: dos ecuaciones para dos incógnitas, y así k = K/{(1 + K)τ}.",
    michaelisMenten: "v = vmax[S]₀/(KM + [S]₀): proporcional a [S]₀ cuando es baja, hacia vmax cuando es alta.",
    polymerization: "Quedan (1 − p)[A]₀ grupos terminales, uno por cadena: ⟨N⟩ = 1/(1 − p).",
    quantumYield: "Los fotones absorbidos: f·Pt/(hc/λ), en moles dividiendo por NA; el rendimiento es la razón entre los moles descompuestos y los moles de fotones absorbidos.",
    fretEfficiency: "Förster: η = R₀⁶/(R₀⁶ + R⁶), la mitad en R = R₀ y una caída muy rápida más allá.",
    sternVolmer: "1/τ = 1/τ₀ + kQ[Q]: la desactivación añade una vía de desexcitación en paralelo; los tiempos en segundos.",
    collisionFactor: "A = σ(8kT/πμ)^½ NA, con μ la masa reducida en kg y σ en m², y luego 10³ dm³ por m³.",
    diffusionLimit: "kd = 8RT/3η, con η en Pa s (1 mPa s = 10⁻³ Pa s); el resultado sale en m³ mol⁻¹ s⁻¹.",
    activationEnthalpy: "Para una reacción en disolución, Δ‡H = Eₐ − RT (Eₐ − 2RT para una reacción bimolecular en fase gaseosa).",
    eyringRate: "k = κ(kT/h) e^(−Δ‡G/RT): kT/h vale unos 6 × 10¹² s⁻¹ a temperatura ambiente.",
    saltEffect: "log k = log k° + 2A·zA·zB I^½: iones del mismo signo se aceleran con la fuerza iónica, de signo opuesto se frenan.",
    isotopeEffect: "El enlace C–D tiene menor energía de punto cero: la barrera es más alta en ½ħω(1 − (μ(C–H)/μ(C–D))^½).",
    marcusBarrier: "Δ‡G = (ΔrG° + ΔER)²/4ΔER: nula cuando −ΔrG° = ΔER; más allá, la región invertida.",
  },
  en: {
    firstOrderConcentration: "ln([A]/[A]₀) = −kt: the concentration decays exponentially, with e, not 10.",
    firstOrderHalfLife: "t½ = ln 2/k, not to be confused with the time constant τ = 1/k. Then convert seconds to minutes.",
    secondOrderConcentration: "1/[A] − 1/[A]₀ = kt: it is 1/[A] that grows linearly.",
    secondOrderHalfLife: "At second order, t½ = 1/(k[A]₀) depends on the initial concentration.",
    arrheniusRatio: "ln(k₂/k₁) = (Eₐ/R)(1/T₁ − 1/T₂), with temperatures in kelvins and Eₐ in J mol⁻¹.",
    activationEnergy: "Eₐ = R ln(k₂/k₁)/(1/T₁ − 1/T₂), in kelvins and with the natural logarithm.",
    relaxation: "1/τ = k + k′ and K = k/k′: two equations for two unknowns, so k = K/{(1 + K)τ}.",
    michaelisMenten: "v = vmax[S]₀/(KM + [S]₀): proportional to [S]₀ when it is low, towards vmax when it is high.",
    polymerization: "(1 − p)[A]₀ end groups remain, one per chain: ⟨N⟩ = 1/(1 − p).",
    quantumYield: "Photons absorbed: f·Pt/(hc/λ), in moles after dividing by NA; the yield is the ratio of moles decomposed to moles of photons absorbed.",
    fretEfficiency: "Förster: η = R₀⁶/(R₀⁶ + R⁶), one half at R = R₀ and a very steep fall beyond.",
    sternVolmer: "1/τ = 1/τ₀ + kQ[Q]: quenching adds a decay channel in parallel; lifetimes in seconds.",
    collisionFactor: "A = σ(8kT/πμ)^½ NA, with μ the reduced mass in kg and σ in m², then 10³ dm³ per m³.",
    diffusionLimit: "kd = 8RT/3η, with η in Pa s (1 mPa s = 10⁻³ Pa s); the result comes out in m³ mol⁻¹ s⁻¹.",
    activationEnthalpy: "For a reaction in solution, Δ‡H = Eₐ − RT (Eₐ − 2RT for a bimolecular gas-phase reaction).",
    eyringRate: "k = κ(kT/h) e^(−Δ‡G/RT): kT/h is about 6 × 10¹² s⁻¹ at room temperature.",
    saltEffect: "log k = log k° + 2A·zA·zB I^½: ions of the same sign speed up with ionic strength, of opposite signs slow down.",
    isotopeEffect: "The C–D bond has a lower zero-point energy: the barrier is higher by ½ħω(1 − (μ(C–H)/μ(C–D))^½).",
    marcusBarrier: "Δ‡G = (ΔrG° + ΔER)²/4ΔER: zero when −ΔrG° = ΔER; beyond that, the inverted region.",
  },
};

const SKILLS: Record<KineticsKey, [string, string, string]> = {
  firstOrderConcentration: ["Loi intégrée du premier ordre", "Ley integrada de primer orden", "First-order integrated law"],
  firstOrderHalfLife: ["Demi-vie du premier ordre", "Vida media de primer orden", "First-order half-life"],
  secondOrderConcentration: ["Loi intégrée du second ordre", "Ley integrada de segundo orden", "Second-order integrated law"],
  secondOrderHalfLife: ["Demi-vie du second ordre", "Vida media de segundo orden", "Second-order half-life"],
  arrheniusRatio: ["Arrhenius : effet de la température", "Arrhenius: efecto de la temperatura", "Arrhenius: effect of temperature"],
  activationEnergy: ["Énergie d'activation", "Energía de activación", "Activation energy"],
  relaxation: ["Relaxation après un saut de température", "Relajación tras un salto de temperatura", "Relaxation after a temperature jump"],
  michaelisMenten: ["Michaelis–Menten", "Michaelis–Menten", "Michaelis–Menten"],
  polymerization: ["Degré de polymérisation", "Grado de polimerización", "Degree of polymerization"],
  quantumYield: ["Rendement quantique", "Rendimiento cuántico", "Quantum yield"],
  fretEfficiency: ["Transfert d'énergie (FRET)", "Transferencia de energía (FRET)", "Energy transfer (FRET)"],
  sternVolmer: ["Stern–Volmer", "Stern–Volmer", "Stern–Volmer"],
  collisionFactor: ["Théorie des collisions", "Teoría de colisiones", "Collision theory"],
  diffusionLimit: ["Limite de diffusion", "Límite de difusión", "Diffusion limit"],
  activationEnthalpy: ["Enthalpie d'activation", "Entalpía de activación", "Enthalpy of activation"],
  eyringRate: ["Équation d'Eyring", "Ecuación de Eyring", "Eyring equation"],
  saltEffect: ["Effet de sel cinétique", "Efecto salino cinético", "Kinetic salt effect"],
  isotopeEffect: ["Effet isotopique cinétique", "Efecto isotópico cinético", "Kinetic isotope effect"],
  marcusBarrier: ["Théorie de Marcus", "Teoría de Marcus", "Marcus theory"],
};
const DYNAMICS = new Set<KineticsKey>(["collisionFactor", "diffusionLimit", "activationEnthalpy", "eyringRate", "saltEffect", "isotopeEffect", "marcusBarrier"]);
const skills = (i: 0 | 1 | 2): Record<string, string> =>
  Object.fromEntries(Object.entries(SKILLS).map(([k, names]) => [`${DYNAMICS.has(k as KineticsKey) ? "dynamics" : "kinetics"}.${k}`, names[i]]));
export const KN_SKILLS: Record<Lang, Record<string, string>> = { fr: skills(0), es: skills(1), en: skills(2) };

export const KN_MISTAKES: Record<Lang, Record<KineticsMistake, string>> = {
  fr: {
    orderConfused: "La loi d'un autre ordre de réaction",
    halfLifeForTau: "Demi-vie et constante de temps confondues : un facteur ln 2",
    timeUnits: "Secondes, minutes ou heures non converties",
    distancePower: "Mauvaise puissance de la distance",
  },
  es: {
    orderConfused: "La ley de otro orden de reacción",
    halfLifeForTau: "Vida media y constante de tiempo confundidas: un factor ln 2",
    timeUnits: "Segundos, minutos u horas sin convertir",
    distancePower: "Potencia equivocada de la distancia",
  },
  en: {
    orderConfused: "The law of another reaction order",
    halfLifeForTau: "Half-life and time constant confused: a factor of ln 2",
    timeUnits: "Seconds, minutes or hours not converted",
    distancePower: "Wrong power of the distance",
  },
};

