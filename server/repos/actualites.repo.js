"use strict";

const { Op } = require("sequelize");
const { Actualite, Utilisateur } = require("../models");
const { describeTable } = require("../utils/schema-utils");

const adminInclude = {
  model: Utilisateur,
  as: "admin",
  attributes: ["id", "nom", "prenom", "email"],
};

const OPTIONAL_COLUMNS = [
  "resume",
  "contenu_html",
  "statut",
  "tags",
  "couverture_url",
  "galerie_urls",
  "epingle",
];

let capabilitiesPromise = null;

async function getCapabilities() {
  if (!capabilitiesPromise) {
    capabilitiesPromise = (async () => {
      try {
        const definition = await describeTable("actualites");
        const optionalColumns = OPTIONAL_COLUMNS.filter((column) =>
          Object.prototype.hasOwnProperty.call(definition, column)
        );
        const publieLe = definition?.publie_le ?? {};
        return {
          optionalColumns: new Set(optionalColumns),
          publieLeAllowsNull: publieLe.allowNull !== false,
        };
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn(
            `[schema] Unable to inspect actualites table: ${err?.message || err}`
          );
        }
        return {
          optionalColumns: new Set(OPTIONAL_COLUMNS),
          publieLeAllowsNull: true,
        };
      }
    })();
  }

  return capabilitiesPromise;
}

async function filterAttributes(attrs) {
  const { optionalColumns, publieLeAllowsNull } = await getCapabilities();
  const output = {};

  for (const key of ["admin_id", "titre", "contenu"]) {
    if (attrs[key] !== undefined) {
      output[key] = attrs[key];
    }
  }

  if (attrs.publie_le !== undefined) {
    if (attrs.publie_le === null && !publieLeAllowsNull) {
      // Let the database default kick in when NULL is not permitted.
    } else {
      output.publie_le = attrs.publie_le;
    }
  }

  for (const column of OPTIONAL_COLUMNS) {
    if (!optionalColumns.has(column)) continue;
    if (attrs[column] !== undefined) {
      output[column] = attrs[column];
    }
  }

  return output;
}

exports.findById = (id, t = null) =>
  Actualite.findByPk(id, {
    include: [adminInclude],
    transaction: t,
  });

exports.list = async (filters = {}, pagination = {}, t = null) => {
  const { optionalColumns } = await getCapabilities();
  const where = {};

  if (filters.search) {
    const or = [{ titre: { [Op.like]: `%${filters.search}%` } }, { contenu: { [Op.like]: `%${filters.search}%` } }];
    if (optionalColumns.has("resume")) {
      or.push({ resume: { [Op.like]: `%${filters.search}%` } });
    }
    if (optionalColumns.has("contenu_html")) {
      or.push({ contenu_html: { [Op.like]: `%${filters.search}%` } });
    }
    where[Op.or] = or;
  }

  if (filters.status && filters.status !== "all" && optionalColumns.has("statut")) {
    where.statut = filters.status;
  }

  if (filters.pinned === true && optionalColumns.has("epingle")) {
    where.epingle = true;
  }

  if (filters.from || filters.to) {
    where.publie_le = {};
    if (filters.from) where.publie_le[Op.gte] = filters.from;
    if (filters.to) where.publie_le[Op.lte] = filters.to;
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const order = [];
  if (optionalColumns.has("epingle")) {
    order.push(["epingle", "DESC"]);
  }
  order.push(["publie_le", "DESC"], ["created_at", "DESC"]);

  const { rows, count } = await Actualite.findAndCountAll({
    where,
    include: [adminInclude],
    order,
    offset,
    limit,
    transaction: t,
  });

  return { rows, count, page, limit };
};

exports.create = async (attrs, t = null) => {
  const filtered = await filterAttributes(attrs);
  return Actualite.create(filtered, { transaction: t });
};

exports.updateById = async (id, attrs, t = null) => {
  const filtered = await filterAttributes(attrs);
  const [n] = await Actualite.update(filtered, { where: { id }, transaction: t });
  return n;
};

exports.updateStatus = async (id, attrs, t = null) => {
  const filtered = await filterAttributes(attrs);
  if (Object.keys(filtered).length === 0) {
    return 0;
  }
  return Actualite.update(filtered, { where: { id }, transaction: t });
};

exports.deleteById = (id, t = null) =>
  Actualite.destroy({ where: { id }, transaction: t });
