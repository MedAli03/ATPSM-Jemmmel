"use strict";

const TABLE = "daily_notes";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE, "pei_objectif_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      after: "pei_version_id",
      references: { model: "pei_objectifs", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn(TABLE, "visibility", {
      type: Sequelize.ENUM("INTERNE", "PARTAGE_PARENT"),
      allowNull: false,
      defaultValue: "INTERNE",
      after: "type",
    });

    await queryInterface.sequelize.query(
      `UPDATE ${TABLE} SET contenu = '' WHERE contenu IS NULL`
    );

    await queryInterface.changeColumn(TABLE, "contenu", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.sequelize.query(
      `UPDATE ${TABLE}
       SET type = CASE
         WHEN type IN ('incident', 'INCIDENT') THEN 'INCIDENT'
         WHEN type IN ('progres', 'PROGRES') THEN 'PROGRES'
         ELSE 'OBSERVATION'
       END`
    );

    await queryInterface.changeColumn(TABLE, "type", {
      type: Sequelize.ENUM("OBSERVATION", "INCIDENT", "PROGRES"),
      allowNull: false,
      defaultValue: "OBSERVATION",
    });

    await queryInterface.addConstraint(TABLE, {
      fields: ["enfant_id", "date_note", "educateur_id"],
      type: "unique",
      name: "uniq_daily_note_enfant_date_educ",
    });

    await queryInterface.addIndex(TABLE, {
      name: "idx_daily_notes_visibility",
      fields: ["visibility"],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(TABLE, "idx_daily_notes_visibility").catch(() => {});
    await queryInterface.removeConstraint(TABLE, "uniq_daily_note_enfant_date_educ").catch(() => {});

    await queryInterface.changeColumn(TABLE, "type", {
      type: Sequelize.STRING(50),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.changeColumn(TABLE, "contenu", {
      type: Sequelize.TEXT,
      allowNull: true,
    }).catch(() => {});

    await queryInterface.removeColumn(TABLE, "visibility").catch(() => {});
    await queryInterface.removeColumn(TABLE, "pei_objectif_id").catch(() => {});
  },
};
