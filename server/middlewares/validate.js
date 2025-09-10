module.exports = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, {
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
  req.body = value;
  next();
};
