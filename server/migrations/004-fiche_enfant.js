"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("fiche_enfant", {
      enfant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        references: { model: "enfants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // fiche suit la vie de l'enfant
      },
      lieu_naissance: { type: Sequelize.STRING(150), allowNull: true },
      diagnostic_medical: { type: Sequelize.TEXT, allowNull: true },
      nb_freres: { type: Sequelize.INTEGER, allowNull: true },
      nb_soeurs: { type: Sequelize.INTEGER, allowNull: true },
      rang_enfant: { type: Sequelize.INTEGER, allowNull: true },
      situation_familiale: {
        type: Sequelize.ENUM(
          "deux_parents",
          "pere_seul",
          "mere_seule",
          "autre"
        ),
        allowNull: true,
      },
      diag_auteur_nom: { type: Sequelize.STRING(150), allowNull: true },
      diag_auteur_description: { type: Sequelize.TEXT, allowNull: true },
      carte_invalidite_numero: { type: Sequelize.STRING(100), allowNull: true },
      carte_invalidite_couleur: { type: Sequelize.STRING(50), allowNull: true },
      type_handicap: { type: Sequelize.STRING(150), allowNull: true },
      troubles_principaux: { type: Sequelize.TEXT, allowNull: true },
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
  },
  async down(queryInterface) {
    await queryInterface.dropTable("fiche_enfant");
  },
};
