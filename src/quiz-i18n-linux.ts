/** Texts of the Linux tests, in French, Spanish and English; merged into quiz-i18n.ts. */
import type { LinuxTopic } from "../shared/quiz";

type Lang = "fr" | "es" | "en";
type Tri = Record<Lang, string>;

export const LX_TEXTS = {
  fr: {
    modeLinux: "🐧 Linux",
    linuxSetupTitle: "QCM Linux",
  },
  es: {
    modeLinux: "🐧 Linux",
    linuxSetupTitle: "Test de Linux",
  },
  en: {
    modeLinux: "🐧 Linux",
    linuxSetupTitle: "Linux test",
  },
} satisfies Record<Lang, Record<string, string>>;

export const LX_LEVEL: Tri = { fr: "Linux", es: "Linux", en: "Linux" };

export const LX_GROUPS: Record<Lang, { linuxCommands: string; linuxInstall: string }> = {
  fr: { linuxCommands: "La ligne de commande", linuxInstall: "Outils à installer" },
  es: { linuxCommands: "La línea de órdenes", linuxInstall: "Herramientas que instalar" },
  en: { linuxCommands: "The command line", linuxInstall: "Tools to install" },
};

export const LX_TOPICS: Record<Lang, Record<LinuxTopic, string>> = {
  fr: { linuxFiles: "Fichiers et permissions", linuxText: "Traitement de texte", linuxShell: "Le shell", linuxProcesses: "Processus et services", linuxSystem: "Système, disques, paquets", linuxNetwork: "Réseau et SSH", linuxTools: "Outils modernes" },
  es: { linuxFiles: "Archivos y permisos", linuxText: "Tratamiento de texto", linuxShell: "El shell", linuxProcesses: "Procesos y servicios", linuxSystem: "Sistema, discos, paquetes", linuxNetwork: "Red y SSH", linuxTools: "Herramientas modernas" },
  en: { linuxFiles: "Files and permissions", linuxText: "Text processing", linuxShell: "The shell", linuxProcesses: "Processes and services", linuxSystem: "System, disks, packages", linuxNetwork: "Network and SSH", linuxTools: "Modern tools" },
};

export type LinuxPrompt = "chmodToOctal" | "chmodToSymbolic" | "umask" | "cron";
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

export type LinuxExplanation = "chmod" | "umask" | "cron";
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

export const LX_SKILLS: Record<Lang, Record<string, string>> = {
  fr: {
    "linuxFiles.navigation": "Se déplacer, copier, déplacer",
    "linuxFiles.links": "Liens physiques et symboliques",
    "linuxFiles.find": "Trouver des fichiers",
    "linuxFiles.permissions": "Permissions",
    "linuxFiles.archives": "Archives et compression",
    "linuxFiles.chmodToSymbolic": "chmod : de l'octal à rwx",
    "linuxFiles.chmodToOctal": "chmod : de rwx à l'octal",
    "linuxFiles.umask": "umask",
    "linuxText.grep": "grep",
    "linuxText.sed": "sed",
    "linuxText.awk": "awk",
    "linuxText.columns": "Colonnes et lignes : cut, sort, uniq, wc",
    "linuxText.pipelines": "Tubes, xargs, tee",
    "linuxShell.redirection": "Redirections",
    "linuxShell.expansion": "Guillemets et développements",
    "linuxShell.control": "Codes de sortie et scripts",
    "linuxShell.environment": "Variables et environnement",
    "linuxProcesses.listing": "Processus",
    "linuxProcesses.signals": "Signaux",
    "linuxProcesses.jobs": "Tâches de fond",
    "linuxProcesses.services": "Services systemd",
    "linuxProcesses.scheduling": "Planification",
    "linuxProcesses.cron": "Lire une ligne de crontab",
    "linuxSystem.storage": "Disques et mémoire",
    "linuxSystem.users": "Utilisateurs et sudo",
    "linuxSystem.packages": "Paquets",
    "linuxSystem.info": "Informations système",
    "linuxNetwork.interfaces": "Interfaces et ports",
    "linuxNetwork.transfer": "Transferts : curl, wget, rsync",
    "linuxNetwork.ssh": "SSH",
    "linuxNetwork.dns": "Noms et DNS",
    "linuxTools.search": "Chercher : rg, fd, fzf, zoxide",
    "linuxTools.viewers": "Afficher : bat, eza, tree, delta",
    "linuxTools.json": "JSON avec jq",
    "linuxTools.monitoring": "Surveiller : htop, btop, ncdu, duf",
    "linuxTools.workflow": "Travailler : tmux, entr, parallel…",
    "linuxTools.diagnostics": "Diagnostiquer : mtr, nmap, HTTPie, strace",
  },
  es: {
    "linuxFiles.navigation": "Moverse, copiar, mover",
    "linuxFiles.links": "Enlaces duros y simbólicos",
    "linuxFiles.find": "Encontrar archivos",
    "linuxFiles.permissions": "Permisos",
    "linuxFiles.archives": "Archivos comprimidos",
    "linuxFiles.chmodToSymbolic": "chmod: de octal a rwx",
    "linuxFiles.chmodToOctal": "chmod: de rwx a octal",
    "linuxFiles.umask": "umask",
    "linuxText.grep": "grep",
    "linuxText.sed": "sed",
    "linuxText.awk": "awk",
    "linuxText.columns": "Columnas y líneas: cut, sort, uniq, wc",
    "linuxText.pipelines": "Tuberías, xargs, tee",
    "linuxShell.redirection": "Redirecciones",
    "linuxShell.expansion": "Comillas y expansiones",
    "linuxShell.control": "Códigos de salida y scripts",
    "linuxShell.environment": "Variables y entorno",
    "linuxProcesses.listing": "Procesos",
    "linuxProcesses.signals": "Señales",
    "linuxProcesses.jobs": "Tareas en segundo plano",
    "linuxProcesses.services": "Servicios de systemd",
    "linuxProcesses.scheduling": "Programación de tareas",
    "linuxProcesses.cron": "Leer una línea de crontab",
    "linuxSystem.storage": "Discos y memoria",
    "linuxSystem.users": "Usuarios y sudo",
    "linuxSystem.packages": "Paquetes",
    "linuxSystem.info": "Información del sistema",
    "linuxNetwork.interfaces": "Interfaces y puertos",
    "linuxNetwork.transfer": "Transferencias: curl, wget, rsync",
    "linuxNetwork.ssh": "SSH",
    "linuxNetwork.dns": "Nombres y DNS",
    "linuxTools.search": "Buscar: rg, fd, fzf, zoxide",
    "linuxTools.viewers": "Mostrar: bat, eza, tree, delta",
    "linuxTools.json": "JSON con jq",
    "linuxTools.monitoring": "Vigilar: htop, btop, ncdu, duf",
    "linuxTools.workflow": "Trabajar: tmux, entr, parallel…",
    "linuxTools.diagnostics": "Diagnosticar: mtr, nmap, HTTPie, strace",
  },
  en: {
    "linuxFiles.navigation": "Moving around, copying, moving",
    "linuxFiles.links": "Hard and symbolic links",
    "linuxFiles.find": "Finding files",
    "linuxFiles.permissions": "Permissions",
    "linuxFiles.archives": "Archives and compression",
    "linuxFiles.chmodToSymbolic": "chmod: octal to rwx",
    "linuxFiles.chmodToOctal": "chmod: rwx to octal",
    "linuxFiles.umask": "umask",
    "linuxText.grep": "grep",
    "linuxText.sed": "sed",
    "linuxText.awk": "awk",
    "linuxText.columns": "Columns and lines: cut, sort, uniq, wc",
    "linuxText.pipelines": "Pipes, xargs, tee",
    "linuxShell.redirection": "Redirections",
    "linuxShell.expansion": "Quotes and expansions",
    "linuxShell.control": "Exit codes and scripts",
    "linuxShell.environment": "Variables and environment",
    "linuxProcesses.listing": "Processes",
    "linuxProcesses.signals": "Signals",
    "linuxProcesses.jobs": "Background jobs",
    "linuxProcesses.services": "systemd services",
    "linuxProcesses.scheduling": "Scheduling",
    "linuxProcesses.cron": "Reading a crontab line",
    "linuxSystem.storage": "Disks and memory",
    "linuxSystem.users": "Users and sudo",
    "linuxSystem.packages": "Packages",
    "linuxSystem.info": "System information",
    "linuxNetwork.interfaces": "Interfaces and ports",
    "linuxNetwork.transfer": "Transfers: curl, wget, rsync",
    "linuxNetwork.ssh": "SSH",
    "linuxNetwork.dns": "Names and DNS",
    "linuxTools.search": "Searching: rg, fd, fzf, zoxide",
    "linuxTools.viewers": "Viewing: bat, eza, tree, delta",
    "linuxTools.json": "JSON with jq",
    "linuxTools.monitoring": "Monitoring: htop, btop, ncdu, duf",
    "linuxTools.workflow": "Working: tmux, entr, parallel…",
    "linuxTools.diagnostics": "Diagnosing: mtr, nmap, HTTPie, strace",
  },
};

export type LinuxMistake = "permissionClassesSwapped" | "permissionWeights" | "umaskOred" | "umaskExecOnFiles" | "cronFieldsSwapped" | "cronStepRead" | "cronDayFields";
export const LX_MISTAKES: Record<Lang, Record<LinuxMistake, string>> = {
  fr: {
    permissionClassesSwapped: "Classes inversées (propriétaire, groupe, autres)",
    permissionWeights: "Poids de r, w, x inversés",
    umaskOred: "Masque ajouté au lieu d'être retiré",
    umaskExecOnFiles: "Fichiers et répertoires traités pareil",
    cronFieldsSwapped: "Minute et heure confondues",
    cronStepRead: "*/n ou un nombre mal lu",
    cronDayFields: "Champs des jours confondus",
  },
  es: {
    permissionClassesSwapped: "Clases invertidas (propietario, grupo, otros)",
    permissionWeights: "Pesos de r, w, x invertidos",
    umaskOred: "Máscara añadida en vez de quitada",
    umaskExecOnFiles: "Archivos y directorios tratados igual",
    cronFieldsSwapped: "Minuto y hora confundidos",
    cronStepRead: "*/n o un número mal leído",
    cronDayFields: "Campos de los días confundidos",
  },
  en: {
    permissionClassesSwapped: "Classes swapped (owner, group, others)",
    permissionWeights: "Weights of r, w, x reversed",
    umaskOred: "Mask added instead of removed",
    umaskExecOnFiles: "Files and directories treated alike",
    cronFieldsSwapped: "Minute and hour mixed up",
    cronStepRead: "*/n or a number misread",
    cronDayFields: "Day fields mixed up",
  },
};
