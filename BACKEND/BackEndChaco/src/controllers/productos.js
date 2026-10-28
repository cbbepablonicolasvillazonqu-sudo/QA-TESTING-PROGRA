const productos = require("../models/productos");

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validText(value, maxLength, nullable = true) {
  return (
    value === undefined ||
    (nullable && value === null) ||
    (typeof value === "string" && value.length <= maxLength)
  );
}

function validPrice(value) {
  if (typeof value !== "number" && typeof value !== "string") {
    return false;
  }

  const priceText = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(priceText)) {
    return false;
  }
  const price = Number(priceText);
  return (
    Number.isFinite(price) && price >= 0 && price <= 99999999.99
  );
}

async function list(req, res) {
  res.json(await productos.findAll());
}

async function get(req, res) {
  const id = validId(req.params.id);
  if (!id) {
    throw httpError(400, "El id debe ser un entero positivo");
  }
  const producto = await productos.findById(id);
  if (!producto) {
    throw httpError(404, "Producto no encontrado");
  }
  res.json(producto);
}

async function create(req, res) {
  const { titulo, descripcion, imagen, precio } = req.body;
  if (
    !validText(titulo, 100) ||
    !validText(descripcion, 100) ||
    !validText(imagen, 100) ||
    !validPrice(precio)
  ) {
    throw httpError(
      400,
      "Los textos deben tener hasta 100 caracteres y precio debe estar entre 0 y 99999999.99 con hasta 2 decimales",
    );
  }

  const producto = await productos.create({
    titulo,
    descripcion,
    imagen,
    precio: Number(precio),
  });
  res.status(201).json(producto);
}

async function update(req, res) {
  const id = validId(req.params.id);
  if (!id) {
    throw httpError(400, "El id debe ser un entero positivo");
  }
  if (!(await productos.findById(id))) {
    throw httpError(404, "Producto no encontrado");
  }

  const fields = {};
  for (const field of ["titulo", "descripcion", "imagen"]) {
    const value = req.body[field];
    if (value !== undefined) {
      if (!validText(value, 100)) {
        throw httpError(400, `${field} debe tener hasta 100 caracteres o ser null`);
      }
      fields[field] = value;
    }
  }
  if (req.body.precio !== undefined) {
    if (!validPrice(req.body.precio)) {
      throw httpError(
        400,
        "precio debe estar entre 0 y 99999999.99 con hasta 2 decimales",
      );
    }
    fields.precio = Number(req.body.precio);
  }
  if (Object.keys(fields).length === 0) {
    throw httpError(400, "Debe enviar al menos un campo para actualizar");
  }

  res.json(await productos.update(id, fields));
}

async function remove(req, res) {
  const id = validId(req.params.id);
  if (!id) {
    throw httpError(400, "El id debe ser un entero positivo");
  }
  if (!(await productos.remove(id))) {
    throw httpError(404, "Producto no encontrado");
  }
  res.status(204).end();
}

module.exports = { list, get, create, update, remove };
