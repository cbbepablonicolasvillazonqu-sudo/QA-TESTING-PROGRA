const database = require("../config/database");

const publicColumns = "id, nombre, email, fecha_creacion, fecha_actualizacion";

async function findAll() {
  const [rows] = await database.query(
    `SELECT ${publicColumns} FROM usuarios ORDER BY id`,
  );
  return rows;
}

async function findById(id) {
  const [rows] = await database.execute(
    `SELECT ${publicColumns} FROM usuarios WHERE id = ?`,
    [id],
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await database.execute(
    `SELECT id FROM usuarios WHERE email = ? LIMIT 1`,
    [email],
  );
  return rows[0] || null;
}

async function findByEmailWithPassword(email) {
  const [rows] = await database.execute(
    "SELECT id, nombre, email, `contraseña` AS passwordHash, fecha_creacion, fecha_actualizacion FROM usuarios WHERE email = ? LIMIT 1",
    [email],
  );
  return rows[0] || null;
}

async function create({ nombre, email, passwordHash }) {
  const [result] = await database.execute(
    "INSERT INTO usuarios (nombre, email, `contraseña`) VALUES (?, ?, ?)",
    [nombre, email, passwordHash],
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const columnNames = {
    nombre: "nombre",
    email: "email",
    passwordHash: "`contraseña`",
  };
  const entries = Object.entries(fields);
  const assignments = entries.map(([field]) => `${columnNames[field]} = ?`);
  const values = entries.map(([, value]) => value);

  await database.execute(
    `UPDATE usuarios SET ${assignments.join(", ")} WHERE id = ?`,
    [...values, id],
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await database.execute("DELETE FROM usuarios WHERE id = ?", [
    id,
  ]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByEmail,
  findByEmailWithPassword,
  create,
  update,
  remove,
};
