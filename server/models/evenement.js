const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Evenement', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  document_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  titre: { type: DataTypes.STRING(200), allowNull: false },
  description: DataTypes.TEXT,
  debut: DataTypes.DATE,
  fin: DataTypes.DATE,
  audience: { type: DataTypes.ENUM('parents','educateurs','tous'), defaultValue: 'tous' },
  lieu: DataTypes.STRING(200)
}, { tableName: 'evenements', underscored: true, timestamps: true });
