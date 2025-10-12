let bcrypt;
try {
  bcrypt = require("bcrypt");
} catch {
  bcrypt = require("bcryptjs");
}

const ApiError = require("../utils/api-error");
const repo = require("../repos/me.repo");
const {
  updateProfileSchema,
  updatePasswordSchema,
  listSessionsSchema,
} = require("../validations/me.schema");

const toPublicProfile = (record) => ({
  id: record.id,
  nom: record.nom,
  prenom: record.prenom,
  email: record.email,
  phone: record.telephone,
  adresse: record.adresse,
  role: record.role,
  username: record.username || record.email || String(record.id),
  avatar_url: record.avatar_url,
  last_login: record.last_login,
  created_at: record.created_at,
});

exports.getProfile = async (userId) => {
  const record = await repo.findProfileById(userId);
  if (!record) {
    throw new ApiError({
      status: 404,
      code: "PROFILE_NOT_FOUND",
      message: "الملف غير موجود",
    });
  }
  return toPublicProfile(record);
};

exports.updateProfile = async (userId, payload) => {
  const value = await updateProfileSchema.validateAsync(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  const dto = {
    nom: value.nom,
    prenom: value.prenom,
    email: value.email || null,
    telephone: value.phone || null,
    adresse: value.adresse || null,
  };

  const updated = await repo.updateProfileById(userId, dto);
  if (!updated) {
    throw new ApiError({
      status: 404,
      code: "PROFILE_NOT_FOUND",
      message: "الملف غير موجود",
    });
  }
  return toPublicProfile(updated);
};

exports.changePassword = async (userId, payload) => {
  const value = await updatePasswordSchema.validateAsync(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  const user = await repo.findUserWithPasswordById(userId);
  if (!user) {
    throw new ApiError({
      status: 404,
      code: "PROFILE_NOT_FOUND",
      message: "الملف غير موجود",
    });
  }

  const matches = await bcrypt.compare(value.current_password, user.mot_de_passe);
  if (!matches) {
    throw new ApiError({
      status: 400,
      code: "INVALID_CURRENT_PASSWORD",
      message: "كلمة السر الحالية غير صحيحة",
    });
  }

  const alreadyUsed = await bcrypt.compare(value.new_password, user.mot_de_passe);
  if (alreadyUsed) {
    throw new ApiError({
      status: 400,
      code: "PASSWORD_REUSE",
      message: "يجب اختيار كلمة سر مختلفة",
    });
  }

  const hash = await bcrypt.hash(value.new_password, 10);
  await repo.updatePasswordById(userId, hash);
  return true;
};

exports.updateAvatar = async (userId, avatarUrl) => {
  const updated = await repo.updateAvatarById(userId, avatarUrl);
  if (!updated) {
    throw new ApiError({
      status: 404,
      code: "PROFILE_NOT_FOUND",
      message: "الملف غير موجود",
    });
  }
  return toPublicProfile(updated);
};

exports.listSessions = async (userId, query = {}) => {
  const value = await listSessionsSchema.validateAsync(query, {
    abortEarly: false,
    stripUnknown: true,
  });

  const sessions = await repo.findSessions(userId, value.limit);
  return sessions.map((session) => ({
    id: session.id,
    browser: session.browser,
    platform: session.os,
    device: session.device,
    ip: session.ip_address,
    user_agent: session.user_agent,
    created_at: session.created_at,
  }));
};
