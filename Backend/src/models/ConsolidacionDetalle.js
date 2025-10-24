import pool from "../config/database.js";

export default class ConsolidacionDetalle {
  static async crear(consolidacionId, pedidoId, productoId, cantidad, subtotal) {
    const [result] = await pool.query(
      `INSERT INTO consolidacion_detalle 
       (consolidacion_id, pedido_id, producto_id, cantidad, subtotal) 
       VALUES (?, ?, ?, ?, ?)`,
      [consolidacionId, pedidoId, productoId, cantidad, subtotal]
    );
    return result.insertId;
  }

  static async obtenerPorConsolidacion(consolidacionId) {
    const [rows] = await pool.query(
      `SELECT 
        cd.*,
        p.nombre AS producto_nombre,
        ped.tendero_id,
        u.nombre AS tendero_nombre
       FROM consolidacion_detalle cd
       JOIN productos p ON cd.producto_id = p.id
       JOIN pedidos ped ON cd.pedido_id = ped.id
       JOIN usuarios u ON ped.tendero_id = u.id
       WHERE cd.consolidacion_id = ?`,
      [consolidacionId]
    );
    return rows;
  }

  static async obtenerPorPedido(pedidoId) {
    const [rows] = await pool.query(
      `SELECT 
        cd.*,
        c.id AS consolidacion_id,
        c.estado AS consolidacion_estado,
        c.proveedor_id,
        u.nombre AS proveedor_nombre,
        p.nombre AS producto_nombre,
        p.tipo AS categoria
       FROM consolidacion_detalle cd
       JOIN consolidaciones c ON cd.consolidacion_id = c.id
       JOIN productos p ON cd.producto_id = p.id
       JOIN usuarios u ON c.proveedor_id = u.id
       WHERE cd.pedido_id = ?`,
      [pedidoId]
    );
    return rows;
  }

  static async eliminarPorConsolidacion(consolidacionId) {
    await pool.query(
      "DELETE FROM consolidacion_detalle WHERE consolidacion_id = ?",
      [consolidacionId]
    );
  }
}
