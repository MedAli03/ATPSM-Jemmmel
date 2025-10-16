"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("thread_participants", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      thread_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "threads", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      utilisateur_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      last_read_at: {
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

    await queryInterface.addConstraint("thread_participants", {
      type: "unique",
      fields: ["thread_id", "utilisateur_id"],
      name: "uniq_thread_participant",
    });

    await queryInterface.addIndex("thread_participants", ["thread_id"]);
    await queryInterface.addIndex("thread_participants", ["utilisateur_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("thread_participants");
  },
};
