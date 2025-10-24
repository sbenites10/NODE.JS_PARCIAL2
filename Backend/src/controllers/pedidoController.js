import pool from "../config/database.js";

// Utilidad para sumar totales
async function recalcTotal(pedidoId) {
  const [rows] = await pool.query(
    "SELECT IFNULL(SUM(subtotal),0) AS total FROM pedido_detalle WHERE pedido_id=?",
    [pedidoId]
  );
  const total = rows[0].total || 0;
  await pool.query("UPDATE pedidos SET total=? WHERE id=?", [total, pedidoId]);
  return total;
}

// 1) Crear o recuperar pedido 'pendiente'
export const crearOBuscarBorrador = async (req, res) => {
  try {
    const tenderoId = Number(req.body.tendero_id);
    if (!tenderoId) return res.status(400).json({ message: "tendero_id requerido" });

    // Buscar pedido pendiente
    const [pedidos] = await pool.query(
      "SELECT id FROM pedidos WHERE tendero_id=? AND estado='pendiente' LIMIT 1",
      [tenderoId]
    );
    
    if (pedidos.length > 0) {
      return res.json({ id: pedidos[0].id });
    }

    // Buscar zona del tendero
    const [usuarios] = await pool.query(
      "SELECT zona_id FROM usuarios WHERE id=?",
      [tenderoId]
    );
    
    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Tendero no existe" });
    }
    
    const zonaId = usuarios[0].zona_id;

    // Crear nuevo pedido
    const [result] = await pool.query(
      "INSERT INTO pedidos (tendero_id, zona_id, estado, total) VALUES (?, ?, 'pendiente', 0)",
      [tenderoId, zonaId]
    );
    
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("Error en crearOBuscarBorrador:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// 2) Agregar/actualizar item
export const agregarActualizarItem = async (req, res) => {
  try {
    const pedidoId = Number(req.params.id);
    const { producto_id, cantidad } = req.body;
    
    if (!pedidoId || !producto_id || !cantidad) {
      return res.status(400).json({ message: "pedidoId, producto_id y cantidad son requeridos" });
    }

    // Obtener precio del producto
    const [productos] = await pool.query(
      "SELECT precio FROM productos WHERE id=?",
      [producto_id]
    );
    
    if (productos.length === 0) {
      return res.status(404).json({ message: "Producto no existe" });
    }

    const precio = Number(productos[0].precio);
    const subtotal = precio * Number(cantidad);

    // Verificar si ya existe el item
    const [items] = await pool.query(
      "SELECT id FROM pedido_detalle WHERE pedido_id=? AND producto_id=? LIMIT 1",
      [pedidoId, producto_id]
    );

    if (items.length > 0) {
      // Actualizar item existente
      await pool.query(
        "UPDATE pedido_detalle SET cantidad=?, subtotal=? WHERE id=?",
        [cantidad, subtotal, items[0].id]
      );
    } else {
      // Insertar nuevo item
      await pool.query(
        "INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, subtotal) VALUES (?,?,?,?)",
        [pedidoId, producto_id, cantidad, subtotal]
      );
    }

    // Recalcular total
    const total = await recalcTotal(pedidoId);
    res.json({ ok: true, total });
  } catch (error) {
    console.error("Error en agregarActualizarItem:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// 3) Confirmar pedido (recalcula total, mantiene estado 'pendiente')
export const enviarPedido = async (req, res) => {
  try {
    const pedidoId = Number(req.params.id);
    if (!pedidoId) return res.status(400).json({ message: "pedidoId requerido" });

    const [pedidos] = await pool.query(
      "SELECT estado FROM pedidos WHERE id=?",
      [pedidoId]
    );
    
    if (pedidos.length === 0) {
      return res.status(404).json({ message: "Pedido no existe" });
    }
    
    if (pedidos[0].estado !== 'pendiente') {
      return res.status(400).json({ message: "Solo se puede confirmar si está 'pendiente'" });
    }

    // Recalcular total final
    const total = await recalcTotal(pedidoId);
    
    // El pedido se mantiene en 'pendiente' hasta que la plataforma lo consolide
    // No cambiamos el estado aquí
    
    res.json({ ok: true, total });
  } catch (error) {
    console.error("Error en enviarPedido:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// 4) Eliminar si 'pendiente'
export const eliminarSiPendiente = async (req, res) => {
  try {
    const pedidoId = Number(req.params.id);
    
    const [result] = await pool.query(
      "DELETE FROM pedidos WHERE id=? AND estado='pendiente'",
      [pedidoId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No se puede eliminar" });
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error("Error en eliminarSiPendiente:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// 5) Mis pedidos (historial)
export const misPedidos = async (req, res) => {
  try {
    const tenderoId = Number(req.query.tendero_id || req.body.tendero_id);
    if (!tenderoId) return res.status(400).json({ message: "tendero_id requerido" });

    const [rows] = await pool.query(
      "SELECT id, fecha, estado, total FROM pedidos WHERE tendero_id=? ORDER BY fecha DESC",
      [tenderoId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error("Error en misPedidos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// 6) Detalle del pedido
export const detallePedido = async (req, res) => {
  try {
    const pedidoId = Number(req.params.id);
    
    const [pedidos] = await pool.query(
      "SELECT id, fecha, estado, total FROM pedidos WHERE id=?",
      [pedidoId]
    );
    
    if (pedidos.length === 0) {
      return res.status(404).json({ message: "No existe" });
    }

    const [items] = await pool.query(
      `SELECT d.id, p.nombre, d.cantidad, d.subtotal
       FROM pedido_detalle d
       JOIN productos p ON p.id = d.producto_id
       WHERE d.pedido_id=?`,
      [pedidoId]
    );
    
    res.json({ ...pedidos[0], items });
  } catch (error) {
    console.error("Error en detallePedido:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};


// 7) Listar todos los pedidos (para admin/plataforma)
export const listarTodosPedidos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        u.nombre AS tendero,
        z.nombre AS zona,
        p.fecha,
        p.estado,
        p.total
      FROM pedidos p
      JOIN usuarios u ON p.tendero_id = u.id
      JOIN zonas z ON p.zona_id = z.id
      ORDER BY p.fecha DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error en listarTodosPedidos:", error);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

