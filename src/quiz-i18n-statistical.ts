/**
 * Texts of the physical chemistry calculations of Focus 13 (statistical
 * thermodynamics), in French, Spanish and English: merged into the tables of
 * quiz-i18n.ts.
 */
type Lang = "fr" | "es" | "en";

export type StatisticalKey =
  | "boltzmannRatio" | "populationTemperature" | "thermalWavelength" | "translationalPartition" | "rotationalPartition"
  | "symmetryNumber" | "vibrationalPartition" | "electronicPartition" | "meanVibrationalEnergy" | "twoLevelEnergy"
  | "vibrationalHeatCapacity" | "sackurTetrode" | "residualEntropy";

export type StatisticalMistake = "degeneracyIgnored" | "symmetryIgnored" | "rotationsMiscounted" | "zeroPointConfused" | "classicalLimit";

export const ST_GROUP: Record<Lang, string> = { fr: "Thermodynamique statistique", es: "Termodinámica estadística", en: "Statistical thermodynamics" };

export const ST_PROMPTS: Record<Lang, Record<StatisticalKey, string>> = {
  fr: {
    boltzmannRatio: "Rapport des populations de deux niveaux dégénérés à l'équilibre thermique :",
    populationTemperature: "Température à laquelle ce système à deux niveaux non dégénérés a ce rapport de populations :",
    thermalWavelength: "Longueur d'onde thermique de ce gaz :",
    translationalPartition: "Fonction de partition de translation d'une molécule de ce gaz dans ce récipient :",
    rotationalPartition: "Fonction de partition de rotation de cette molécule linéaire, à haute température :",
    symmetryNumber: "Nombre de symétrie de cette molécule :",
    vibrationalPartition: "Fonction de partition de vibration de cet oscillateur harmonique, énergies comptées depuis le niveau de point zéro :",
    electronicPartition: "Fonction de partition électronique de cet atome à deux niveaux :",
    meanVibrationalEnergy: "Énergie de vibration moyenne au-dessus du niveau de point zéro, en nombre d'onde :",
    twoLevelEnergy: "Énergie moyenne d'un système à deux niveaux non dégénérés, en nombre d'onde :",
    vibrationalHeatCapacity: "Contribution de la vibration à la capacité calorifique molaire de ce gaz :",
    sackurTetrode: "Entropie molaire standard de ce gaz parfait monoatomique (équation de Sackur–Tetrode) :",
    residualEntropy: "Entropie molaire résiduelle de ce solide, chaque molécule ayant W orientations équiprobables :",
  },
  es: {
    boltzmannRatio: "Razón de las poblaciones de dos niveles degenerados en equilibrio térmico:",
    populationTemperature: "Temperatura a la que este sistema de dos niveles no degenerados tiene esta razón de poblaciones:",
    thermalWavelength: "Longitud de onda térmica de este gas:",
    translationalPartition: "Función de partición de traslación de una molécula de este gas en este recipiente:",
    rotationalPartition: "Función de partición rotacional de esta molécula lineal, a alta temperatura:",
    symmetryNumber: "Número de simetría de esta molécula:",
    vibrationalPartition: "Función de partición vibracional de este oscilador armónico, con las energías medidas desde el nivel de punto cero:",
    electronicPartition: "Función de partición electrónica de este átomo de dos niveles:",
    meanVibrationalEnergy: "Energía vibracional media por encima del nivel de punto cero, como número de onda:",
    twoLevelEnergy: "Energía media de un sistema de dos niveles no degenerados, como número de onda:",
    vibrationalHeatCapacity: "Contribución de la vibración a la capacidad calorífica molar de este gas:",
    sackurTetrode: "Entropía molar estándar de este gas perfecto monoatómico (ecuación de Sackur–Tetrode):",
    residualEntropy: "Entropía molar residual de este sólido, con W orientaciones equiprobables por molécula:",
  },
  en: {
    boltzmannRatio: "Ratio of the populations of two degenerate levels at thermal equilibrium:",
    populationTemperature: "Temperature at which this two-level system, non-degenerate, has this population ratio:",
    thermalWavelength: "Thermal wavelength of this gas:",
    translationalPartition: "Translational partition function of one molecule of this gas in this vessel:",
    rotationalPartition: "Rotational partition function of this linear molecule, at high temperature:",
    symmetryNumber: "Symmetry number of this molecule:",
    vibrationalPartition: "Vibrational partition function of this harmonic oscillator, energies measured from the zero-point level:",
    electronicPartition: "Electronic partition function of this two-level atom:",
    meanVibrationalEnergy: "Mean vibrational energy above the zero-point level, as a wavenumber:",
    twoLevelEnergy: "Mean energy of a non-degenerate two-level system, as a wavenumber:",
    vibrationalHeatCapacity: "Vibrational contribution to the molar heat capacity of this gas:",
    sackurTetrode: "Standard molar entropy of this monatomic perfect gas (Sackur–Tetrode equation):",
    residualEntropy: "Residual molar entropy of this solid, each molecule having W equally likely orientations:",
  },
};

export const ST_EXPLANATIONS: Record<Lang, Record<StatisticalKey, string>> = {
  fr: {
    boltzmannRatio: "La distribution de Boltzmann vaut par état : un niveau compte autant de fois qu'il a d'états. T en kelvins.",
    populationTemperature: "On prend le logarithme naturel du rapport ; hc/k = 1,4388 cm K.",
    thermalWavelength: "La masse est celle d'une molécule, en kg, et T en kelvins.",
    translationalPartition: "q = V/Λ³, avec V en m³ et Λ en m : un nombre énorme d'états accessibles.",
    rotationalPartition: "σ vaut 2 pour une molécule linéaire symétrique (N₂, CO₂), 1 sinon ; T en kelvins.",
    symmetryNumber: "σ compte les rotations, l'identité comprise, qui laissent la molécule indiscernable.",
    vibrationalPartition: "Une échelle uniforme de niveaux : une série géométrique. La limite kT/hcν̃ ne vaut que pour T ≫ θᵛ.",
    electronicPartition: "Chaque niveau compte pour g états ; le niveau fondamental est le zéro d'énergie.",
    meanVibrationalEnergy: "Moins que kT tant que T n'est pas très supérieur à θᵛ ; le point zéro n'est pas compté.",
    twoLevelEnergy: "⟨ε⟩ = ε·N₁/N, qui tend vers ε/2 à haute température.",
    vibrationalHeatCapacity: "La fonction d'Einstein : nulle à basse température, elle tend vers R quand T ≫ θᵛ.",
    sackurTetrode: "Λ avec la masse d'un atome en kg, p en pascals (1 bar = 10⁵ Pa), et le logarithme naturel.",
    residualEntropy: "S = k ln W pour N molécules, soit R ln W par mole.",
  },
  es: {
    boltzmannRatio: "La distribución de Boltzmann vale por estado: un nivel cuenta tantas veces como estados tiene. T en kelvin.",
    populationTemperature: "Se toma el logaritmo natural de la razón; hc/k = 1,4388 cm K.",
    thermalWavelength: "La masa es la de una molécula, en kg, y T en kelvin.",
    translationalPartition: "q = V/Λ³, con V en m³ y Λ en m: un número enorme de estados accesibles.",
    rotationalPartition: "σ vale 2 para una molécula lineal simétrica (N₂, CO₂) y 1 si no; T en kelvin.",
    symmetryNumber: "σ cuenta las rotaciones, identidad incluida, que dejan la molécula indistinguible.",
    vibrationalPartition: "Una escalera uniforme de niveles: una serie geométrica. El límite kT/hcν̃ solo vale para T ≫ θᵛ.",
    electronicPartition: "Cada nivel cuenta por g estados; el nivel fundamental es el cero de energía.",
    meanVibrationalEnergy: "Menos que kT mientras T no sea muy superior a θᵛ; el punto cero no se cuenta.",
    twoLevelEnergy: "⟨ε⟩ = ε·N₁/N, que tiende a ε/2 a alta temperatura.",
    vibrationalHeatCapacity: "La función de Einstein: nula a baja temperatura, tiende a R cuando T ≫ θᵛ.",
    sackurTetrode: "Λ con la masa de un átomo en kg, p en pascales (1 bar = 10⁵ Pa) y el logaritmo natural.",
    residualEntropy: "S = k ln W para N moléculas, es decir R ln W por mol.",
  },
  en: {
    boltzmannRatio: "The Boltzmann distribution holds per state: a level counts as many times as it has states. T in kelvins.",
    populationTemperature: "Take the natural logarithm of the ratio; hc/k = 1.4388 cm K.",
    thermalWavelength: "The mass is that of one molecule, in kg, and T in kelvins.",
    translationalPartition: "q = V/Λ³, with V in m³ and Λ in m: an enormous number of accessible states.",
    rotationalPartition: "σ is 2 for a symmetric linear molecule (N₂, CO₂), 1 otherwise; T in kelvins.",
    symmetryNumber: "σ counts the rotations, the identity included, that leave the molecule indistinguishable.",
    vibrationalPartition: "A uniform ladder of levels: a geometric series. The limit kT/hcν̃ holds only for T ≫ θᵛ.",
    electronicPartition: "Each level counts for g states; the ground level is the zero of energy.",
    meanVibrationalEnergy: "Less than kT unless T ≫ θᵛ; the zero-point energy is not counted.",
    twoLevelEnergy: "⟨ε⟩ = ε·N₁/N, which tends to ε/2 at high temperature.",
    vibrationalHeatCapacity: "The Einstein function: zero at low temperature, it tends to R when T ≫ θᵛ.",
    sackurTetrode: "Λ with the mass of one atom in kg, p in pascals (1 bar = 10⁵ Pa), and the natural logarithm.",
    residualEntropy: "S = k ln W for N molecules, so R ln W per mole.",
  },
};

const SKILLS: Record<StatisticalKey, [string, string, string]> = {
  boltzmannRatio: ["Populations de Boltzmann", "Poblaciones de Boltzmann", "Boltzmann populations"],
  populationTemperature: ["Température d'une population", "Temperatura de una población", "Temperature from populations"],
  thermalWavelength: ["Longueur d'onde thermique", "Longitud de onda térmica", "Thermal wavelength"],
  translationalPartition: ["Partition de translation", "Partición de traslación", "Translational partition function"],
  rotationalPartition: ["Partition de rotation", "Partición rotacional", "Rotational partition function"],
  symmetryNumber: ["Nombre de symétrie", "Número de simetría", "Symmetry number"],
  vibrationalPartition: ["Partition de vibration", "Partición vibracional", "Vibrational partition function"],
  electronicPartition: ["Partition électronique", "Partición electrónica", "Electronic partition function"],
  meanVibrationalEnergy: ["Énergie de vibration moyenne", "Energía vibracional media", "Mean vibrational energy"],
  twoLevelEnergy: ["Système à deux niveaux", "Sistema de dos niveles", "Two-level system"],
  vibrationalHeatCapacity: ["Capacité calorifique de vibration", "Capacidad calorífica vibracional", "Vibrational heat capacity"],
  sackurTetrode: ["Sackur–Tetrode", "Sackur–Tetrode", "Sackur–Tetrode"],
  residualEntropy: ["Entropie résiduelle", "Entropía residual", "Residual entropy"],
};
const skills = (i: 0 | 1 | 2): Record<string, string> => Object.fromEntries(Object.entries(SKILLS).map(([k, v]) => [`statistical.${k}`, v[i]]));
export const ST_SKILLS: Record<Lang, Record<string, string>> = { fr: skills(0), es: skills(1), en: skills(2) };

export const ST_MISTAKES: Record<Lang, Record<StatisticalMistake, string>> = {
  fr: {
    degeneracyIgnored: "Dégénérescence oubliée : niveaux comptés comme des états",
    symmetryIgnored: "Nombre de symétrie σ oublié",
    rotationsMiscounted: "Rotations mal comptées, ou réflexions comptées avec elles",
    zeroPointConfused: "Énergie de point zéro comptée à tort, ou oubliée",
    classicalLimit: "Limite classique (haute température) prise pour des niveaux quantifiés",
  },
  es: {
    degeneracyIgnored: "Degeneración olvidada: niveles contados como estados",
    symmetryIgnored: "Número de simetría σ olvidado",
    rotationsMiscounted: "Rotaciones mal contadas, o reflexiones contadas con ellas",
    zeroPointConfused: "Energía de punto cero contada de más, u olvidada",
    classicalLimit: "Límite clásico (alta temperatura) usado con niveles cuantizados",
  },
  en: {
    degeneracyIgnored: "Degeneracy left out: levels counted as states",
    symmetryIgnored: "Symmetry number σ left out",
    rotationsMiscounted: "Rotations miscounted, or reflections counted with them",
    zeroPointConfused: "Zero-point energy counted where it is the zero, or left out",
    classicalLimit: "Classical (high-temperature) limit used for quantized levels",
  },
};
