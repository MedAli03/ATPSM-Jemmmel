"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("threads", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      created_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      enfant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "enfants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      sujet: { type: Sequelize.STRING(200), allowNull: false },
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
    await queryInterface.addIndex("threads", ["created_by"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("threads");
  },
};
