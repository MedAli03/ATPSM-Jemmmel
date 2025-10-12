const fs = require("fs/promises");
const path = require("path");
const ApiError = require("../utils/api-error");
const service = require("../services/me.service");

const AVATAR_PREFIX = "/uploads/avatars/";
const AVATAR_DIR = path.join(__dirname, "..", "uploads", "avatars");
const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const MIME_EXTENSION_MAP = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await service.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const profile = await service.updateProfile(req.user.id, req.body);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    await service.changePassword(req.user.id, req.body);
    res.json({ message: "تم تغيير كلمة السر" });
  } catch (error) {
    next(error);
  }
};

exports.updateAvatar = async (req, res, next) => {
  const { avatar, filename } = req.body || {};
  if (!avatar || typeof avatar !== "string") {
    return next(
      new ApiError({
        status: 400,
        code: "AVATAR_REQUIRED",
        message: "الرجاء رفع صورة صالحة",
      })
    );
  }

  const match = avatar.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  const mime = match?.[1]?.toLowerCase() || null;
  const base64Payload = (match?.[2] || avatar).replace(/\s+/g, "");

  let buffer;
  try {
    buffer = Buffer.from(base64Payload, "base64");
  } catch (error) {
    return next(
      new ApiError({
        status: 400,
        code: "INVALID_AVATAR",
        message: "صيغة الصورة غير صالحة",
      })
    );
  }

  if (!buffer || buffer.length === 0) {
    return next(
      new ApiError({
        status: 400,
        code: "INVALID_AVATAR",
        message: "صيغة الصورة غير صالحة",
      })
    );
  }

  const maxBytes = 3 * 1024 * 1024;
  if (buffer.length > maxBytes) {
    return next(
      new ApiError({
        status: 413,
        code: "AVATAR_TOO_LARGE",
        message: "حجم الصورة يتجاوز الحد المسموح (3MB)",
      })
    );
  }

  const requestedExt =
    typeof filename === "string"
      ? path.extname(filename).toLowerCase().replace(/[^.a-z0-9]/g, "")
      : "";
  const mimeExt = mime ? MIME_EXTENSION_MAP[mime] || "" : "";
  const extension = [requestedExt, mimeExt].find((ext) =>
    ALLOWED_EXTENSIONS.has(ext)
  );
  const safeExt = extension || ".png";

  const fileName = `avatar-${req.user.id}-${Date.now()}${safeExt}`;
  const absolutePath = path.join(AVATAR_DIR, fileName);
  const relativePath = `${AVATAR_PREFIX}${fileName}`;

  let previousAvatar;
  let wroteFile = false;
  try {
    const current = await service.getProfile(req.user.id);
    previousAvatar = current.avatar_url;

    await fs.mkdir(AVATAR_DIR, { recursive: true });
    await fs.writeFile(absolutePath, buffer);
    wroteFile = true;

    const profile = await service.updateAvatar(req.user.id, relativePath);
    res.json(profile);

    if (
      previousAvatar &&
      previousAvatar.startsWith(AVATAR_PREFIX) &&
      previousAvatar !== relativePath
    ) {
      const absolute = path.join(
        __dirname,
        "..",
        previousAvatar.replace(/^\/+/, "")
      );
      await fs.unlink(absolute).catch(() => {});
    }
  } catch (error) {
    if (wroteFile) {
      await fs.unlink(absolutePath).catch(() => {});
    }
    next(error);
  }
};

exports.listSessions = async (req, res, next) => {
  try {
    const sessions = await service.listSessions(req.user.id, req.query);
    res.json({ data: sessions });
  } catch (error) {
    next(error);
  }
};
