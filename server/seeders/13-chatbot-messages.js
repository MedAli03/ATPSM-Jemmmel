"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[educateur]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educateur@asso.tn' LIMIT 1"
    );
    const [[child]] = await queryInterface.sequelize.query(
      "SELECT id, nom FROM enfants WHERE nom='Sami' LIMIT 1"
    );

    if (!educateur || !child) return;

    await queryInterface.bulkInsert("chatbot_messages", [
      {
        educator_id: educateur.id,
        child_id: child.id,
        question: "Quels jeux moteurs proposer à Sami pour canaliser son énergie ?",
        answer:
          "Proposer des parcours moteurs simples avec consignes visuelles. Ajouter des pauses respiration guidées.",
        model: "llama2",
        created_at: now,
        updated_at: now,
      },
      {
        educator_id: educateur.id,
        child_id: child.id,
        question: "Idées pour encourager les demandes spontanées en classe.",
        answer:
          "Mettre les pictos à portée, utiliser le choix forcé de deux options et renforcer chaque demande par un retour positif.",
        model: "llama2",
        created_at: new Date(now.getTime() + 60000),
        updated_at: new Date(now.getTime() + 60000),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("chatbot_messages", {
      question: [
        "Quels jeux moteurs proposer à Sami pour canaliser son énergie ?",
        "Idées pour encourager les demandes spontanées en classe.",
      ],
    });
  },
};
