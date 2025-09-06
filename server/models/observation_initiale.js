const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('ObservationInitiale', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  date_observation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  contenu: { type: DataTypes.TEXT, allowNull: false }
}, { tableName: 'observation_initiale', underscored: true, timestamps: true });
