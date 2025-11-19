"use strict";

const TABLE = "threads";
const CREATED_BY_FK = "threads_created_by_foreign_idx";

async function describeThreads(queryInterface) {
  try {
    return await queryInterface.describeTable(TABLE);
  } catch (error) {
    throw new Error("La table 'threads' doit exister avant d'appliquer cette migration.");
  }
}

async function ensureColumn(queryInterface, columnName, definition) {
  const tableDefinition = await describeThreads(queryInterface);
  if (Object.prototype.hasOwnProperty.call(tableDefinition, columnName)) {
    return false;
  }
  await queryInterface.addColumn(TABLE, columnName, definition);
  return true;
}

async function dropCreatedByConstraint(queryInterface) {
  try {
    await queryInterface.removeConstraint(TABLE, CREATED_BY_FK);
  } catch (error) {
    const message = error?.message || "";
    const code = error?.original?.code;
    if (
      code === "ER_CANT_DROP_FIELD_OR_KEY" ||
      code === "ER_DROP_INDEX_FK" ||
      /doesn't exist/i.test(message) ||
      /Cannot drop/i.test(message)
    ) {
      return;
    }
    throw error;
  }
}

async function populateCreatedByFromMessages(queryInterface) {
  await queryInterface.sequelize.query(
    `UPDATE ${TABLE} t
     JOIN (
       SELECT thread_id, sender_id
       FROM (
         SELECT id, thread_id, sender_id,
                ROW_NUMBER() OVER (PARTITION BY thread_id ORDER BY created_at, id) AS rn
         FROM messages
       ) ordered
       WHERE rn = 1
     ) first_message ON first_message.thread_id = t.id
     SET t.created_by = first_message.sender_id
     WHERE t.created_by IS NULL`
  );
}

async function populateCreatedByFromParticipants(queryInterface) {
  await queryInterface.sequelize.query(
    `UPDATE ${TABLE} t
     JOIN (
       SELECT thread_id, MIN(user_id) AS user_id
       FROM thread_participants
       GROUP BY thread_id
     ) tp ON tp.thread_id = t.id
     SET t.created_by = tp.user_id
     WHERE t.created_by IS NULL`
  );
}

async function assignFallbackCreator(queryInterface) {
  const [[admin]] = await queryInterface.sequelize.query(
    `SELECT id FROM utilisateurs
     WHERE role IN ('PRESIDENT', 'DIRECTEUR')
     ORDER BY id
     LIMIT 1`
  );

  let fallbackId = admin?.id;

  if (!fallbackId) {
    const [[anyUser]] = await queryInterface.sequelize.query(
      `SELECT id FROM utilisateurs ORDER BY id LIMIT 1`
    );
    fallbackId = anyUser?.id;
  }

  if (!fallbackId) {
    throw new Error(
      "Impossible de valoriser threads.created_by : aucun utilisateur n'existe. Créez un utilisateur avant de relancer la migration."
    );
  }

  await queryInterface.sequelize.query(
    `UPDATE ${TABLE}
     SET created_by = :fallbackId
     WHERE created_by IS NULL`,
    { replacements: { fallbackId } }
  );

  const [[{ missing }]] = await queryInterface.sequelize.query(
    `SELECT COUNT(*) AS missing FROM ${TABLE} WHERE created_by IS NULL`
  );

  if (missing > 0) {
    throw new Error(
      `Impossible de renseigner created_by pour ${missing} threads. Corrigez ces lignes manuellement avant de relancer la migration.`
    );
  }
}

async function populateEnfantId(queryInterface) {
  await queryInterface.sequelize.query(
    `UPDATE ${TABLE} t
     JOIN (
       SELECT tp.thread_id, MIN(pe.enfant_id) AS enfant_id
       FROM thread_participants tp
       INNER JOIN parents_enfants pe ON pe.parent_id = tp.user_id
       WHERE tp.role = 'PARENT'
       GROUP BY tp.thread_id
       HAVING COUNT(DISTINCT pe.enfant_id) = 1
     ) resolved ON resolved.thread_id = t.id
     SET t.enfant_id = resolved.enfant_id
     WHERE t.enfant_id IS NULL`
  );
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "created_by", {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      after: "id",
    });

    await ensureColumn(queryInterface, "enfant_id", {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      after: "created_by",
      references: { model: "enfants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await ensureColumn(queryInterface, "archived_at", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "archived",
    });

    await dropCreatedByConstraint(queryInterface);

    await populateCreatedByFromMessages(queryInterface);
    await populateCreatedByFromParticipants(queryInterface);
    await assignFallbackCreator(queryInterface);

    await populateEnfantId(queryInterface);

    const [[{ missingEnfant }]] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS missingEnfant FROM ${TABLE} WHERE enfant_id IS NULL`
    );

    if (missingEnfant > 0) {
      throw new Error(
        `Impossible d'associer ${missingEnfant} threads à un enfant. Mettez à jour la colonne enfant_id avant de relancer la migration.`
      );
    }

    await queryInterface.changeColumn(TABLE, "enfant_id", {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.changeColumn(TABLE, "created_by", {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.addConstraint(TABLE, {
      fields: ["created_by"],
      type: "foreign key",
      name: CREATED_BY_FK,
      references: { table: "utilisateurs", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addIndex(TABLE, {
      name: "idx_threads_enfant_archived",
      fields: ["enfant_id", "archived_at"],
    });

    await queryInterface.addIndex(TABLE, {
      name: "idx_threads_created_by",
      fields: ["created_by"],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(TABLE, "idx_threads_enfant_archived").catch(() => {});
    await queryInterface.removeIndex(TABLE, "idx_threads_created_by").catch(() => {});

    await queryInterface.removeConstraint(TABLE, CREATED_BY_FK).catch(() => {});

    await queryInterface.changeColumn(TABLE, "created_by", {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addConstraint(TABLE, {
      fields: ["created_by"],
      type: "foreign key",
      name: CREATED_BY_FK,
      references: { table: "utilisateurs", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    }).catch(() => {});

    await queryInterface.changeColumn(TABLE, "enfant_id", {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
    }).catch(() => {});

    await queryInterface.removeColumn(TABLE, "archived_at").catch(() => {});
    await queryInterface.removeColumn(TABLE, "enfant_id").catch(() => {});
  },
};
