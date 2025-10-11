// src/middlewares/validate.js
"use strict";

const ApiError = require("../utils/api-error");

module.exports =
  (schema, location = "body") =>
  (req, _res, next) => {
    const target =
      location === "params"
        ? req.params
        : location === "query"
        ? req.query
        : req.body;
    const { error, value } = schema.validate(target, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const details = error.details.map((detail) => ({
        message: detail.message.replace(/"/g, ""),
        path: detail.path,
        type: detail.type,
      }));
      return next(
        new ApiError({
          status: 422,
          code: "VALIDATION_ERROR",
          message: "الرجاء التحقق من الحقول المدخلة",
          details,
        })
      );
    }
    if (location === "params") req.params = value;
    else if (location === "query") req.query = value;
    else req.body = value;
    next();
  };
