"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("parent_child_read_states", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      parent_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      child_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "enfants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      last_daily_note_seen_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_message_seen_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addConstraint("parent_child_read_states", {
      fields: ["parent_id", "child_id"],
      type: "unique",
      name: "uniq_parent_child_read_state",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("parent_child_read_states");
  },
};
