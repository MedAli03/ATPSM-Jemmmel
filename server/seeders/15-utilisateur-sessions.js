"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[admin]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='admin@asso.tn' LIMIT 1"
    );
    const [[educateur]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educateur@asso.tn' LIMIT 1"
    );

    const rows = [];
    if (admin?.id) {
      rows.push({
        utilisateur_id: admin.id,
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0_0)",
        browser: "Chrome 129",
        os: "macOS 14",
        device: "MacBook Pro",
        ip_address: "192.168.1.10",
        created_at: now,
        updated_at: now,
      });
    }
    if (educateur?.id) {
      rows.push({
        utilisateur_id: educateur.id,
        user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        browser: "Safari Mobile",
        os: "iOS 17",
        device: "iPhone 14",
        ip_address: "10.0.0.25",
        created_at: now,
        updated_at: now,
      });
    }

    if (rows.length) {
      await queryInterface.bulkInsert("utilisateur_sessions", rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("utilisateur_sessions", {
      ip_address: ["192.168.1.10", "10.0.0.25"],
    });
  },
};
