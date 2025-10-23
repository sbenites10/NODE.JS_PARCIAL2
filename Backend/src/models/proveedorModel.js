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
    const [rows] = await pool.query(
      `SELECT 
          p.id AS pedido_id,
          p.fecha,
          p.estado,
          p.total,
          z.nombre AS zona,
          u.nombre AS tendero,
          COALESCE(
            GROUP_CONCAT(
              CONCAT('x', pd.cantidad, ' ', pr.nombre)
              ORDER BY pr.nombre SEPARATOR '\n'
            ),
            ''
          ) AS productos
       FROM pedidos p
       JOIN zonas z ON p.zona_id = z.id
       JOIN usuarios u ON p.tendero_id = u.id
       JOIN consolidaciones c ON p.consolidacion_id = c.id
       LEFT JOIN pedido_detalle pd ON pd.pedido_id = p.id
       LEFT JOIN productos pr ON pr.id = pd.producto_id
       WHERE c.proveedor_id = ?
       GROUP BY p.id, p.fecha, p.estado, p.total, z.nombre, u.nombre`,
      [proveedorId]
    );

    // Añadir el campo "acciones" dinámicamente según el estado
    const pedidosConAcciones = rows.map((p) => {
      let acciones = ["Ver detalles"];
      switch (p.estado) {
        case "consolidacion":
          acciones.push("Confirmar disponibilidad");
          break;
        case "confirmado":
          acciones.push("Marcar como despachado");
          break;
        case "despachado":
          acciones.push("Marcar como entregado");
          break;
        // entregado / cancelado solo pueden ver detalles
      }
      return { ...p, acciones };
    });

    return pedidosConAcciones;
  } catch (error) {
    console.error("❌ Error SQL:", error);
    throw error;
  }
};
