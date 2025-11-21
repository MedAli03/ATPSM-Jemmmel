const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "ParentsEnfant",
    {
      parent_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        allowNull: false,
      },
      enfant_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        allowNull: false,
      },
      relation: {
        type: DataTypes.ENUM("MERE", "PERE", "TUTEUR", "AUTRE"),
        allowNull: true,
      },
      is_guardian: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "parents_enfants",
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ["enfant_id"] }],
    }
  );
