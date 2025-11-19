"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("enfants", "numero_dossier", {
      type: Sequelize.STRING(30),
      allowNull: true,
      after: "id",
    });

    await queryInterface.addColumn("enfants", "genre", {
      type: Sequelize.ENUM("F", "M", "AUTRE"),
      allowNull: true,
      after: "date_naissance",
    });

    await queryInterface.addColumn("enfants", "statut", {
      type: Sequelize.ENUM("ACTIF", "INACTIF"),
      allowNull: false,
      defaultValue: "ACTIF",
      after: "genre",
    });

    await queryInterface.addColumn("enfants", "date_inscription", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "statut",
    });

    await queryInterface.addColumn("enfants", "notes_confidentielles", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "date_inscription",
    });

    await queryInterface.addColumn("enfants", "created_by", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      after: "notes_confidentielles",
      references: { model: "utilisateurs", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.sequelize.query(
      `UPDATE enfants
       SET numero_dossier = CONCAT('ENF-', LPAD(id, 6, '0'))
       WHERE numero_dossier IS NULL`
    );

    await queryInterface.sequelize.query(
      `UPDATE enfants
       SET date_inscription = COALESCE(date_inscription, created_at, NOW())`
    );

    await queryInterface.sequelize.query(
      `UPDATE enfants
       SET created_by = (
         SELECT id
         FROM utilisateurs
         ORDER BY id
         LIMIT 1
       )
       WHERE created_by IS NULL`
    );

    const [[{ missing }]] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS missing FROM enfants WHERE created_by IS NULL`
    );

    if (missing > 0) {
      throw new Error("Impossible de déterminer created_by pour certains enfants.");
    }

    await queryInterface.changeColumn("enfants", "created_by", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.addConstraint("enfants", {
      fields: ["numero_dossier"],
      type: "unique",
      name: "uniq_enfants_numero_dossier",
    });

    await queryInterface.addIndex("enfants", {
      name: "idx_enfants_statut",
      fields: ["statut"],
    });

    await queryInterface.addIndex("enfants", {
      name: "idx_enfants_date_inscription",
      fields: ["date_inscription"],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("enfants", "idx_enfants_date_inscription").catch(() => {});
    await queryInterface.removeIndex("enfants", "idx_enfants_statut").catch(() => {});
    await queryInterface.removeConstraint("enfants", "uniq_enfants_numero_dossier").catch(() => {});

    await queryInterface.removeColumn("enfants", "created_by").catch(() => {});
    await queryInterface.removeColumn("enfants", "notes_confidentielles").catch(() => {});
    await queryInterface.removeColumn("enfants", "date_inscription").catch(() => {});
    await queryInterface.removeColumn("enfants", "statut").catch(() => {});
    await queryInterface.removeColumn("enfants", "genre").catch(() => {});
    await queryInterface.removeColumn("enfants", "numero_dossier").catch(() => {});
  },
};
