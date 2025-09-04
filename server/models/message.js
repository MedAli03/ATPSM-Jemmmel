'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Message', {
    threadId: { type: DataTypes.INTEGER, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    attachments: { type: DataTypes.JSON } // array of {url,name,type}
  });
};
