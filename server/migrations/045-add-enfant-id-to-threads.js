"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("threads", "enfant_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "enfants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      after: "created_by",
    });

    await queryInterface.addConstraint("threads", {
      fields: ["enfant_id"],
      type: "foreign key",
      name: "threads_enfant_id_fk",
      references: { table: "enfants", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("threads", "threads_enfant_id_fk").catch(() => {});
    await queryInterface.removeColumn("threads", "enfant_id").catch(() => {});
  },
};
