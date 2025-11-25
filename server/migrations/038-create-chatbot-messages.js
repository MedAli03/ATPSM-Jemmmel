"use strict";

const TABLE = "chatbot_messages";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE, {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      educator_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      child_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "enfants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      answer: {
        type: Sequelize.TEXT("long"),
        allowNull: false,
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

    await queryInterface.addIndex(TABLE, { fields: ["educator_id"] });
    await queryInterface.addIndex(TABLE, { fields: ["child_id"] });
    await queryInterface.addIndex(TABLE, { fields: ["created_at"] });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE);
  },
};
