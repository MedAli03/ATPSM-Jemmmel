"use strict";

const TABLE = "annees_scolaires";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex(TABLE, ["date_debut"], {
      name: "idx_annees_date_debut",
    });
    await queryInterface.addIndex(TABLE, ["date_fin"], {
      name: "idx_annees_date_fin",
    });
    await queryInterface.addIndex(TABLE, ["est_active"], {
      name: "idx_annees_est_active",
    });
    await queryInterface.addIndex(TABLE, ["statut"], {
      name: "idx_annees_statut",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(TABLE, "idx_annees_statut").catch(() => {});
    await queryInterface.removeIndex(TABLE, "idx_annees_est_active").catch(() => {});
    await queryInterface.removeIndex(TABLE, "idx_annees_date_fin").catch(() => {});
    await queryInterface.removeIndex(TABLE, "idx_annees_date_debut").catch(() => {});
  },
};
