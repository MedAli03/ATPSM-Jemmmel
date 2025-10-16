"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("message_attachments", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      message_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "messages", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      size: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      storage_path: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      public_url: {
        type: Sequelize.STRING(255),
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

    await queryInterface.addIndex("message_attachments", ["message_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("message_attachments");
  },
};
