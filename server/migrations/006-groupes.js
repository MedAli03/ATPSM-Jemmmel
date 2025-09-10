"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("groupes", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      annee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "annees_scolaires", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nom: { type: Sequelize.STRING(120), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      statut: {
        type: Sequelize.ENUM("actif", "archive"),
        allowNull: false,
        defaultValue: "actif",
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
    await queryInterface.addIndex("groupes", ["annee_id"]);
    await queryInterface.addIndex("groupes", ["statut"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("groupes");
  },
};
