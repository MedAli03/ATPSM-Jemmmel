// src/middlewares/validate.js
"use strict";

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
    });
    if (error) {
      const e = new Error(
        "Validation error: " + error.details.map((d) => d.message).join(", ")
      );
      e.status = 422;
      return next(e);
    }
    if (location === "params") req.params = value;
    else if (location === "query") req.query = value;
    else req.body = value;
    next();
  };
