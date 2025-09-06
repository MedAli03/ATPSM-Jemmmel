const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('RecoAIActivite', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  recommendation_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  description: DataTypes.TEXT,
  objectifs: DataTypes.TEXT,
  accepte: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_activite_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  applique_le: DataTypes.DATE
}, { tableName: 'recommendation_ai_activite', underscored: true, timestamps: true });
