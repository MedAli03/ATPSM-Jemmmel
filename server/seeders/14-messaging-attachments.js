"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[educateur]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educateur@asso.tn' LIMIT 1"
    );
    const [[parent]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='parent@asso.tn' LIMIT 1"
    );
    const [[message1]] = await queryInterface.sequelize.query(
      "SELECT id FROM messages WHERE text LIKE ? ORDER BY id ASC LIMIT 1",
      { replacements: ["%كيف كان يوم سامي%"] }
    );
    const [[message2]] = await queryInterface.sequelize.query(
      "SELECT id FROM messages WHERE text LIKE ? ORDER BY id DESC LIMIT 1",
      { replacements: ["%كان نشيطًا وتواصل%"] }
    );

    if (!educateur || !parent || !message1 || !message2) return;

    await queryInterface.bulkInsert("attachments", [
      {
        uploader_id: educateur.id,
        name: "fiche-activite.pdf",
        mime: "application/pdf",
        size: 123456,
        storage_key: "docs/fiche-activite.pdf",
        created_at: now,
        updated_at: now,
      },
      {
        uploader_id: parent.id,
        name: "dessin-sami.jpg",
        mime: "image/jpeg",
        size: 34567,
        storage_key: "uploads/dessin-sami.jpg",
        created_at: now,
        updated_at: now,
      },
    ]);

    const [attachments] = await queryInterface.sequelize.query(
      "SELECT id, storage_key FROM attachments WHERE storage_key IN ('docs/fiche-activite.pdf','uploads/dessin-sami.jpg')"
    );
    const attachmentId = Object.fromEntries(
      attachments.map((a) => [a.storage_key, a.id])
    );

    const messageAttachments = [];
    if (attachmentId["docs/fiche-activite.pdf"]) {
      messageAttachments.push({
        message_id: message2.id,
        attachment_id: attachmentId["docs/fiche-activite.pdf"],
        created_at: now,
        updated_at: now,
      });
    }
    if (attachmentId["uploads/dessin-sami.jpg"]) {
      messageAttachments.push({
        message_id: message1.id,
        attachment_id: attachmentId["uploads/dessin-sami.jpg"],
        created_at: now,
        updated_at: now,
      });
    }
    if (messageAttachments.length) {
      await queryInterface.bulkInsert("message_attachments", messageAttachments);
    }

    await queryInterface.bulkInsert("message_read_receipts", [
      {
        message_id: message1.id,
        user_id: educateur.id,
        read_at: new Date(now.getTime() + 120000),
        created_at: now,
        updated_at: now,
      },
      {
        message_id: message2.id,
        user_id: parent.id,
        read_at: new Date(now.getTime() + 180000),
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    const [messages] = await queryInterface.sequelize.query(
      "SELECT id FROM messages WHERE text LIKE ? OR text LIKE ?",
      {
        replacements: ["%كيف كان يوم سامي%", "%كان نشيطًا وتواصل%"],
      }
    );
    const messageIds = messages.map((m) => m.id);

    if (messageIds.length) {
      await queryInterface.bulkDelete("message_read_receipts", {
        message_id: messageIds,
      });
      await queryInterface.bulkDelete("message_attachments", {
        message_id: messageIds,
      });
    }

    await queryInterface.bulkDelete("attachments", {
      storage_key: ["docs/fiche-activite.pdf", "uploads/dessin-sami.jpg"],
    });
  },
};
