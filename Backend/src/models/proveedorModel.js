import pool from "../config/database.js";

// Obtener todos los proveedores
export const getProveedores = async () => {
  const [rows] = await pool.query("SELECT * FROM usuarios WHERE rol = 'proveedor'");
  return rows;
};

// Obtener proveedor por ID
export const getProveedorById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE id = ? AND rol = 'proveedor'",
    [id]
  );
  return rows[0];
};

// Crear proveedor
export const createProveedor = async (proveedor) => {
  const { nombre, email, password, contacto, zona_id } = proveedor;
  const rol = "proveedor";

  const [result] = await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol, contacto, zona_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, email, password, rol, contacto, zona_id]
  );

  return { id: result.insertId, ...proveedor };
};

// Actualizar proveedor
export const updateProveedor = async (id, proveedor) => {
  const { nombre, email, contacto, zona_id } = proveedor;

  const [result] = await pool.query(
    `UPDATE usuarios 
     SET nombre=?, email=?, contacto=?, zona_id=? 
     WHERE id=? AND rol='proveedor'`,
    [nombre, email, contacto, zona_id, id]
  );

  return result.affectedRows > 0;
};

// Eliminar proveedor
export const deleteProveedor = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM usuarios WHERE id=? AND rol='proveedor'",
    [id]
  );
  return result.affectedRows > 0;
};
