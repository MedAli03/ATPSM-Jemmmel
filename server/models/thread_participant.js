const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "ThreadParticipant",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      thread_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("PARENT", "EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
        allowNull: false,
      },
      joined_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      left_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "thread_participants",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["thread_id", "user_id"] },
        { fields: ["user_id"] },
      ],
    }
  );
