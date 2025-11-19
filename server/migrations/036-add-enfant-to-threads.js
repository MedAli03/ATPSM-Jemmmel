"use strict";

const TABLE = "threads";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addColumn(
        TABLE,
        "enfant_id",
        {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          references: { model: "enfants", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        { transaction: t }
      );
      await queryInterface.addIndex(TABLE, {
        name: "idx_threads_enfant",
        fields: ["enfant_id"],
        transaction: t,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeIndex(TABLE, "idx_threads_enfant", { transaction: t }).catch(
        () => {}
      );
      await queryInterface.removeColumn(TABLE, "enfant_id", { transaction: t });
    });
  },
};
