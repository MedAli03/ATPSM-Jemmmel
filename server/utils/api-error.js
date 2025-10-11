"use strict";

class ApiError extends Error {
  constructor({ status = 500, code = "INTERNAL_ERROR", message = "خطأ غير متوقع", details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details || null;
  }
}

module.exports = ApiError;
