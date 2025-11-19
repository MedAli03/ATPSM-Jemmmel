"use strict";

async function migrateReglements(queryInterface) {
  await queryInterface.sequelize.query(
    `UPDATE documents d
     JOIN reglements r ON r.document_id = d.id
     SET d.type = 'REGLEMENT',
         d.contenu = CONCAT('Version: ', r.version, '\nDate effet: ', DATE_FORMAT(r.date_effet, '%Y-%m-%d'), '\n', COALESCE(d.contenu, '')),
         d.visible_from = COALESCE(d.visible_from, r.date_effet)`
  );
}

async function migrateEvenements(queryInterface) {
  await queryInterface.sequelize.query(
    `INSERT INTO documents (created_by, type, titre, contenu, fichier_url, audience_scope, visible_from, visible_to, is_archived, created_at, updated_at, legacy_source_table, legacy_source_id)
     SELECT admin_id,
            'EVENEMENT',
            titre,
            CONCAT(COALESCE(description, ''), '\nLieu: ', COALESCE(lieu, '')),
            NULL,
            CASE WHEN audience = 'tous' THEN 'TOUS' ELSE 'ROLE' END,
            debut,
            fin,
            0,
            created_at,
            updated_at,
            'evenements',
            id
     FROM evenements`
  );

  await queryInterface.sequelize.query(
    `INSERT INTO document_roles (document_id, role, created_at, updated_at)
     SELECT d.id,
            CASE WHEN e.audience = 'parents' THEN 'PARENT' ELSE 'EDUCATEUR' END,
            NOW(),
            NOW()
     FROM documents d
     JOIN evenements e ON d.legacy_source_table = 'evenements' AND d.legacy_source_id = e.id
     WHERE e.audience IN ('parents', 'educateurs')`
  );
}

async function migrateActualites(queryInterface) {
  await queryInterface.sequelize.query(
    `INSERT INTO documents (created_by, type, titre, contenu, fichier_url, audience_scope, visible_from, visible_to, is_archived, created_at, updated_at, legacy_source_table, legacy_source_id)
     SELECT admin_id,
            'ACTUALITE',
            titre,
            CONCAT('Résumé: ', COALESCE(resume, ''), '\nContenu: ', COALESCE(contenu, ''), '\nTags: ', COALESCE(JSON_EXTRACT(tags, '$'), '[]')),
            couverture_url,
            'TOUS',
            publie_le,
            NULL,
            CASE WHEN statut = 'draft' THEN 1 ELSE 0 END,
            created_at,
            updated_at,
            'actualites',
            id
     FROM actualites`
  );
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("documents", "admin_id", "created_by").catch(() => {});
    await queryInterface.renameColumn("documents", "url", "fichier_url").catch(() => {});

    await queryInterface.addColumn("documents", "contenu", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "titre",
    });

    await queryInterface.addColumn("documents", "audience_scope", {
      type: Sequelize.ENUM("TOUS", "ROLE", "GROUPE", "ENFANT"),
      allowNull: false,
      defaultValue: "TOUS",
      after: "type",
    });

    await queryInterface.addColumn("documents", "visible_from", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("documents", "visible_to", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("documents", "is_archived", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("documents", "legacy_source_table", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn("documents", "legacy_source_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
    });

    await queryInterface.changeColumn("documents", "type", {
      type: Sequelize.ENUM("DOCUMENT", "REGLEMENT", "EVENEMENT", "ACTUALITE"),
      allowNull: false,
      defaultValue: "DOCUMENT",
    });

    await queryInterface.sequelize.query(
      `UPDATE documents
       SET type = CASE WHEN type = 'reglement' THEN 'REGLEMENT' ELSE 'DOCUMENT' END,
           audience_scope = 'TOUS'`
    );

    await queryInterface.addIndex("documents", {
      name: "idx_documents_type_audience",
      fields: ["type", "audience_scope"],
    });

    await queryInterface.addIndex("documents", {
      name: "idx_documents_visibility",
      fields: ["visible_from", "visible_to"],
    });

    await queryInterface.createTable("document_roles", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      document_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "documents", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      role: {
        type: Sequelize.ENUM("PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT", "VISITEUR"),
        allowNull: false,
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await queryInterface.addConstraint("document_roles", {
      fields: ["document_id", "role"],
      type: "unique",
      name: "uniq_document_role",
    });

    await queryInterface.createTable("document_groupes", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      document_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "documents", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      groupe_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "groupes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await queryInterface.addConstraint("document_groupes", {
      fields: ["document_id", "groupe_id"],
      type: "unique",
      name: "uniq_document_groupe",
    });

    await queryInterface.createTable("document_enfants", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      document_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "documents", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      enfant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "enfants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await queryInterface.addConstraint("document_enfants", {
      fields: ["document_id", "enfant_id"],
      type: "unique",
      name: "uniq_document_enfant",
    });

    await migrateReglements(queryInterface);
    await migrateEvenements(queryInterface);
    await migrateActualites(queryInterface);

    await queryInterface.dropTable("reglements").catch(() => {});
    await queryInterface.dropTable("evenements").catch(() => {});
    await queryInterface.dropTable("actualites").catch(() => {});

    await queryInterface.removeColumn("documents", "legacy_source_table").catch(() => {});
    await queryInterface.removeColumn("documents", "legacy_source_id").catch(() => {});
  },

  async down() {
    throw new Error("Revenir en arrière nécessiterait une restauration manuelle des anciennes tables actualites/evenements/reglements.");
  },
};
