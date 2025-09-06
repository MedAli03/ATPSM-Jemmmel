"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("enfants", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      nom: { type: Sequelize.STRING(100), allowNull: false },
      prenom: { type: Sequelize.STRING(100), allowNull: false },
      date_naissance: { type: Sequelize.DATEONLY, allowNull: false },
      parent_user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("enfants");
  },
};
