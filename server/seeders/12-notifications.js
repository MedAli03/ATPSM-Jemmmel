"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[president]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='admin@asso.tn' LIMIT 1"
    );
    const [[directeur]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='directeur@asso.tn' LIMIT 1"
    );
    const [[educateur]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educateur@asso.tn' LIMIT 1"
    );
    const [[parent]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='parent@asso.tn' LIMIT 1"
    );

    const rows = [];
    if (president?.id) {
      rows.push({
        utilisateur_id: president.id,
        type: "SYSTEM", // e.g. dashboard alert
        titre: "Bilan mensuel généré",
        corps: "Votre tableau de bord a été mis à jour avec les indicateurs du mois.",
        icon: "chart-bar",
        action_url: "/dashboard",
        payload: JSON.stringify({ scope: "president" }),
        lu_le: null,
        created_at: now,
        updated_at: now,
      });
    }
    if (directeur?.id) {
      rows.push({
        utilisateur_id: directeur.id,
        type: "ANNEE_SCOLAIRE",
        titre: "Planification des groupes",
        corps: "Merci de valider la répartition des enfants pour 2025-2026.",
        icon: "calendar",
        action_url: "/dashboard/groupes",
        payload: JSON.stringify({ annee: "2025-2026" }),
        lu_le: now,
        created_at: now,
        updated_at: now,
      });
    }
    if (educateur?.id) {
      rows.push({
        utilisateur_id: educateur.id,
        type: "PEI",
        titre: "PEI validé",
        corps: "Le PEI de Sami a été validé pour l'année en cours.",
        icon: "check-circle",
        action_url: "/pei",
        payload: JSON.stringify({ enfant: "Sami" }),
        lu_le: null,
        created_at: now,
        updated_at: now,
      });
    }
    if (parent?.id) {
      rows.push({
        utilisateur_id: parent.id,
        type: "MESSAGE",
        titre: "Nouveau message de l'éducateur",
        corps: "Une réponse est disponible dans votre messagerie.",
        icon: "message-circle",
        action_url: "/messages",
        payload: JSON.stringify({ threadTitle: "محادثة Ahmed" }),
        lu_le: null,
        created_at: now,
        updated_at: now,
      });
    }

    if (rows.length) {
      await queryInterface.bulkInsert("notifications", rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("notifications", {
      titre: [
        "Bilan mensuel généré",
        "Planification des groupes",
        "PEI validé",
        "Nouveau message de l'éducateur",
      ],
    });
  },
};
