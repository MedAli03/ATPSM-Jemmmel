"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("groupes", "code", {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: "id",
    });

    await queryInterface.addColumn("groupes", "capacite", {
      type: Sequelize.SMALLINT.UNSIGNED,
      allowNull: true,
      after: "description",
    });

    await queryInterface.sequelize.query(
      `UPDATE groupes SET code = CONCAT('GRP-', id) WHERE code IS NULL`
    );

    await queryInterface.addConstraint("groupes", {
      fields: ["code"],
      type: "unique",
      name: "uniq_groupes_code",
    });

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
      effectif_max: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: true,
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
         WHERE est_active = 1
       ) ae ON ae.groupe_id = g.id AND ae.annee_id = g.annee_id`
    );

    await queryInterface.addColumn("inscriptions_enfants", "groupe_annee_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      after: "groupe_id",
      references: { model: "groupes_annees", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addColumn("inscriptions_enfants", "statut", {
      type: Sequelize.ENUM("ACTIVE", "SUSPENDU", "TERMINE"),
      allowNull: false,
      defaultValue: "ACTIVE",
      after: "date_sortie",
    });

    await queryInterface.sequelize.query(
      `UPDATE inscriptions_enfants ie
       JOIN groupes_annees ga ON ga.groupe_id = ie.groupe_id AND ga.annee_id = ie.annee_id
       SET ie.groupe_annee_id = ga.id`
    );

    await queryInterface.sequelize.query(
      `UPDATE inscriptions_enfants
       SET statut = CASE WHEN est_active = 1 THEN 'ACTIVE' ELSE 'TERMINE' END`
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

    await queryInterface.removeIndex("inscriptions_enfants", "idx_inscriptions_annee_active").catch(() => {});
    await queryInterface.removeConstraint("inscriptions_enfants", "uniq_enfant_annee_active").catch(() => {});

    await queryInterface.renameColumn("inscriptions_enfants", "est_active", "is_active").catch(() => {});

    await queryInterface.addConstraint("inscriptions_enfants", {
      fields: ["enfant_id", "annee_id", "is_active"],
      type: "unique",
      name: "uniq_inscription_enfant_annee_active",
    });

    await queryInterface.addIndex("inscriptions_enfants", {
      name: "idx_inscription_groupe_annee",
      fields: ["groupe_annee_id", "statut"],
    });

    await queryInterface.removeColumn("inscriptions_enfants", "groupe_id").catch(() => {});

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
    await queryInterface.renameColumn("affectations_educateurs", "date_fin_affectation", "date_fin").catch(() => {});
    await queryInterface.renameColumn("affectations_educateurs", "est_active", "is_active").catch(() => {});

    await queryInterface.addConstraint("affectations_educateurs", {
      fields: ["groupe_annee_id", "is_active"],
      type: "unique",
      name: "uniq_affectation_groupe_active",
    });

    await queryInterface.addConstraint("affectations_educateurs", {
      fields: ["groupe_annee_id", "educateur_id", "date_debut"],
      type: "unique",
      name: "uniq_affectation_history",
    });

    await queryInterface.removeColumn("groupes", "annee_id").catch(() => {});
    await queryInterface.removeColumn("groupes", "statut").catch(() => {});

    await queryInterface.removeColumn("affectations_educateurs", "groupe_id").catch(() => {});
    await queryInterface.removeColumn("affectations_educateurs", "annee_id").catch(() => {});
  },

  async down(queryInterface) {
    throw new Error("Cette migration est irréversible automatiquement.");
  },
};
