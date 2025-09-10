"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("daily_notes", {
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
      date_note: { type: Sequelize.DATEONLY, allowNull: false },
      contenu: { type: Sequelize.TEXT, allowNull: true },
      type: { type: Sequelize.STRING(50), allowNull: true },
      pieces_jointes: { type: Sequelize.TEXT, allowNull: true },
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
    await queryInterface.addIndex("daily_notes", ["projet_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("daily_notes");
  },
};
