const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('RecoAIObjectif', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  recommendation_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  texte: DataTypes.TEXT,
  accepte: { type: DataTypes.BOOLEAN, defaultValue: false },
  applique_le: DataTypes.DATE
}, { tableName: 'recommendation_ai_objectif', underscored: true, timestamps: true });
