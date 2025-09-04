"use strict";
module.exports = (sequelize, DataTypes) => {
  const GroupMember = sequelize.define(
    "GroupMember",
    {
      groupId: { type: DataTypes.INTEGER, allowNull: false },
      childId: { type: DataTypes.INTEGER, allowNull: false, unique: true }, // 👈 unique
      joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      // (optional) keep composite unique if you only wanted “no duplicate in SAME group”
      // indexes: [{ unique: true, fields: ['groupId', 'childId'] }]
    }
  );
  return GroupMember;
};
