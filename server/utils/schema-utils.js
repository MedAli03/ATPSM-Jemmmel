"use strict";

const { sequelize } = require("../models");

const tableDescriptionCache = new Map();

async function describeTable(tableName) {
  if (!tableDescriptionCache.has(tableName)) {
    const queryInterface = sequelize.getQueryInterface();
    tableDescriptionCache.set(
      tableName,
      queryInterface.describeTable(tableName).catch((err) => {
        tableDescriptionCache.delete(tableName);
        throw err;
      })
    );
  }

  return tableDescriptionCache.get(tableName);
}

async function pickExistingColumns(tableName, columns) {
  try {
    const definition = await describeTable(tableName);
    return columns.filter((column) =>
      Object.prototype.hasOwnProperty.call(definition, column)
    );
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        `[schema] Unable to inspect ${tableName}: ${err?.message || err}`
      );
    }
    return [];
  }
}

function clearTableCache(tableName) {
  if (tableName) {
    tableDescriptionCache.delete(tableName);
  } else {
    tableDescriptionCache.clear();
  }
}

module.exports = {
  describeTable,
  pickExistingColumns,
  clearTableCache,
};
