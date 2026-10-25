import type { AuthOptions } from "../shared/types";
import { button, el } from "./dom";
import { currentLang } from "./i18n";

/**
 * The privacy page (#privacy): what Luma stores, where, who sees it, for how
 * long, and how to download or delete it. Reached from the sign-in screen,
 * the landing page and the account page. The server's operator adds the
 * hosting (PRIVACY_HOSTING) and a contact (PRIVACY_CONTACT).
 */

type Section = { title: string; text: string[] };

interface Texts {
  title: string;
  intro: string;
  sections: Section[];
  hosting: (where: string) => string;
  hostingUnknown: string;
  contact: (who: string) => string;
  contactUnknown: string;
  back: string;
}

const fr: Texts = {
  title: "Confidentialité",
  intro:
    "Luma est une application privée, ouverte sur invitation par la personne qui l'héberge. Elle n'a ni publicité, ni mesure d'audience, ni cookie tiers : un seul cookie, celui de la session.",
  sections: [
    {
      title: "Ce qui est enregistré",
      text: [
        "Le compte : un nom, une adresse e-mail, les façons de se connecter (le mot de passe n'est gardé que sous forme hachée ; d'un fournisseur comme Google, seulement son identifiant).",
        "Les joueurs : un prénom ou un surnom, et ce que chacun voit sur sa page d'accueil.",
        "Les résultats : opérations posées, tests (avec leurs réponses, pour en revoir les corrections), mots de vocabulaire, signalements de questions.",
        "Les partages d'un joueur avec un autre compte, les avis envoyés.",
      ],
    },
    {
      title: "Qui le voit",
      text: [
        "Votre compte, et les comptes avec qui vous partagez un joueur (pour ce joueur seulement).",
        "La personne qui héberge le serveur a un accès technique à la base de données. Rien n'est vendu ni transmis à qui que ce soit.",
      ],
    },
    {
      title: "Combien de temps",
      text: [
        "Tant que le compte existe. « Supprimer mon compte », sur la page Compte, efface tout aussitôt : le compte, ses joueurs et tous leurs résultats.",
        "Les sauvegardes de la base gardent l'état passé quelques jours encore, puis disparaissent.",
      ],
    },
    {
      title: "Vos droits",
      text: [
        "Télécharger vos données (page Compte, « Télécharger mes données »), les corriger (nom des joueurs), les supprimer.",
        "Les enfants n'ont pas besoin d'adresse e-mail : leur joueur appartient au compte d'un parent.",
      ],
    },
  ],
  hosting: (where) => `Où : ${where}.`,
  hostingUnknown: "Où : sur le serveur et la base de données de la personne qui héberge l'application.",
  contact: (who) => `Une question : ${who}.`,
  contactUnknown: "Une question : adressez-vous à la personne qui vous a invité.",
  back: "← Retour",
};

const es: Texts = {
  title: "Privacidad",
  intro:
    "Luma es una aplicación privada, abierta por invitación por la persona que la aloja. No tiene publicidad, ni medición de audiencia, ni cookies de terceros: una sola cookie, la de la sesión.",
  sections: [
    {
      title: "Qué se guarda",
      text: [
        "La cuenta: un nombre, un correo electrónico, las formas de conectarse (la contraseña solo se guarda cifrada con hash; de un proveedor como Google, solo su identificador).",
        "Los jugadores: un nombre o un apodo, y lo que cada uno ve en su página de inicio.",
        "Los resultados: operaciones, tests (con sus respuestas, para volver a ver las correcciones), palabras de vocabulario, preguntas señaladas.",
        "Los jugadores compartidos con otra cuenta, las opiniones enviadas.",
      ],
    },
    {
      title: "Quién lo ve",
      text: [
        "Tu cuenta, y las cuentas con las que compartes un jugador (solo ese jugador).",
        "La persona que aloja el servidor tiene acceso técnico a la base de datos. Nada se vende ni se transmite a nadie.",
      ],
    },
    {
      title: "Cuánto tiempo",
      text: [
        "Mientras exista la cuenta. «Eliminar mi cuenta», en la página Cuenta, lo borra todo al instante: la cuenta, sus jugadores y todos sus resultados.",
        "Las copias de seguridad de la base guardan el estado anterior unos días más y luego desaparecen.",
      ],
    },
    {
      title: "Tus derechos",
      text: [
        "Descargar tus datos (página Cuenta, «Descargar mis datos»), corregirlos (nombre de los jugadores), eliminarlos.",
        "Los niños no necesitan correo electrónico: su jugador pertenece a la cuenta de uno de sus padres.",
      ],
    },
  ],
  hosting: (where) => `Dónde: ${where}.`,
  hostingUnknown: "Dónde: en el servidor y la base de datos de la persona que aloja la aplicación.",
  contact: (who) => `Una pregunta: ${who}.`,
  contactUnknown: "Una pregunta: dirígete a la persona que te invitó.",
  back: "← Volver",
};

const en: Texts = {
  title: "Privacy",
  intro:
    "Luma is a private app, opened by invitation by the person who hosts it. It has no advertising, no analytics and no third-party cookies: a single cookie, the session's.",
  sections: [
    {
      title: "What is stored",
      text: [
        "The account: a name, an email address, the ways to sign in (a password is kept only hashed; from a provider such as Google, only its identifier).",
        "The players: a first name or nickname, and what each one sees on their home page.",
        "The results: column sums, tests (with their answers, to see the corrections again), vocabulary, questions reported.",
        "Players shared with another account, feedback sent.",
      ],
    },
    {
      title: "Who sees it",
      text: [
        "Your account, and the accounts you share a player with (that player only).",
        "The person who hosts the server has technical access to the database. Nothing is sold or passed on to anyone.",
      ],
    },
    {
      title: "For how long",
      text: [
        "As long as the account exists. \"Delete my account\", on the Account page, erases everything at once: the account, its players and all their results.",
        "Backups of the database keep the earlier state for a few more days, then disappear.",
      ],
    },
    {
      title: "Your rights",
      text: [
        "Download your data (Account page, \"Download my data\"), correct it (players' names), delete it.",
        "Children need no email address: their player belongs to a parent's account.",
      ],
    },
  ],
  hosting: (where) => `Where: ${where}.`,
  hostingUnknown: "Where: on the server and database of the person who hosts the app.",
  contact: (who) => `A question: ${who}.`,
  contactUnknown: "A question: ask the person who invited you.",
  back: "← Back",
};

const TEXTS: Record<string, Texts> = { fr, es, en };

export const privacyLinkText = (): string => (TEXTS[currentLang()] ?? en).title;

export function privacyView(options: AuthOptions | null, onBack: () => void): HTMLElement {
  const tx = TEXTS[currentLang()] ?? en;
  const wrap = el("section", "sheet privacy");
  wrap.append(el("h1", "title", `🔒 ${tx.title}`), el("p", "privacy-intro", tx.intro));
  for (const section of tx.sections) {
    wrap.append(el("h2", "subtitle", section.title));
    const list = el("ul", "privacy-list");
    for (const line of section.text) list.append(el("li", undefined, line));
    wrap.append(list);
  }
  wrap.append(
    el("p", "privacy-where", options?.hosting ? tx.hosting(options.hosting) : tx.hostingUnknown),
    el("p", "privacy-where", options?.contact ? tx.contact(options.contact) : tx.contactUnknown),
    button("primary", tx.back, onBack),
  );
  return wrap;
}
