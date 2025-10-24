import pool from "../config/database.js";
import Consolidacion from "../models/Consolidacion.js";
import ConsolidacionDetalle from "../models/ConsolidacionDetalle.js";
import CategoriaProveedor from "../models/CategoriaProveedor.js";

// Calculate order state based on all its consolidations
async function calcularEstadoPedido(pedidoId) {
  const estados = await Consolidacion.obtenerEstadosPorPedido(pedidoId);
  
  if (estados.length === 0) {
    return 'pendiente';
  }
  
  // If all are delivered → order "entregado"
  if (estados.every(e => e === 'entregado')) {
    return 'entregado';
  }
  
  // If at least one is sent → order "despacho"
  if (estados.some(e => e === 'enviado')) {
    return 'despacho';
  }
  
  // If all are in preparation → order "asignacion"
  if (estados.every(e => e === 'en_preparacion')) {
    return 'asignacion';
  }
  
  // Mixed state → "consolidacion"
  return 'consolidacion';
}

// Update order state based on its consolidations
async function actualizarEstadoPedido(pedidoId) {
  const nuevoEstado = await calcularEstadoPedido(pedidoId);
  await pool.query(
    "UPDATE pedidos SET estado = ? WHERE id = ?",
    [nuevoEstado, pedidoId]
  );
  return nuevoEstado;
}

// ADMIN: Consolidate pending orders by category
export const consolidarPorCategoria = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Get all pending orders with their products
    const [pedidosPendientes] = await connection.query(`
      SELECT 
        p.id AS pedido_id,
        p.zona_id,
        pd.producto_id,
        pd.cantidad,
        pd.subtotal,
        prod.tipo AS categoria,
        prod.nombre AS producto_nombre
      FROM pedidos p
      JOIN pedido_detalle pd ON pd.pedido_id = p.id
      JOIN productos prod ON prod.id = pd.producto_id
      WHERE p.estado = 'pendiente'
      ORDER BY prod.tipo, p.zona_id
    `);
    
    if (pedidosPendientes.length === 0) {
      await connection.commit();
      return res.json({ 
        message: "No hay pedidos pendientes para consolidar",
        consolidaciones: []
      });
    }
    
    // 2. Group products by category and zone
    const grupos = {};
    
    for (const item of pedidosPendientes) {
      const key = `${item.categoria}_${item.zona_id}`;
      
      if (!grupos[key]) {
        grupos[key] = {
          categoria: item.categoria,
          zona_id: item.zona_id,
          productos: []
        };
      }
      
      grupos[key].productos.push(item);
    }
    
    const consolidacionesCreadas = [];
    
    // 3. For each group, create a consolidation
    for (const [key, grupo] of Object.entries(grupos)) {
      // Get provider for this category
      const categoriaProveedor = await CategoriaProveedor.obtenerProveedorPorCategoria(grupo.categoria);
      
      if (!categoriaProveedor) {
        console.warn(`⚠️ No hay proveedor asignado para la categoría: ${grupo.categoria}`);
        continue;
      }
      
      // Calculate total for this consolidation
      const total = grupo.productos.reduce((sum, p) => sum + parseFloat(p.subtotal), 0);
      
      // Create consolidation
      const consolidacionId = await Consolidacion.crear(
        grupo.zona_id,
        categoriaProveedor.proveedor_id,
        total
      );
      
      // Add products to consolidacion_detalle
      for (const prod of grupo.productos) {
        await ConsolidacionDetalle.crear(
          consolidacionId,
          prod.pedido_id,
          prod.producto_id,
          prod.cantidad,
          prod.subtotal
        );
      }
      
      consolidacionesCreadas.push({
        id: consolidacionId,
        categoria: grupo.categoria,
        zona_id: grupo.zona_id,
        proveedor: categoriaProveedor.proveedor_nombre,
        total,
        productos: grupo.productos.length
      });
    }
    
    // 4. Update all affected orders to 'consolidacion' state
    const pedidosIds = [...new Set(pedidosPendientes.map(p => p.pedido_id))];
    
    for (const pedidoId of pedidosIds) {
      await actualizarEstadoPedido(pedidoId);
    }
    
    await connection.commit();
    
    res.json({
      message: `Se consolidaron ${consolidacionesCreadas.length} grupos de productos`,
      pedidos_procesados: pedidosIds.length,
      consolidaciones: consolidacionesCreadas
    });
    
  } catch (error) {
    await connection.rollback();
    console.error("Error en consolidarPorCategoria:", error);
    res.status(500).json({ 
      message: "Error al consolidar pedidos",
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// ADMIN: List all consolidations
export const listarConsolidaciones = async (req, res) => {
  try {
    const consolidaciones = await Consolidacion.listarTodas();
    res.json(consolidaciones);
  } catch (error) {
    console.error("Error en listarConsolidaciones:", error);
    res.status(500).json({ message: "Error al obtener consolidaciones" });
  }
};

// ADMIN/PROVIDER: Get consolidation detail
export const obtenerDetalleConsolidacion = async (req, res) => {
  try {
    const consolidacionId = Number(req.params.id);
    
    const consolidacion = await Consolidacion.obtenerPorId(consolidacionId);
    
    if (!consolidacion) {
      return res.status(404).json({ message: "Consolidación no encontrada" });
    }
    
    const detalle = await ConsolidacionDetalle.obtenerPorConsolidacion(consolidacionId);
    
    res.json({
      ...consolidacion,
      productos: detalle
    });
  } catch (error) {
    console.error("Error en obtenerDetalleConsolidacion:", error);
    res.status(500).json({ message: "Error al obtener detalle" });
  }
};

// PROVIDER: List my consolidations
export const misConsolidaciones = async (req, res) => {
  try {
    const proveedorId = Number(req.query.proveedor_id || req.body.proveedor_id);
    
    if (!proveedorId) {
      return res.status(400).json({ message: "proveedor_id requerido" });
    }
    
    const consolidaciones = await Consolidacion.listarPorProveedor(proveedorId);
    res.json(consolidaciones);
  } catch (error) {
    console.error("Error en misConsolidaciones:", error);
    res.status(500).json({ message: "Error al obtener consolidaciones" });
  }
};

// PROVIDER: Update consolidation state
export const actualizarEstadoConsolidacion = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const consolidacionId = Number(req.params.id);
    const { estado } = req.body;
    
    const estadosValidos = ['en_preparacion', 'enviado', 'entregado'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        message: "Estado inválido. Debe ser: en_preparacion, enviado o entregado" 
      });
    }
    
    await connection.beginTransaction();
    
    // Update consolidation state
    await Consolidacion.actualizarEstado(consolidacionId, estado);
    
    // Get all orders affected by this consolidation
    const [pedidos] = await connection.query(`
      SELECT DISTINCT pedido_id 
      FROM consolidacion_detalle 
      WHERE consolidacion_id = ?
    `, [consolidacionId]);
    
    // Update state of all affected orders
    for (const { pedido_id } of pedidos) {
      await actualizarEstadoPedido(pedido_id);
    }
    
    await connection.commit();
    
    res.json({ 
      message: "Estado actualizado correctamente",
      consolidacion_id: consolidacionId,
      nuevo_estado: estado,
      pedidos_actualizados: pedidos.length
    });
    
  } catch (error) {
    await connection.rollback();
    console.error("Error en actualizarEstadoConsolidacion:", error);
    res.status(500).json({ message: "Error al actualizar estado" });
  } finally {
    connection.release();
  }
};

// TENDERO: Confirm order reception
export const confirmarRecepcion = async (req, res) => {
  try {
    const pedidoId = Number(req.params.id);
    
    // Verify order exists and is in 'entregado' state
    const [pedidos] = await pool.query(
      "SELECT estado FROM pedidos WHERE id = ?",
      [pedidoId]
    );
    
    if (pedidos.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    
    if (pedidos[0].estado !== 'entregado') {
      return res.status(400).json({ 
        message: "Solo se puede confirmar recepción de pedidos en estado 'entregado'",
        estado_actual: pedidos[0].estado
      });
    }
    
    // Update to 'recibido'
    await pool.query(
      "UPDATE pedidos SET estado = 'recibido' WHERE id = ?",
      [pedidoId]
    );
    
    res.json({ 
      message: "Recepción confirmada correctamente",
      pedido_id: pedidoId,
      estado: 'recibido'
    });
    
  } catch (error) {
    console.error("Error en confirmarRecepcion:", error);
    res.status(500).json({ message: "Error al confirmar recepción" });
  }
};

// TENDERO: Get detailed order status with consolidations
export const obtenerEstadoDetallado = async (req, res) => {
  try {
    const pedidoId = Number(req.params.id);
    
    // Get order info
    const [pedidos] = await pool.query(
      "SELECT id, fecha, estado, total FROM pedidos WHERE id = ?",
      [pedidoId]
    );
    
    if (pedidos.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    
    // Get consolidations detail
    const detalle = await ConsolidacionDetalle.obtenerPorPedido(pedidoId);
    
    // Group by consolidation
    const consolidaciones = {};
    
    for (const item of detalle) {
      if (!consolidaciones[item.consolidacion_id]) {
        consolidaciones[item.consolidacion_id] = {
          consolidacion_id: item.consolidacion_id,
          estado: item.consolidacion_estado,
          proveedor: item.proveedor_nombre,
          productos: []
        };
      }
      
      consolidaciones[item.consolidacion_id].productos.push({
        producto: item.producto_nombre,
        categoria: item.categoria,
        cantidad: item.cantidad,
        subtotal: item.subtotal
      });
    }
    
    res.json({
      ...pedidos[0],
      consolidaciones: Object.values(consolidaciones)
    });
    
  } catch (error) {
    console.error("Error en obtenerEstadoDetallado:", error);
    res.status(500).json({ message: "Error al obtener estado detallado" });
  }
};
