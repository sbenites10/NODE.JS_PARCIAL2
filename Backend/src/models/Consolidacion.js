import pool from "../config/database.js";

export default class Consolidacion {
  static async crear(zonaId, proveedorId, total = 0) {
    const [result] = await pool.query(
      `INSERT INTO consolidaciones (zona_id, proveedor_id, estado, total) 
       VALUES (?, ?, 'en_preparacion', ?)`,
      [zonaId, proveedorId, total]
    );
    return result.insertId;
  }

  static async obtenerPorId(id) {
    const [rows] = await pool.query(
      `SELECT c.*, 
        z.nombre AS zona_nombre,
        u.nombre AS proveedor_nombre,
        u.email AS proveedor_email
       FROM consolidaciones c
       JOIN zonas z ON c.zona_id = z.id
       JOIN usuarios u ON c.proveedor_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async listarPorProveedor(proveedorId) {
    const [rows] = await pool.query(
      `SELECT c.*, z.nombre AS zona_nombre
       FROM consolidaciones c
       JOIN zonas z ON c.zona_id = z.id
       WHERE c.proveedor_id = ?
       ORDER BY c.id DESC`,
      [proveedorId]
    );
    return rows;
  }

  static async listarTodas() {
    const [rows] = await pool.query(
      `SELECT c.*, 
        z.nombre AS zona_nombre,
        u.nombre AS proveedor_nombre
       FROM consolidaciones c
       JOIN zonas z ON c.zona_id = z.id
       JOIN usuarios u ON c.proveedor_id = u.id
       ORDER BY c.id DESC`
    );
    return rows;
  }

  static async actualizarEstado(id, nuevoEstado) {
    await pool.query(
      "UPDATE consolidaciones SET estado = ? WHERE id = ?",
      [nuevoEstado, id]
    );
  }

  static async actualizarTotal(id, total) {
    await pool.query(
      "UPDATE consolidaciones SET total = ? WHERE id = ?",
      [total, id]
    );
  }

  static async eliminar(id) {
    await pool.query("DELETE FROM consolidaciones WHERE id = ?", [id]);
  }

  static async obtenerEstadosPorPedido(pedidoId) {
    const [rows] = await pool.query(
      `SELECT DISTINCT c.estado
       FROM consolidaciones c
       JOIN consolidacion_detalle cd ON cd.consolidacion_id = c.id
       WHERE cd.pedido_id = ?`,
      [pedidoId]
    );
    return rows.map(r => r.estado);
  }
}
