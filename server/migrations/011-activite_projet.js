"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("activite_projet", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      projet_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "projet_educatif_individuel", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      educateur_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      enfant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "enfants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      date_activite: { type: Sequelize.DATE, allowNull: true },
      titre: { type: Sequelize.STRING(150), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      objectifs: { type: Sequelize.TEXT, allowNull: true },
      type: {
        type: Sequelize.ENUM("atelier", "jeu", "autre"),
        allowNull: false,
        defaultValue: "autre",
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
    await queryInterface.addIndex("activite_projet", ["projet_id"]);
    await queryInterface.addIndex("activite_projet", ["enfant_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("activite_projet");
  },
};
