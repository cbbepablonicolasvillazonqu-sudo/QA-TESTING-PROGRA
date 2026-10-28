const bcrypt = require("bcryptjs");
const usuarios = require("../models/usuarios");

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function list(req, res) {
  res.json(await usuarios.findAll());
}

async function get(req, res) {
  const id = validId(req.params.id);
  if (!id) {
    throw httpError(400, "El id debe ser un entero positivo");
  }

  const usuario = await usuarios.findById(id);
  if (!usuario) {
    throw httpError(404, "Usuario no encontrado");
  }
  res.json(usuario);
}

async function create(req, res) {
  const { nombre, email, contraseña } = req.body;
  if (
    typeof nombre !== "string" ||
    !nombre.trim() ||
    nombre.trim().length > 100 ||
    !validEmail(email) ||
    email.length > 100 ||
    typeof contraseña !== "string" ||
    !contraseña
  ) {
    throw httpError(400, "nombre, email válido y contraseña son obligatorios");
  }

  if (await usuarios.findByEmail(email)) {
    throw httpError(409, "Ya existe un usuario con ese email");
  }

  const passwordHash = await bcrypt.hash(contraseña, 12);
  const usuario = await usuarios.create({
    nombre: nombre.trim(),
    email,
    passwordHash,
  });
  res.status(201).json(usuario);
}

async function login(req, res) {
  const { email, contraseña } = req.body;
  if (
    typeof email !== "string" ||
    !validEmail(email) ||
    typeof contraseña !== "string" ||
    !contraseña
  ) {
    throw httpError(400, "email válido y contraseña son obligatorios");
  }

  const usuario = await usuarios.findByEmailWithPassword(email);
  const passwordMatches =
    usuario && (await bcrypt.compare(contraseña, usuario.passwordHash));

  if (!passwordMatches) {
    throw httpError(401, "Credenciales inválidas");
  }

  const { passwordHash, ...usuarioPublico } = usuario;
  res.json({ mensaje: "Inicio de sesión exitoso", usuario: usuarioPublico });
}

async function update(req, res) {
  const id = validId(req.params.id);
  if (!id) {
    throw httpError(400, "El id debe ser un entero positivo");
  }

  const current = await usuarios.findById(id);
  if (!current) {
    throw httpError(404, "Usuario no encontrado");
  }

  const { nombre, email, contraseña } = req.body;
  const fields = {};
  if (nombre !== undefined) {
    if (typeof nombre !== "string" || !nombre.trim() || nombre.trim().length > 100) {
      throw httpError(400, "nombre debe ser un texto de hasta 100 caracteres");
    }
    fields.nombre = nombre.trim();
  }
  if (email !== undefined) {
    if (!validEmail(email) || email.length > 100) {
      throw httpError(400, "email no es válido");
    }
    const existing = await usuarios.findByEmail(email);
    if (existing && existing.id !== id) {
      throw httpError(409, "Ya existe un usuario con ese email");
    }
    fields.email = email;
  }
  if (contraseña !== undefined) {
    if (typeof contraseña !== "string" || !contraseña) {
      throw httpError(400, "contraseña debe ser un texto no vacío");
    }
    fields.passwordHash = await bcrypt.hash(contraseña, 12);
  }
  if (Object.keys(fields).length === 0) {
    throw httpError(400, "Debe enviar al menos un campo para actualizar");
  }

  res.json(await usuarios.update(id, fields));
}

async function remove(req, res) {
  const id = validId(req.params.id);
  if (!id) {
    throw httpError(400, "El id debe ser un entero positivo");
  }
  if (!(await usuarios.remove(id))) {
    throw httpError(404, "Usuario no encontrado");
  }
  res.status(204).end();
}

module.exports = { list, get, create, login, update, remove };
