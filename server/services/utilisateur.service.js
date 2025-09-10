let bcrypt;
try {
  bcrypt = require("bcrypt");
} catch {
  bcrypt = require("bcryptjs");
}
const repo = require("../repos/utilisateur.repo");

exports.list = async (query) => {
  const page = Math.max(1, Number(query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || 20)));
  const role = query.role || undefined;
  const q = query.q || undefined;
  return repo.findAll({ page, pageSize, role, q });
};

exports.get = async (id) => {
  const user = await repo.findById(id);
  if (!user) {
    const e = new Error("Utilisateur introuvable");
    e.status = 404;
    throw e;
  }
  return user;
};

exports.create = async (dto) => {
  const hash = await bcrypt.hash(dto.mot_de_passe, 10);
  const created = await repo.create({ ...dto, mot_de_passe: hash });
  const { mot_de_passe, ...safe } = created.get({ plain: true });
  return safe;
};

exports.update = async (id, dto) => {
  if (dto.mot_de_passe) {
    dto.mot_de_passe = await bcrypt.hash(dto.mot_de_passe, 10);
  }
  const updated = await repo.updateById(id, dto);
  if (!updated) {
    const e = new Error("Utilisateur introuvable");
    e.status = 404;
    throw e;
  }
  delete updated.mot_de_passe;
  return updated;
};

exports.remove = async (id) => {
  const deleted = await repo.deleteById(id);
  if (!deleted) {
    const e = new Error("Utilisateur introuvable");
    e.status = 404;
    throw e;
  }
  return true;
};
