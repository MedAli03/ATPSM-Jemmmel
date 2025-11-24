"use strict";

const DEFAULT_LANGUAGE = "ar-fr-mix";

const buildSystemPrompt = (preferredLanguage = DEFAULT_LANGUAGE) =>
  [
    "Vous êtes un assistant pour les éducateurs accompagnant des enfants autistes dans une association en Tunisie.",
    "Vous n'êtes pas médecin et ne donnez jamais de conseils médicaux ou de médication.",
    "Vous proposez uniquement des stratégies éducatives, des idées d'activités et des formulations professionnelles pour les notes ou messages.",
    "Les parents ne vous parlent pas directement : vous aidez seulement l'éducateur.",
    "Si la question touche au diagnostic médical ou à un traitement, indiquez qu'un médecin ou un spécialiste doit décider.",
    `Répondez dans un mélange de français simple et d'arabe (${preferredLanguage || DEFAULT_LANGUAGE}), sauf si l'éducateur demande explicitement une autre langue.`,
  ].join(" ");

const summarizeContext = (context) => {
  if (!context) return "Contexte enfant non disponible.";

  const sections = [];
  if (context.child) {
    sections.push(
      `Enfant: ${context.child.displayName || "(sans nom)"}, âge: ${
        context.child.age ?? "?"
      }. Profil: ${context.child.profileSummary || "non spécifié"}.`
    );
  }

  if (context.pei) {
    const objectives = (context.pei.objectives || [])
      .slice(0, 5)
      .map((obj) => `- ${obj.label}${obj.progress ? ` (progression: ${obj.progress})` : ""}`)
      .join("\n");
    sections.push(
      [
        `PEI actif (${context.pei.yearLabel || context.pei.yearId || "année"}) – statut: ${
          context.pei.status || "?"
        }`,
        objectives ? `Objectifs principaux:\n${objectives}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  if (context.recentNotes?.length) {
    const notes = context.recentNotes
      .slice(0, 5)
      .map((note) => `- ${note.date}: ${note.summary?.slice(0, 140) || "note"}`)
      .join("\n");
    sections.push(`Notes récentes:\n${notes}`);
  }

  if (context.recentEvaluations?.length) {
    const evals = context.recentEvaluations
      .slice(0, 5)
      .map(
        (ev) =>
          `- ${ev.date}: ${ev.objectiveLabel || "objectif"} – score: ${
            ev.score ?? "?"
          }${ev.comment ? ` (${ev.comment.slice(0, 80)})` : ""}`
      )
      .join("\n");
    sections.push(`Évaluations récentes:\n${evals}`);
  }

  return sections.filter(Boolean).join("\n\n") || "Contexte enfant non disponible.";
};

const buildUserPrompt = ({ context, message, preferredLanguage = DEFAULT_LANGUAGE }) =>
  [
    "CONTEXTE ENFANT:",
    summarizeContext(context),
    "QUESTION DE L'ÉDUCATEUR:",
    message,
    preferredLanguage ? `Langue souhaitée: ${preferredLanguage}` : null,
    "Donne une réponse pratique, courte et structurée, adaptée à ce contexte.",
  ]
    .filter(Boolean)
    .join("\n\n");

module.exports = {
  buildSystemPrompt,
  buildUserPrompt,
  summarizeContext,
};
