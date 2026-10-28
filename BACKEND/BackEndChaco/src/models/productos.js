const database = require("../config/database");

async function findAll() {
  const [rows] = await database.query(
    "SELECT id, titulo, descripcion, imagen, precio FROM productos ORDER BY id",
  );
  return rows;
}

async function findById(id) {
  const [rows] = await database.execute(
    "SELECT id, titulo, descripcion, imagen, precio FROM productos WHERE id = ?",
    [id],
  );
  return rows[0] || null;
}

async function create({ titulo, descripcion, imagen, precio }) {
  const [result] = await database.execute(
    "INSERT INTO productos (titulo, descripcion, imagen, precio) VALUES (?, ?, ?, ?)",
    [titulo ?? null, descripcion ?? null, imagen ?? null, precio],
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const columnNames = {
    titulo: "titulo",
    descripcion: "descripcion",
    imagen: "imagen",
    precio: "precio",
  };
  const entries = Object.entries(fields);
  const assignments = entries.map(([field]) => `${columnNames[field]} = ?`);
  const values = entries.map(([, value]) => value);

  await database.execute(
    `UPDATE productos SET ${assignments.join(", ")} WHERE id = ?`,
    [...values, id],
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await database.execute("DELETE FROM productos WHERE id = ?", [
    id,
  ]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
