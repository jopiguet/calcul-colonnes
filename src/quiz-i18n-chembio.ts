/** Texts of the chemistry-and-biology test (balancing equations), in French, Spanish and English; merged into quiz-i18n.ts. */
import type { ChemBioTopic } from "../shared/quiz";

type Lang = "fr" | "es" | "en";
type Tri = Record<Lang, string>;

export const CB_TEXTS = {
  fr: { modeChemBio: "⚗️ Équations chimiques", chembioSetupTitle: "QCM : équilibrer les équations" },
  es: { modeChemBio: "⚗️ Ecuaciones químicas", chembioSetupTitle: "Test: ajustar ecuaciones" },
  en: { modeChemBio: "⚗️ Chemical equations", chembioSetupTitle: "Test: balancing equations" },
} satisfies Record<Lang, Record<string, string>>;

export const CB_LEVEL: Tri = { fr: "Chimie générale", es: "Química general", en: "General chemistry" };

export const CB_GROUPS: Record<Lang, { reactions: string }> = {
  fr: { reactions: "Réactions chimiques" },
  es: { reactions: "Reacciones químicas" },
  en: { reactions: "Chemical reactions" },
};

export const CB_TOPICS: Record<Lang, Record<ChemBioTopic, string>> = {
  fr: { balancing: "Équilibrer une équation" },
  es: { balancing: "Ajustar una ecuación" },
  en: { balancing: "Balancing an equation" },
};

export const CB_PROMPTS: Record<Lang, { balanceEquation: string; balanceCoefficient: string }> = {
  fr: {
    balanceEquation: "Quelle équation est équilibrée, avec les plus petits coefficients entiers ?",
    balanceCoefficient: "Une fois l'équation équilibrée avec les plus petits coefficients entiers, quel coefficient va à la place du « ? » ?",
  },
  es: {
    balanceEquation: "¿Qué ecuación está ajustada, con los coeficientes enteros más pequeños?",
    balanceCoefficient: "Una vez ajustada la ecuación con los coeficientes enteros más pequeños, ¿qué coeficiente va en lugar del «?»?",
  },
  en: {
    balanceEquation: "Which equation is balanced, with the smallest whole-number coefficients?",
    balanceCoefficient: "Once the equation is balanced with the smallest whole-number coefficients, which coefficient goes where the “?” is?",
  },
};

export const CB_EXPLANATIONS: Record<Lang, { balanceEquation: string }> = {
  fr: { balanceEquation: "Chaque élément compte autant d'atomes à gauche qu'à droite. On ne touche qu'aux coefficients : changer un indice, c'est changer de substance." },
  es: { balanceEquation: "Cada elemento tiene tantos átomos a la izquierda como a la derecha. Solo se cambian los coeficientes: cambiar un subíndice es cambiar de sustancia." },
  en: { balanceEquation: "Every element has as many atoms on the left as on the right. Only the coefficients change: changing a subscript changes the substance." },
};

export const CB_SKILLS: Record<Lang, Record<string, string>> = {
  fr: {
    "balancing.combustion": "Combustion",
    "balancing.synthesis": "Synthèse",
    "balancing.neutralization": "Neutralisation acide–base",
    "balancing.displacement": "Déplacement d'un métal",
    "balancing.decomposition": "Décomposition",
    "balancing.coefficient": "Un coefficient",
  },
  es: {
    "balancing.combustion": "Combustión",
    "balancing.synthesis": "Síntesis",
    "balancing.neutralization": "Neutralización ácido–base",
    "balancing.displacement": "Desplazamiento de un metal",
    "balancing.decomposition": "Descomposición",
    "balancing.coefficient": "Un coeficiente",
  },
  en: {
    "balancing.combustion": "Combustion",
    "balancing.synthesis": "Synthesis",
    "balancing.neutralization": "Acid–base neutralization",
    "balancing.displacement": "Metal displacement",
    "balancing.decomposition": "Decomposition",
    "balancing.coefficient": "One coefficient",
  },
};

type ChemBioMistake = "subscriptChanged" | "notLowestTerms" | "elementUnbalanced" | "diatomicForgotten";

export const CB_MISTAKES: Record<Lang, Record<ChemBioMistake, string>> = {
  fr: {
    subscriptChanged: "Indice changé au lieu d'un coefficient : une autre substance",
    notLowestTerms: "Équilibrée, mais pas avec les plus petits coefficients",
    elementUnbalanced: "Un élément pas équilibré",
    diatomicForgotten: "O₂, H₂, N₂ ou Cl₂ écrit comme un seul atome",
  },
  es: {
    subscriptChanged: "Subíndice cambiado en lugar de un coeficiente: otra sustancia",
    notLowestTerms: "Ajustada, pero no con los coeficientes más pequeños",
    elementUnbalanced: "Un elemento sin ajustar",
    diatomicForgotten: "O₂, H₂, N₂ o Cl₂ escrito como un solo átomo",
  },
  en: {
    subscriptChanged: "A subscript changed instead of a coefficient: another substance",
    notLowestTerms: "Balanced, but not with the smallest coefficients",
    elementUnbalanced: "An element left unbalanced",
    diatomicForgotten: "O₂, H₂, N₂ or Cl₂ written as a single atom",
  },
};
