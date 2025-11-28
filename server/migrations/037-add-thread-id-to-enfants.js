"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("enfants", "thread_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "threads", key: "id" },
      onUpdate: "SET NULL",
      onDelete: "SET NULL",
    });
    await queryInterface.addIndex("enfants", ["thread_id"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("enfants", ["thread_id"]).catch(() => {});
    await queryInterface.removeColumn("enfants", "thread_id").catch(() => {});
  },
};
