"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("utilisateur_sessions", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      utilisateur_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "utilisateurs",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      user_agent: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      browser: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      os: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      device: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      ip_address: {
        type: Sequelize.STRING(45),
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
    await queryInterface.addIndex("utilisateur_sessions", ["utilisateur_id"]);
    await queryInterface.addIndex("utilisateur_sessions", ["created_at"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("utilisateur_sessions");
  },
};
