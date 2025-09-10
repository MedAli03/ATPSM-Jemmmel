"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("documents", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      admin_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      type: {
        type: Sequelize.ENUM("reglement", "autre"),
        allowNull: false,
        defaultValue: "autre",
      },
      titre: { type: Sequelize.STRING(200), allowNull: false },
      url: { type: Sequelize.STRING(255), allowNull: true },
      statut: {
        type: Sequelize.ENUM("brouillon", "publie"),
        allowNull: false,
        defaultValue: "brouillon",
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
  },
  async down(queryInterface) {
    await queryInterface.dropTable("documents");
  },
};
