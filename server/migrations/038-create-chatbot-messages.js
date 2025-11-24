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
      utilisateur_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      role: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      reply: {
        type: Sequelize.TEXT("long"),
        allowNull: false,
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: "llama2",
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

    await queryInterface.addIndex(TABLE, { fields: ["utilisateur_id"] });
    await queryInterface.addIndex(TABLE, { fields: ["created_at"] });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE);
  },
};
