const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('DailyNote', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  projet_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  date_note: { type: DataTypes.DATEONLY, allowNull: false },
  contenu: DataTypes.TEXT,
  type: DataTypes.STRING(50),
  pieces_jointes: DataTypes.TEXT
}, { tableName: 'daily_notes', underscored: true, timestamps: true });
