"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("notifications", {
      name: "idx_notifications_user_unread",
      fields: ["utilisateur_id", "lu_le"],
    });

    await queryInterface.addConstraint("message_read_receipts", {
      fields: ["message_id", "user_id"],
      type: "unique",
      name: "uniq_message_receipt",
    });

    await queryInterface.addIndex("message_read_receipts", {
      name: "idx_receipts_user_read",
      fields: ["user_id", "read_at"],
    });

    await queryInterface.addConstraint("message_attachments", {
      fields: ["message_id", "attachment_id"],
      type: "unique",
      name: "uniq_message_attachment",
    });

    await queryInterface.renameColumn("attachments", "name", "filename").catch(() => {});
    await queryInterface.renameColumn("attachments", "mime", "mime_type").catch(() => {});
    await queryInterface.renameColumn("attachments", "storage_key", "url").catch(() => {});
    await queryInterface.renameColumn("attachments", "size", "size_bytes").catch(() => {});

    await queryInterface.changeColumn("attachments", "url", {
      type: Sequelize.STRING(500),
      allowNull: false,
    });

    await queryInterface.changeColumn("attachments", "filename", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });

    await queryInterface.changeColumn("attachments", "size_bytes", {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.addIndex("attachments", {
      name: "idx_attachments_uploader",
      fields: ["uploader_id"],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("attachments", "idx_attachments_uploader").catch(() => {});

    await queryInterface.changeColumn("attachments", "size_bytes", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    }).catch(() => {});

    await queryInterface.changeColumn("attachments", "filename", {
      type: Sequelize.STRING,
      allowNull: false,
    }).catch(() => {});

    await queryInterface.changeColumn("attachments", "url", {
      type: Sequelize.STRING,
      allowNull: false,
    }).catch(() => {});

    await queryInterface.renameColumn("attachments", "size_bytes", "size").catch(() => {});
    await queryInterface.renameColumn("attachments", "url", "storage_key").catch(() => {});
    await queryInterface.renameColumn("attachments", "mime_type", "mime").catch(() => {});
    await queryInterface.renameColumn("attachments", "filename", "name").catch(() => {});

    await queryInterface.removeConstraint("message_attachments", "uniq_message_attachment").catch(() => {});
    await queryInterface.removeIndex("message_read_receipts", "idx_receipts_user_read").catch(() => {});
    await queryInterface.removeConstraint("message_read_receipts", "uniq_message_receipt").catch(() => {});
    await queryInterface.removeIndex("notifications", "idx_notifications_user_unread").catch(() => {});
  },
};
