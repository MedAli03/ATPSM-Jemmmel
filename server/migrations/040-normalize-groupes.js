"use strict";

// This migration normalizes group data into a groupe_annee bridge and aligns
// inscriptions/affectations with that bridge without referencing deprecated columns.

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Strengthen groupes with a code + capacity
    await queryInterface.addColumn("groupes", "code", {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: "id",
    }).catch(() => {});

    await queryInterface.addColumn("groupes", "capacite", {
      type: Sequelize.SMALLINT.UNSIGNED,
      allowNull: true,
      after: "description",
    }).catch(() => {});

    await queryInterface.sequelize.query(
      `UPDATE groupes SET code = CONCAT('GRP-', id) WHERE code IS NULL`
    );

    await queryInterface.addConstraint("groupes", {
      fields: ["code"],
      type: "unique",
      name: "uniq_groupes_code",
    }).catch(() => {});

    // 2) Create groupes_annees bridge
    await queryInterface.createTable("groupes_annees", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      groupe_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "groupes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      annee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "annees_scolaires", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      educateur_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      statut: {
        type: Sequelize.ENUM("OUVERT", "FERME"),
        allowNull: false,
        defaultValue: "OUVERT",
      },
      effectif_max: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
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

    await queryInterface.addConstraint("groupes_annees", {
      fields: ["groupe_id", "annee_id"],
      type: "unique",
      name: "uniq_groupe_annee",
    });

    await queryInterface.addIndex("groupes_annees", {
      name: "idx_groupes_annees_annee",
      fields: ["annee_id", "statut"],
    });

    await queryInterface.addIndex("groupes_annees", {
      name: "idx_groupes_annees_educateur",
      fields: ["educateur_id", "annee_id"],
    });

    // Seed groupes_annees from existing groups and active educator assignments
    await queryInterface.sequelize.query(
      `INSERT INTO groupes_annees (groupe_id, annee_id, educateur_id, statut, effectif_max, created_at, updated_at)
       SELECT g.id,
              g.annee_id,
              ae.educateur_id,
              CASE WHEN g.statut = 'archive' THEN 'FERME' ELSE 'OUVERT' END,
              g.capacite,
              COALESCE(g.created_at, NOW()),
              COALESCE(g.updated_at, NOW())
       FROM groupes g
       LEFT JOIN (
         SELECT groupe_id, annee_id, educateur_id
         FROM affectations_educateurs
       ) ae ON ae.groupe_id = g.id AND ae.annee_id = g.annee_id`
    );

    // 3) Inscriptions: link to groupes_annees
    await queryInterface.addColumn("inscriptions_enfants", "groupe_annee_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      after: "groupe_id",
      references: { model: "groupes_annees", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Align date columns and statuses
    await queryInterface.renameColumn("inscriptions_enfants", "date_inscription", "date_entree").catch(() => {});
    await queryInterface.addColumn("inscriptions_enfants", "date_sortie", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "date_entree",
    }).catch(() => {});

    await queryInterface.addColumn("inscriptions_enfants", "statut", {
      type: Sequelize.ENUM("ACTIVE", "SUSPENDU", "TERMINE"),
      allowNull: false,
      defaultValue: "ACTIVE",
      after: "date_sortie",
    }).catch(() => {});

    await queryInterface.sequelize.query(
      `UPDATE inscriptions_enfants ie
       JOIN groupes_annees ga ON ga.groupe_id = ie.groupe_id AND ga.annee_id = ie.annee_id
       SET ie.groupe_annee_id = ga.id`
    );

    const [[{ remaining }]] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS remaining FROM inscriptions_enfants WHERE groupe_annee_id IS NULL`
    );

    if (remaining > 0) {
      throw new Error(`Impossible de retrouver le groupe/annee pour ${remaining} inscriptions.`);
    }

    await queryInterface.changeColumn("inscriptions_enfants", "groupe_annee_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.removeConstraint("inscriptions_enfants", "uniq_enfant_annee").catch(() => {});
    await queryInterface.removeIndex("inscriptions_enfants", ["groupe_id"]).catch(() => {});

    await queryInterface.addConstraint("inscriptions_enfants", {
      fields: ["enfant_id", "annee_id", "statut"],
      type: "unique",
      name: "uniq_inscription_enfant_annee_statut",
    });

    await queryInterface.addIndex("inscriptions_enfants", {
      name: "idx_inscription_groupe_annee",
      fields: ["groupe_annee_id", "statut"],
    });

    await queryInterface.removeColumn("inscriptions_enfants", "groupe_id").catch(() => {});

    // 4) Affectations: link to groupes_annees
    await queryInterface.addColumn("affectations_educateurs", "groupe_annee_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      after: "groupe_id",
      references: { model: "groupes_annees", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.sequelize.query(
      `UPDATE affectations_educateurs ae
       JOIN groupes_annees ga ON ga.groupe_id = ae.groupe_id AND ga.annee_id = ae.annee_id
       SET ae.groupe_annee_id = ga.id`
    );

    await queryInterface.changeColumn("affectations_educateurs", "groupe_annee_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.renameColumn("affectations_educateurs", "date_affectation", "date_debut").catch(() => {});
    await queryInterface.addColumn("affectations_educateurs", "date_fin", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "date_debut",
    }).catch(() => {});
    await queryInterface.addColumn("affectations_educateurs", "is_active", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      after: "date_fin",
    }).catch(() => {});

    await queryInterface.removeConstraint("affectations_educateurs", "uniq_educateur_annee").catch(() => {});
    await queryInterface.removeConstraint("affectations_educateurs", "uniq_groupe_annee").catch(() => {});

    await queryInterface.addConstraint("affectations_educateurs", {
      fields: ["groupe_annee_id", "is_active"],
      type: "unique",
      name: "uniq_affectation_groupe_active",
    });

    await queryInterface.addConstraint("affectations_educateurs", {
      fields: ["groupe_annee_id", "educateur_id"],
      type: "unique",
      name: "uniq_affectation_groupe_educateur",
    });

    await queryInterface.removeColumn("affectations_educateurs", "groupe_id").catch(() => {});
    await queryInterface.removeColumn("affectations_educateurs", "annee_id").catch(() => {});
  },

  async down() {
    throw new Error("Cette migration est irreversible automatiquement.");
  },
};
