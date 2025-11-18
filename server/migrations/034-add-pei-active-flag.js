"use strict";

const TABLE = "projet_educatif_individuel";
const INDEX = "uniq_pei_enfant_annee_actif";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addColumn(
        TABLE,
        "est_actif",
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: null,
          after: "statut",
        },
        { transaction: t }
      );

      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET est_actif = NULL`,
        { transaction: t }
      );

      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} pei
         JOIN (
           SELECT MAX(id) AS id
           FROM ${TABLE}
           WHERE statut = 'VALIDE'
           GROUP BY enfant_id, annee_id
         ) last_valid ON last_valid.id = pei.id
         SET pei.est_actif = 1`,
        { transaction: t }
      );

      await queryInterface.addIndex(
        TABLE,
        ["enfant_id", "annee_id", "est_actif"],
        { unique: true, name: INDEX, transaction: t }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeIndex(TABLE, INDEX, { transaction: t }).catch(
        () => {}
      );
      await queryInterface.removeColumn(TABLE, "est_actif", { transaction: t });
    });
  },
};
