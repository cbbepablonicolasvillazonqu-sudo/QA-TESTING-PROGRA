function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "El registro ya existe" });
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({
    error: status >= 500 ? "Error interno del servidor" : error.message,
  });
}

module.exports = errorHandler;
