import pool from "../config/database.js";

export default class CategoriaProveedor {
  static async obtenerProveedorPorCategoria(categoria) {
    const [rows] = await pool.query(
      `SELECT cp.*, u.nombre AS proveedor_nombre, u.email
       FROM categorias_proveedores cp
       JOIN usuarios u ON cp.proveedor_id = u.id
       WHERE cp.categoria = ?`,
      [categoria]
    );
    return rows[0] || null;
  }

  static async listarTodas() {
    const [rows] = await pool.query(
      `SELECT cp.*, u.nombre AS proveedor_nombre
       FROM categorias_proveedores cp
       JOIN usuarios u ON cp.proveedor_id = u.id
       ORDER BY cp.categoria`
    );
    return rows;
  }

  static async crear(categoria, proveedorId) {
    const [result] = await pool.query(
      "INSERT INTO categorias_proveedores (categoria, proveedor_id) VALUES (?, ?)",
      [categoria, proveedorId]
    );
    return result.insertId;
  }

  static async actualizar(id, proveedorId) {
    await pool.query(
      "UPDATE categorias_proveedores SET proveedor_id = ? WHERE id = ?",
      [proveedorId, id]
    );
  }

  static async eliminar(id) {
    await pool.query("DELETE FROM categorias_proveedores WHERE id = ?", [id]);
  }
}
