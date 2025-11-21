"use strict";

const TABLE = "observation_initiale";

async function hydrateAnneeId(queryInterface) {
  await queryInterface.sequelize.query(
    `UPDATE ${TABLE} oi
     JOIN inscriptions_enfants ie ON ie.enfant_id = oi.enfant_id
       AND (oi.date_observation BETWEEN ie.date_inscription AND COALESCE(ie.date_sortie, oi.date_observation))
     SET oi.annee_id = ie.annee_id
     WHERE oi.annee_id IS NULL`
  );

  await queryInterface.sequelize.query(
    `UPDATE ${TABLE} oi
     JOIN (
       SELECT enfant_id, MAX(annee_id) AS annee_id
       FROM inscriptions_enfants
       GROUP BY enfant_id
     ) latest ON latest.enfant_id = oi.enfant_id
     SET oi.annee_id = latest.annee_id
     WHERE oi.annee_id IS NULL`
  );

  await queryInterface.sequelize.query(
    `UPDATE ${TABLE}
     SET annee_id = (
       SELECT id
       FROM annees_scolaires
       WHERE est_active = 1
       ORDER BY date_debut DESC
       LIMIT 1
     )
     WHERE annee_id IS NULL`
  );

  const [[{ missing }]] = await queryInterface.sequelize.query(
    `SELECT COUNT(*) AS missing FROM ${TABLE} WHERE annee_id IS NULL`
  );

  if (missing > 0) {
    throw new Error(
      `Impossible d'attribuer une annee_id pour ${missing} observations_initiales. Veuillez compléter les données avant de relancer la migration.`
    );
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE, "annee_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      after: "enfant_id",
      references: { model: "annees_scolaires", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addColumn(TABLE, "statut", {
      type: Sequelize.ENUM("BROUILLON", "SOUMISE", "VALIDE"),
      allowNull: false,
      defaultValue: "BROUILLON",
      after: "contenu",
    });

    await hydrateAnneeId(queryInterface);

    await queryInterface.changeColumn(TABLE, "annee_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.addConstraint(TABLE, {
      fields: ["enfant_id", "annee_id"],
      type: "unique",
      name: "uniq_observation_enfant_annee",
    });

    await queryInterface.addIndex(TABLE, {
      name: "idx_observation_annee",
      fields: ["annee_id"],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(TABLE, "idx_observation_annee").catch(() => {});
    await queryInterface.removeConstraint(TABLE, "uniq_observation_enfant_annee").catch(() => {});

    await queryInterface.removeColumn(TABLE, "statut").catch(() => {});
    await queryInterface.removeColumn(TABLE, "annee_id").catch(() => {});
  },
};
