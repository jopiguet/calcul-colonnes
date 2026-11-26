/** The prompts and explanations of the linux questions, loaded with the tests (quiz-i18n-questions.ts). */
import type { Lang } from "./i18n";
import type { LinuxExplanation, LinuxPrompt } from "./quiz-i18n-linux";

export const LX_PROMPTS: Record<Lang, Record<LinuxPrompt, string>> = {
  fr: {
    chmodToSymbolic: "Après cette commande, quelles permissions `ls -l` affiche-t-il ?",
    chmodToOctal: "`ls -l` affiche ces permissions. Quel mode octal donner à `chmod` ?",
    umask: "Avec ce masque, quelles permissions ont le nouveau fichier et le nouveau répertoire ?",
    cron: "Quand cette ligne de crontab lance-t-elle sa commande ?",
  },
  es: {
    chmodToSymbolic: "Tras esta orden, ¿qué permisos muestra `ls -l`?",
    chmodToOctal: "`ls -l` muestra estos permisos. ¿Qué modo octal hay que dar a `chmod`?",
    umask: "Con esta máscara, ¿qué permisos tienen el archivo y el directorio nuevos?",
    cron: "¿Cuándo ejecuta su orden esta línea de crontab?",
  },
  en: {
    chmodToSymbolic: "After this command, which permissions does `ls -l` show?",
    chmodToOctal: "`ls -l` shows these permissions. Which octal mode gives them to `chmod`?",
    umask: "With this mask, which permissions do the new file and the new directory get?",
    cron: "When does this crontab line run its command?",
  },
};

export const LX_EXPLANATIONS: Record<Lang, Record<LinuxExplanation, string>> = {
  fr: {
    chmod: "Un chiffre par classe : propriétaire, groupe, autres. Dans chaque chiffre, r vaut 4, w 2 et x 1.",
    umask: "Les fichiers partent de 666 (jamais d'exécution), les répertoires de 777 ; le masque retire ses bits, il ne se soustrait pas.",
    cron: "Les champs sont : minute, heure, jour du mois, mois, jour de la semaine (0 ou 7 = dimanche). */n veut dire « tous les n », a-b une plage, a,b une liste.",
  },
  es: {
    chmod: "Una cifra por clase: propietario, grupo, otros. En cada cifra, r vale 4, w 2 y x 1.",
    umask: "Los archivos parten de 666 (nunca ejecución), los directorios de 777; la máscara quita sus bits, no se resta.",
    cron: "Los campos son: minuto, hora, día del mes, mes, día de la semana (0 o 7 = domingo). */n significa «cada n», a-b un rango, a,b una lista.",
  },
  en: {
    chmod: "One digit per class: owner, group, others. In each digit, r is 4, w is 2 and x is 1.",
    umask: "Files start from 666 (never execute), directories from 777; the mask removes its bits, it is not subtracted.",
    cron: "The fields are: minute, hour, day of month, month, day of week (0 or 7 = Sunday). */n means 'every n', a-b a range, a,b a list.",
  },
};
