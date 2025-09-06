const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('EvaluationProjet', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  projet_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  date_evaluation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  score: DataTypes.INTEGER,
  grille: DataTypes.JSON,
  notes: DataTypes.TEXT
}, { tableName: 'evaluation_projet', underscored: true, timestamps: true });
