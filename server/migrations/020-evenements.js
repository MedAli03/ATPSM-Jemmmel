"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("evenements", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      document_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "documents", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      admin_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      titre: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      debut: { type: Sequelize.DATE, allowNull: false },
      fin: { type: Sequelize.DATE, allowNull: false },
      audience: {
        type: Sequelize.ENUM("parents", "educateurs", "tous"),
        allowNull: false,
        defaultValue: "tous",
      },
      lieu: { type: Sequelize.STRING(200), allowNull: true },
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
    await queryInterface.dropTable("evenements");
  },
};
