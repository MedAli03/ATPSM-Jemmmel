"use strict";

const TABLE = "projet_educatif_individuel";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addColumn(
        TABLE,
        "valide_par_id",
        {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          references: { model: "utilisateurs", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        { transaction: t }
      );

      await queryInterface.addColumn(
        TABLE,
        "date_validation",
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction: t }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeColumn(TABLE, "date_validation", { transaction: t });
      await queryInterface.removeColumn(TABLE, "valide_par_id", { transaction: t });
    });
  },
};
