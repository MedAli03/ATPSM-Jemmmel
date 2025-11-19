"use strict";

const OBS_TABLE = "observation_initiale";
const NOTES_TABLE = "daily_notes";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.sequelize.query(
        `UPDATE ${OBS_TABLE} SET contenu='{}' WHERE contenu IS NULL`,
        { transaction: t }
      );

      await queryInterface.changeColumn(
        OBS_TABLE,
        "contenu",
        {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        { transaction: t }
      );

      await queryInterface.addIndex(
        NOTES_TABLE,
        ["enfant_id"],
        { name: "idx_daily_notes_enfant", transaction: t }
      );

      await queryInterface.addIndex(
        NOTES_TABLE,
        ["date_note"],
        { name: "idx_daily_notes_date", transaction: t }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeIndex(NOTES_TABLE, "idx_daily_notes_enfant", { transaction: t }).catch(() => {});
      await queryInterface.removeIndex(NOTES_TABLE, "idx_daily_notes_date", { transaction: t }).catch(() => {});

      await queryInterface.changeColumn(
        OBS_TABLE,
        "contenu",
        {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        { transaction: t }
      );
    });
  },
};
