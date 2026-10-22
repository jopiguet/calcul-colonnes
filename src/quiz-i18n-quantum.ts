/**
 * Texts of the physical chemistry calculations of Focuses 7–8 (quantum theory,
 * atomic structure and spectra), in French, Spanish and English: merged into
 * the tables of quiz-i18n.ts.
 */
type Lang = "fr" | "es" | "en";

export type QuantumPrompt =
  | "photonCount" | "wienPeak" | "photoelectronSpeed" | "deBroglie" | "uncertaintyProton" | "uncertaintyElectron"
  | "boxTransition" | "vibrationWavenumber" | "zeroPointEnergy" | "rotationalFrequency" | "hydrogenLine"
  | "ionizationEnergy" | "orbitalNodes" | "meanRadius" | "mostProbableRadius" | "spinOrbitSplitting";

export type QuantumExplanation =
  | "photonCount" | "wienPeak" | "photoelectronSpeed" | "deBroglie" | "uncertaintySpeed" | "boxTransition"
  | "vibrationWavenumber" | "zeroPointEnergy" | "rotationalFrequency" | "hydrogenLine" | "ionizationEnergy"
  | "orbitalNodes" | "meanRadius" | "mostProbableRadius" | "spinOrbitSplitting";

export type QuantumMistake = "lengthUnits" | "hbarForH" | "reducedMass" | "nodesConfused" | "averagesConfused";

export const QT_GROUP: Record<Lang, string> = { fr: "Quantique et structure", es: "Cuántica y estructura", en: "Quantum and structure" };

export const QT_PROMPTS: Record<Lang, Record<QuantumPrompt, string>> = {
  fr: {
    photonCount: "Nombre de photons émis par une source monochromatique de puissance P pendant Δt (rendement 100 %) :",
    wienPeak: "Longueur d'onde du maximum d'émission d'un corps noir à la température T :",
    photoelectronSpeed: "Vitesse des électrons éjectés du métal par une lumière de longueur d'onde λ :",
    deBroglie: "Longueur d'onde de de Broglie d'électrons accélérés depuis le repos sous la différence de potentiel Δφ :",
    uncertaintyProton: "Incertitude minimale sur la vitesse d'un proton confiné dans une région de largeur Δx :",
    uncertaintyElectron: "Incertitude minimale sur la vitesse d'un électron confiné dans une région de largeur Δx :",
    boxTransition: "Un électron dans une boîte à une dimension de longueur L : longueur d'onde absorbée pour la transition indiquée :",
    vibrationWavenumber: "Nombre d'onde de vibration de la molécule, traitée en oscillateur harmonique :",
    zeroPointEnergy: "Énergie de point zéro de vibration de la molécule, par mole :",
    rotationalFrequency: "Fréquence de la transition de rotation la plus basse de la molécule, en rotateur rigide :",
    hydrogenLine: "Longueur d'onde de la raie émise par cet atome hydrogénoïde :",
    ionizationEnergy: "Énergie nécessaire pour arracher l'électron de cet atome hydrogénoïde depuis le niveau n :",
    orbitalNodes: "Nombre de nœuds radiaux de cette orbitale hydrogénoïde :",
    meanRadius: "Rayon moyen de l'électron 1s de cet atome hydrogénoïde :",
    mostProbableRadius: "Distance la plus probable de l'électron 1s au noyau dans cet atome hydrogénoïde :",
    spinOrbitSplitting: "Écart entre les niveaux $j = l + \\tfrac{1}{2}$ et $j = l - \\tfrac{1}{2}$ d'un électron, pour la constante de couplage spin–orbite donnée :",
  },
  es: {
    photonCount: "Número de fotones emitidos por una fuente monocromática de potencia P durante Δt (rendimiento del 100 %):",
    wienPeak: "Longitud de onda del máximo de emisión de un cuerpo negro a la temperatura T:",
    photoelectronSpeed: "Velocidad de los electrones expulsados del metal por una luz de longitud de onda λ:",
    deBroglie: "Longitud de onda de de Broglie de electrones acelerados desde el reposo con la diferencia de potencial Δφ:",
    uncertaintyProton: "Incertidumbre mínima en la velocidad de un protón confinado en una región de anchura Δx:",
    uncertaintyElectron: "Incertidumbre mínima en la velocidad de un electrón confinado en una región de anchura Δx:",
    boxTransition: "Un electrón en una caja unidimensional de longitud L: longitud de onda absorbida en la transición indicada:",
    vibrationWavenumber: "Número de onda de vibración de la molécula, tratada como oscilador armónico:",
    zeroPointEnergy: "Energía vibracional de punto cero de la molécula, por mol:",
    rotationalFrequency: "Frecuencia de la transición de rotación más baja de la molécula, como rotor rígido:",
    hydrogenLine: "Longitud de onda de la línea emitida por este átomo hidrogenoide:",
    ionizationEnergy: "Energía necesaria para arrancar el electrón de este átomo hidrogenoide desde el nivel n:",
    orbitalNodes: "Número de nodos radiales de este orbital hidrogenoide:",
    meanRadius: "Radio medio del electrón 1s de este átomo hidrogenoide:",
    mostProbableRadius: "Distancia más probable del electrón 1s al núcleo en este átomo hidrogenoide:",
    spinOrbitSplitting: "Separación entre los niveles $j = l + \\tfrac{1}{2}$ y $j = l - \\tfrac{1}{2}$ de un electrón, para la constante de acoplamiento espín–órbita dada:",
  },
  en: {
    photonCount: "Number of photons emitted by a monochromatic source of power P during Δt (100 % efficiency):",
    wienPeak: "Wavelength of maximum emission of a black body at temperature T:",
    photoelectronSpeed: "Speed of the electrons ejected from the metal by light of wavelength λ:",
    deBroglie: "de Broglie wavelength of electrons accelerated from rest through the potential difference Δφ:",
    uncertaintyProton: "Minimum uncertainty in the speed of a proton confined to a region of width Δx:",
    uncertaintyElectron: "Minimum uncertainty in the speed of an electron confined to a region of width Δx:",
    boxTransition: "An electron in a one-dimensional box of length L: wavelength absorbed in the transition shown:",
    vibrationWavenumber: "Vibrational wavenumber of the molecule, treated as a harmonic oscillator:",
    zeroPointEnergy: "Vibrational zero-point energy of the molecule, per mole:",
    rotationalFrequency: "Frequency of the molecule's lowest rotational transition, as a rigid rotor:",
    hydrogenLine: "Wavelength of the line emitted by this hydrogenic atom:",
    ionizationEnergy: "Energy needed to remove the electron of this hydrogenic atom from level n:",
    orbitalNodes: "Number of radial nodes of this hydrogenic orbital:",
    meanRadius: "Mean radius of the 1s electron of this hydrogenic atom:",
    mostProbableRadius: "Most probable distance of the 1s electron from the nucleus in this hydrogenic atom:",
    spinOrbitSplitting: "Gap between the levels $j = l + \\tfrac{1}{2}$ and $j = l - \\tfrac{1}{2}$ of an electron, for the given spin–orbit coupling constant:",
  },
};

export const QT_EXPLANATIONS: Record<Lang, Record<QuantumExplanation, string>> = {
  fr: {
    photonCount: "Chaque photon emporte hν = hc/λ ; la source émet PΔt. La longueur d'onde doit être en mètres.",
    wienPeak: "Loi de Wien : λmax T = c₂/5 = 2,878 mm K. Plus le corps est chaud, plus le maximum est à courte longueur d'onde.",
    photoelectronSpeed: "Le photon cède toute son énergie : Ek = hc/λ − Φ, avec Φ converti en joules (1 eV = 1,602 × 10⁻¹⁹ J), puis v = (2Ek/mₑ)^½.",
    deBroglie: "L'énergie acquise eΔφ devient cinétique : p = (2mₑeΔφ)^½, et λ = h/p.",
    uncertaintySpeed: "Δp Δx ≥ ħ/2 avec ħ = h/2π ; Δv = Δp/m.",
    boxTransition: "Eₙ = n²h²/8mL² : l'écart entre niveaux voisins vaut (2n + 1)h²/8mL², et λ = hc/ΔE.",
    vibrationWavenumber: "La vibration d'une molécule diatomique est celle d'une particule de masse réduite μ : ω = (k/μ)^½, ν̃ = ω/2πc avec c en cm s⁻¹.",
    zeroPointEnergy: "E₀ = ½ħω, avec ω = (k/μ)^½ pour la masse réduite ; fois N_A pour une mole.",
    rotationalFrequency: "E = l(l + 1)ħ²/2I avec I = μR² : la transition 0 → 1 vaut ħ²/I, soit ν = ħ/2πI.",
    hydrogenLine: "ν̃ = Z²R̃(1/n₁² − 1/n₂²), puis λ = 1/ν̃ : 10⁷/ν̃ en nm quand ν̃ est en cm⁻¹.",
    ionizationEnergy: "Eₙ = −hcZ²R̃/n² : il faut fournir hcZ²R̃/n² pour amener l'électron à n = ∞. hcR̃∞ = 13,61 eV.",
    orbitalNodes: "Une orbitale n, l a n − l − 1 nœuds radiaux et l nœuds angulaires, n − 1 en tout.",
    meanRadius: "Pour une orbitale 1s, ⟨r⟩ = 3a₀/2Z, plus grand que le rayon le plus probable a₀/Z : la distribution radiale a une longue queue.",
    mostProbableRadius: "Le maximum de la fonction de distribution radiale P(r) = 4πr²ψ² d'une orbitale 1s est en r* = a₀/Z.",
    spinOrbitSplitting: "E/hc = ½Ã{j(j + 1) − l(l + 1) − s(s + 1)} : entre j = l + ½ et j = l − ½, l'écart vaut Ã(l + ½).",
  },
  es: {
    photonCount: "Cada fotón lleva hν = hc/λ; la fuente emite PΔt. La longitud de onda debe ir en metros.",
    wienPeak: "Ley de Wien: λmax T = c₂/5 = 2,878 mm K. Cuanto más caliente el cuerpo, más corta la longitud de onda del máximo.",
    photoelectronSpeed: "El fotón cede toda su energía: Ek = hc/λ − Φ, con Φ convertida en julios (1 eV = 1,602 × 10⁻¹⁹ J), y luego v = (2Ek/mₑ)^½.",
    deBroglie: "La energía adquirida eΔφ se vuelve cinética: p = (2mₑeΔφ)^½, y λ = h/p.",
    uncertaintySpeed: "Δp Δx ≥ ħ/2 con ħ = h/2π; Δv = Δp/m.",
    boxTransition: "Eₙ = n²h²/8mL²: la separación entre niveles vecinos es (2n + 1)h²/8mL², y λ = hc/ΔE.",
    vibrationWavenumber: "La vibración de una molécula diatómica es la de una partícula de masa reducida μ: ω = (k/μ)^½, ν̃ = ω/2πc con c en cm s⁻¹.",
    zeroPointEnergy: "E₀ = ½ħω, con ω = (k/μ)^½ para la masa reducida; por N_A para un mol.",
    rotationalFrequency: "E = l(l + 1)ħ²/2I con I = μR²: la transición 0 → 1 vale ħ²/I, es decir ν = ħ/2πI.",
    hydrogenLine: "ν̃ = Z²R̃(1/n₁² − 1/n₂²), y λ = 1/ν̃: 10⁷/ν̃ en nm cuando ν̃ está en cm⁻¹.",
    ionizationEnergy: "Eₙ = −hcZ²R̃/n²: hay que aportar hcZ²R̃/n² para llevar el electrón a n = ∞. hcR̃∞ = 13,61 eV.",
    orbitalNodes: "Un orbital n, l tiene n − l − 1 nodos radiales y l nodos angulares, n − 1 en total.",
    meanRadius: "Para un orbital 1s, ⟨r⟩ = 3a₀/2Z, mayor que el radio más probable a₀/Z: la distribución radial tiene una cola larga.",
    mostProbableRadius: "El máximo de la función de distribución radial P(r) = 4πr²ψ² de un orbital 1s está en r* = a₀/Z.",
    spinOrbitSplitting: "E/hc = ½Ã{j(j + 1) − l(l + 1) − s(s + 1)}: entre j = l + ½ y j = l − ½, la separación es Ã(l + ½).",
  },
  en: {
    photonCount: "Each photon carries hν = hc/λ; the source emits PΔt. The wavelength must be in metres.",
    wienPeak: "Wien's law: λmax T = c₂/5 = 2.878 mm K. The hotter the body, the shorter the wavelength of the maximum.",
    photoelectronSpeed: "The photon gives up all its energy: Ek = hc/λ − Φ, with Φ converted to joules (1 eV = 1.602 × 10⁻¹⁹ J), then v = (2Ek/mₑ)^½.",
    deBroglie: "The energy gained, eΔφ, becomes kinetic: p = (2mₑeΔφ)^½, and λ = h/p.",
    uncertaintySpeed: "Δp Δx ≥ ħ/2 with ħ = h/2π; Δv = Δp/m.",
    boxTransition: "Eₙ = n²h²/8mL²: neighbouring levels are (2n + 1)h²/8mL² apart, and λ = hc/ΔE.",
    vibrationWavenumber: "A diatomic molecule vibrates like one particle of reduced mass μ: ω = (k/μ)^½, ν̃ = ω/2πc with c in cm s⁻¹.",
    zeroPointEnergy: "E₀ = ½ħω, with ω = (k/μ)^½ for the reduced mass; times N_A for a mole.",
    rotationalFrequency: "E = l(l + 1)ħ²/2I with I = μR²: the 0 → 1 transition is ħ²/I, so ν = ħ/2πI.",
    hydrogenLine: "ν̃ = Z²R̃(1/n₁² − 1/n₂²), then λ = 1/ν̃: 10⁷/ν̃ in nm when ν̃ is in cm⁻¹.",
    ionizationEnergy: "Eₙ = −hcZ²R̃/n²: hcZ²R̃/n² must be supplied to bring the electron to n = ∞. hcR̃∞ = 13.61 eV.",
    orbitalNodes: "An n, l orbital has n − l − 1 radial nodes and l angular nodes, n − 1 in all.",
    meanRadius: "For a 1s orbital, ⟨r⟩ = 3a₀/2Z, larger than the most probable radius a₀/Z: the radial distribution has a long tail.",
    mostProbableRadius: "The radial distribution function P(r) = 4πr²ψ² of a 1s orbital peaks at r* = a₀/Z.",
    spinOrbitSplitting: "E/hc = ½Ã{j(j + 1) − l(l + 1) − s(s + 1)}: between j = l + ½ and j = l − ½ the gap is Ã(l + ½).",
  },
};

export const QT_SKILLS: Record<Lang, Record<string, string>> = {
  fr: {
    "quantum.photonCount": "Nombre de photons",
    "quantum.wienPeak": "Loi de Wien",
    "quantum.photoelectronSpeed": "Effet photoélectrique",
    "quantum.deBroglie": "Longueur d'onde de de Broglie",
    "quantum.uncertaintySpeed": "Principe d'incertitude",
    "quantum.boxTransition": "Particule dans une boîte",
    "quantum.vibrationWavenumber": "Nombre d'onde de vibration",
    "quantum.zeroPointEnergy": "Énergie de point zéro",
    "quantum.rotationalFrequency": "Transition de rotation",
    "atoms.hydrogenLine": "Raies des atomes hydrogénoïdes",
    "atoms.ionizationEnergy": "Énergie d'ionisation hydrogénoïde",
    "atoms.orbitalNodes": "Nœuds radiaux",
    "atoms.orbitalRadius": "Rayon d'une orbitale 1s",
    "atoms.spinOrbitSplitting": "Couplage spin–orbite",
  },
  es: {
    "quantum.photonCount": "Número de fotones",
    "quantum.wienPeak": "Ley de Wien",
    "quantum.photoelectronSpeed": "Efecto fotoeléctrico",
    "quantum.deBroglie": "Longitud de onda de de Broglie",
    "quantum.uncertaintySpeed": "Principio de incertidumbre",
    "quantum.boxTransition": "Partícula en una caja",
    "quantum.vibrationWavenumber": "Número de onda de vibración",
    "quantum.zeroPointEnergy": "Energía de punto cero",
    "quantum.rotationalFrequency": "Transición de rotación",
    "atoms.hydrogenLine": "Líneas de los átomos hidrogenoides",
    "atoms.ionizationEnergy": "Energía de ionización hidrogenoide",
    "atoms.orbitalNodes": "Nodos radiales",
    "atoms.orbitalRadius": "Radio de un orbital 1s",
    "atoms.spinOrbitSplitting": "Acoplamiento espín–órbita",
  },
  en: {
    "quantum.photonCount": "Number of photons",
    "quantum.wienPeak": "Wien's law",
    "quantum.photoelectronSpeed": "Photoelectric effect",
    "quantum.deBroglie": "de Broglie wavelength",
    "quantum.uncertaintySpeed": "Uncertainty principle",
    "quantum.boxTransition": "Particle in a box",
    "quantum.vibrationWavenumber": "Vibrational wavenumber",
    "quantum.zeroPointEnergy": "Zero-point energy",
    "quantum.rotationalFrequency": "Rotational transition",
    "atoms.hydrogenLine": "Lines of hydrogenic atoms",
    "atoms.ionizationEnergy": "Hydrogenic ionization energy",
    "atoms.orbitalNodes": "Radial nodes",
    "atoms.orbitalRadius": "Radius of a 1s orbital",
    "atoms.spinOrbitSplitting": "Spin–orbit coupling",
  },
};

export const QT_MISTAKES: Record<Lang, Record<QuantumMistake, string>> = {
  fr: {
    lengthUnits: "Nanomètres, picomètres ou centimètres pris pour des mètres",
    hbarForH: "h au lieu de ħ, ou l'inverse : un facteur 2π",
    reducedMass: "Masse totale (ou d'un seul atome) au lieu de la masse réduite",
    nodesConfused: "Nœuds radiaux, angulaires et totaux confondus",
    averagesConfused: "Valeur moyenne et valeur la plus probable confondues",
  },
  es: {
    lengthUnits: "Nanómetros, picómetros o centímetros tomados por metros",
    hbarForH: "h en lugar de ħ, o al revés: un factor 2π",
    reducedMass: "Masa total (o de un solo átomo) en lugar de la masa reducida",
    nodesConfused: "Nodos radiales, angulares y totales confundidos",
    averagesConfused: "Valor medio y valor más probable confundidos",
  },
  en: {
    lengthUnits: "Nanometres, picometres or centimetres used as metres",
    hbarForH: "h for ħ, or the reverse: a factor of 2π",
    reducedMass: "Total mass (or one atom's) used for the reduced mass",
    nodesConfused: "Radial, angular and total nodes confused",
    averagesConfused: "Mean and most probable values confused",
  },
};
