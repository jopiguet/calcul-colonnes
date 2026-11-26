/** The prompts and explanations of the chembio questions, loaded with the tests (quiz-i18n-questions.ts). */
import type { Lang } from "./i18n";

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
