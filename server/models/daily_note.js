const { DataTypes } = require('sequelize');
module.exports = (sequelize) =>
  sequelize.define(
    'DailyNote',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      projet_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      date_note: { type: DataTypes.DATEONLY, allowNull: false },
      contenu: { type: DataTypes.TEXT, allowNull: true },
      type: { type: DataTypes.STRING(50), allowNull: true },
      pieces_jointes: { type: DataTypes.TEXT, allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'daily_notes',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['projet_id', 'date_note'] },
        { fields: ['enfant_id', 'date_note'] },
      ],
    }
  );
