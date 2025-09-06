const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Actualite', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  titre: { type: DataTypes.STRING(200), allowNull: false },
  contenu: DataTypes.TEXT,
  publie_le: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { tableName: 'actualites', underscored: true, timestamps: true });
