"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("observation_initiale", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      enfant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "enfants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      educateur_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      date_observation: { type: Sequelize.DATE, allowNull: false },
      contenu: { type: Sequelize.TEXT, allowNull: true },
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
    await queryInterface.addIndex("observation_initiale", ["enfant_id"]);
    await queryInterface.addIndex("observation_initiale", ["educateur_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("observation_initiale");
  },
};
