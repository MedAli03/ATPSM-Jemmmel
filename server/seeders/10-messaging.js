"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[parent]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='parent@asso.tn' LIMIT 1"
    );
    const [[educateur]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educateur@asso.tn' LIMIT 1"
    );
    const [[child]] = await queryInterface.sequelize.query(
      "SELECT id, prenom, nom FROM enfants WHERE nom='Sami' LIMIT 1"
    );
    if (!parent || !educateur || !child) {
      return;
    }

    const title = `محادثة ${child.prenom}`;
    const [[existingThread]] = await queryInterface.sequelize.query(
      "SELECT id FROM threads WHERE title = ? LIMIT 1",
      { replacements: [title] }
    );
    if (existingThread) {
      return;
    }

    await queryInterface.bulkInsert("threads", [
      {
        title,
        enfant_id: child.id,
        is_group: false,
        archived: false,
        last_message_id: null,
        created_at: now,
        updated_at: now,
      },
    ]);
    const [[thread]] = await queryInterface.sequelize.query(
      "SELECT id FROM threads WHERE title = ? ORDER BY id DESC LIMIT 1",
      { replacements: [title] }
    );
    if (!thread) {
      return;
    }

    await queryInterface.bulkInsert("thread_participants", [
      {
        thread_id: thread.id,
        user_id: parent.id,
        role: "PARENT",
        joined_at: now,
        left_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        thread_id: thread.id,
        user_id: educateur.id,
        role: "EDUCATEUR",
        joined_at: now,
        left_at: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("messages", [
      {
        thread_id: thread.id,
        sender_id: parent.id,
        kind: "text",
        text: "مرحبًا، كيف كان يوم سامي اليوم؟",
        created_at: now,
        updated_at: now,
      },
      {
        thread_id: thread.id,
        sender_id: educateur.id,
        kind: "text",
        text: "مرحبًا، كان نشيطًا وتواصل باستخدام البطاقات المصورة.",
        created_at: new Date(now.getTime() + 60000),
        updated_at: new Date(now.getTime() + 60000),
      },
    ]);

    const [[lastMessage]] = await queryInterface.sequelize.query(
      "SELECT id FROM messages WHERE thread_id = ? ORDER BY id DESC LIMIT 1",
      { replacements: [thread.id] }
    );
    if (lastMessage?.id) {
      await queryInterface.bulkUpdate(
        "threads",
        { last_message_id: lastMessage.id, updated_at: new Date() },
        { id: thread.id }
      );
    }
  },
  async down(queryInterface) {
    const title = "محادثة Ahmed";
    await queryInterface.sequelize.transaction(async (t) => {
      const [[thread]] = await queryInterface.sequelize.query(
        "SELECT id, title FROM threads WHERE title = ? LIMIT 1",
        { transaction: t, replacements: [title] }
      );
      if (!thread) return;
      await queryInterface.bulkDelete("messages", { thread_id: thread.id }, { transaction: t });
      await queryInterface.bulkDelete("thread_participants", { thread_id: thread.id }, { transaction: t });
      await queryInterface.bulkDelete("threads", { id: thread.id }, { transaction: t });
    });
  },
};
