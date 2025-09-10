const repo = require("../repos/enfant.repo");
const { Utilisateur } = require("../models");

exports.list = async (query) => {
  const page = Math.max(1, Number(query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || 20)));
  return repo.findAll({ page, pageSize });
};

exports.create = async (dto) => {
  // guard: parent exists & is PARENT role
  const parent = await Utilisateur.findByPk(dto.parent_user_id);
  if (!parent || parent.role !== "PARENT") {
    const err = new Error(
      "parent_user_id invalide (doit référencer un utilisateur rôle PARENT)"
    );
    err.status = 422;
    throw err;
  }
  return repo.create(dto);
};

exports.get = async (id) => {
  const enfant = await repo.findById(id);
  if (!enfant) {
    const e = new Error("Enfant introuvable");
    e.status = 404;
    throw e;
  }
  return enfant;
};

exports.update = async (id, dto) => {
  if (dto.parent_user_id) {
    const parent = await Utilisateur.findByPk(dto.parent_user_id);
    if (!parent || parent.role !== "PARENT") {
      const err = new Error("parent_user_id invalide");
      err.status = 422;
      throw err;
    }
  }
  const enfant = await repo.updateById(id, dto);
  if (!enfant) {
    const e = new Error("Enfant introuvable");
    e.status = 404;
    throw e;
  }
  return enfant;
};

exports.remove = async (id) => {
  const deleted = await repo.deleteById(id);
  if (!deleted) {
    const e = new Error("Enfant introuvable");
    e.status = 404;
    throw e;
  }
  return true;
};
