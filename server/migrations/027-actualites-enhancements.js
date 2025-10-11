"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("actualites", "resume", {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: "titre",
    });

    await queryInterface.addColumn("actualites", "contenu_html", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
      after: "contenu",
    });

    await queryInterface.addColumn("actualites", "statut", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "draft",
      after: "contenu_html",
    });

    await queryInterface.addColumn("actualites", "tags", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "statut",
    });

    await queryInterface.addColumn("actualites", "couverture_url", {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: "tags",
    });

    await queryInterface.addColumn("actualites", "galerie_urls", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "couverture_url",
    });

    await queryInterface.addColumn("actualites", "epingle", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: "galerie_urls",
    });

    await queryInterface.changeColumn("actualites", "publie_le", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("actualites", "publie_le", {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.removeColumn("actualites", "epingle");
    await queryInterface.removeColumn("actualites", "galerie_urls");
    await queryInterface.removeColumn("actualites", "couverture_url");
    await queryInterface.removeColumn("actualites", "tags");
    await queryInterface.removeColumn("actualites", "statut");
    await queryInterface.removeColumn("actualites", "contenu_html");
    await queryInterface.removeColumn("actualites", "resume");
  },
};
