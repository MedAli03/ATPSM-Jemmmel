"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[activeYear]] = await queryInterface.sequelize.query(
      "SELECT id FROM annees_scolaires WHERE est_active=1 LIMIT 1"
    );
    const [[previousYear]] = await queryInterface.sequelize.query(
      "SELECT id FROM annees_scolaires WHERE est_active=0 ORDER BY date_debut DESC LIMIT 1"
    );
    const [children] = await queryInterface.sequelize.query(
      "SELECT id, nom FROM enfants WHERE nom IN ('Sami','Nada')"
    );
    const childId = Object.fromEntries(children.map((c) => [c.nom, c.id]));
    const [[educateur1]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educateur@asso.tn' LIMIT 1"
    );
    const [[educateur2]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educatrice@asso.tn' LIMIT 1"
    );

    let precedentId = null;
    if (previousYear && childId.Sami) {
      await queryInterface.bulkInsert("projet_educatif_individuel", [
        {
          enfant_id: childId.Sami,
          educateur_id: educateur1.id,
          annee_id: previousYear.id,
          date_creation: "2024-09-20",
          objectifs: "Stabiliser la communication gestuelle.",
          statut: "CLOTURE",
          est_actif: null,
          precedent_projet_id: null,
          date_derniere_maj: now,
          created_at: now,
          updated_at: now,
        },
      ]);
      const [[lastClosed]] = await queryInterface.sequelize.query(
        `SELECT id FROM projet_educatif_individuel WHERE enfant_id=${childId.Sami} AND annee_id=${previousYear.id} ORDER BY id DESC LIMIT 1`
      );
      precedentId = lastClosed?.id ?? null;
    }

    const peiRows = [];
    if (childId.Sami && activeYear) {
      peiRows.push({
        enfant_id: childId.Sami,
        educateur_id: educateur1.id,
        annee_id: activeYear.id,
        date_creation: "2025-09-10",
        objectifs: "Renforcer la communication fonctionnelle et l’autonomie personnelle.",
        statut: "VALIDE",
        est_actif: true,
        precedent_projet_id: precedentId,
        date_derniere_maj: now,
        created_at: now,
        updated_at: now,
      });
    }
    if (childId.Nada && activeYear) {
      peiRows.push({
        enfant_id: childId.Nada,
        educateur_id: educateur2.id,
        annee_id: activeYear.id,
        date_creation: "2025-09-12",
        objectifs: "Développer les routines d’autonomie et la socialisation.",
        statut: "EN_ATTENTE_VALIDATION",
        est_actif: null,
        precedent_projet_id: null,
        date_derniere_maj: now,
        created_at: now,
        updated_at: now,
      });
    }
    if (peiRows.length) {
      await queryInterface.bulkInsert("projet_educatif_individuel", peiRows);
    }

    const [[validatedPei]] = await queryInterface.sequelize.query(
      `SELECT id FROM projet_educatif_individuel WHERE enfant_id=${childId.Sami ?? 0} AND statut='VALIDE' ORDER BY id DESC LIMIT 1`
    );
    if (validatedPei?.id) {
      await queryInterface.bulkInsert("activite_projet", [
        {
          projet_id: validatedPei.id,
          educateur_id: educateur1.id,
          enfant_id: childId.Sami,
          date_activite: "2025-09-15",
          titre: "Atelier pictogrammes",
          description: "Jeu de rôle pour exprimer les besoins",
          objectifs: "Augmenter le vocabulaire fonctionnel",
          type: "atelier",
          created_at: now,
          updated_at: now,
        },
      ]);
      await queryInterface.bulkInsert("daily_notes", [
        {
          projet_id: validatedPei.id,
          educateur_id: educateur1.id,
          enfant_id: childId.Sami,
          date_note: "2025-09-16",
          contenu: "Sami a demandé de l’aide en utilisant 3 pictogrammes.",
          type: "observation",
          pieces_jointes: null,
          created_at: now,
          updated_at: now,
        },
      ]);
      await queryInterface.bulkInsert("historique_projet", [
        {
          projet_id: validatedPei.id,
          educateur_id: educateur1.id,
          date_modification: "2025-09-18",
          ancien_objectifs: "",
          ancien_statut: "EN_ATTENTE_VALIDATION",
          raison_modification: "Validation par la direction",
          created_at: now,
          updated_at: now,
        },
        {
          projet_id: validatedPei.id,
          educateur_id: educateur1.id,
          date_modification: "2025-09-20",
          ancien_objectifs: "Renforcer la communication fonctionnelle",
          ancien_statut: "VALIDE",
          raison_modification: "Ajout d’axes d’autonomie",
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("historique_projet", null);
    await queryInterface.bulkDelete("daily_notes", null);
    await queryInterface.bulkDelete("activite_projet", null);
    await queryInterface.bulkDelete("projet_educatif_individuel", null);
  },
};
