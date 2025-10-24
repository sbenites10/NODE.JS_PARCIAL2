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

export const obtenerPedidosPorProveedorDB = async (proveedorId) => {
  try {
    // Ahora obtenemos las consolidaciones del proveedor, no los pedidos directamente
    const [rows] = await pool.query(
      `SELECT 
          c.id AS consolidacion_id,
          c.fecha_consolidacion AS fecha,
          c.estado,
          c.total,
          z.nombre AS zona,
          COALESCE(
            GROUP_CONCAT(
              DISTINCT CONCAT('x', cd.cantidad, ' ', pr.nombre)
              ORDER BY pr.nombre SEPARATOR '\n'
            ),
            ''
          ) AS productos,
          GROUP_CONCAT(DISTINCT p.id ORDER BY p.id) AS pedidos_ids,
          GROUP_CONCAT(DISTINCT u.nombre ORDER BY u.nombre SEPARATOR ', ') AS tenderos
       FROM consolidaciones c
       JOIN zonas z ON c.zona_id = z.id
       JOIN consolidacion_detalle cd ON cd.consolidacion_id = c.id
       JOIN pedidos p ON p.id = cd.pedido_id
       JOIN usuarios u ON u.id = p.tendero_id
       JOIN productos pr ON pr.id = cd.producto_id
       WHERE c.proveedor_id = ?
       GROUP BY c.id, c.fecha_consolidacion, c.estado, c.total, z.nombre
       ORDER BY c.id DESC`,
      [proveedorId]
    );

    // Añadir el campo "acciones" dinámicamente según el estado
    const consolidacionesConAcciones = rows.map((c) => {
      let acciones = ["Ver detalles"];
      switch (c.estado) {
        case "en_preparacion":
          acciones.push("Marcar como enviado");
          break;
        case "enviado":
          acciones.push("Marcar como entregado");
          break;
        // entregado no tiene más acciones
      }
      return { 
        ...c, 
        acciones,
        // Renombrar para mantener compatibilidad con el frontend existente
        pedido_id: c.consolidacion_id,
        tendero: c.tenderos
      };
    });

    return consolidacionesConAcciones;
  } catch (error) {
    console.error("❌ Error SQL:", error);
    throw error;
  }
};
