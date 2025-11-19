"use strict";

const TABLE = "projet_educatif_individuel";
const COLUMN = "statut";
const NEW_STATUSES = [
  "EN_ATTENTE_VALIDATION",
  "VALIDE",
  "CLOTURE",
  "REFUSE",
];
const OLD_STATUSES = ["brouillon", "actif", "clos"];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.changeColumn(
        TABLE,
        COLUMN,
        {
          type: Sequelize.ENUM(...OLD_STATUSES, ...NEW_STATUSES),
          allowNull: false,
          defaultValue: "EN_ATTENTE_VALIDATION",
        },
        { transaction: t }
      );

      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET ${COLUMN} = 'VALIDE' WHERE ${COLUMN} IN ('actif','VALIDE')`,
        { transaction: t }
      );
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET ${COLUMN} = 'CLOTURE' WHERE ${COLUMN} IN ('clos','CLOTURE')`,
        { transaction: t }
      );
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET ${COLUMN} = 'EN_ATTENTE_VALIDATION' WHERE ${COLUMN} NOT IN ('VALIDE','CLOTURE','REFUSE')`,
        { transaction: t }
      );

      await queryInterface.changeColumn(
        TABLE,
        COLUMN,
        {
          type: Sequelize.ENUM(...NEW_STATUSES),
          allowNull: false,
          defaultValue: "EN_ATTENTE_VALIDATION",
        },
        { transaction: t }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.changeColumn(
        TABLE,
        COLUMN,
        {
          type: Sequelize.ENUM(...OLD_STATUSES, ...NEW_STATUSES),
          allowNull: false,
          defaultValue: "brouillon",
        },
        { transaction: t }
      );

      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET ${COLUMN} = 'actif' WHERE ${COLUMN} = 'VALIDE'`,
        { transaction: t }
      );
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET ${COLUMN} = 'clos' WHERE ${COLUMN} IN ('CLOTURE')`,
        { transaction: t }
      );
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET ${COLUMN} = 'brouillon' WHERE ${COLUMN} NOT IN ('actif','clos')`,
        { transaction: t }
      );

      await queryInterface.changeColumn(
        TABLE,
        COLUMN,
        {
          type: Sequelize.ENUM(...OLD_STATUSES),
          allowNull: false,
          defaultValue: "brouillon",
        },
        { transaction: t }
      );
    });
  },
};
