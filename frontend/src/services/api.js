// En desarrollo usa el proxy de Vite, en producción usa la variable de entorno
const API = import.meta.env.VITE_API_URL || "";

export const Api = {
  // Productos
  async productos() {
    const r = await fetch(`${API}/api/productos`);
    if (!r.ok) throw new Error("Error productos");
    return r.json();
  },

  // Pedidos - Tendero
  async crearOBuscarBorrador(tendero_id) {
    const r = await fetch(`${API}/api/pedidos`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ tendero_id })
    });
    if (!r.ok) throw new Error("Error creando/obteniendo pedido");
    return r.json(); // {id}
  },

  async addItem(pedidoId, producto_id, cantidad) {
    const r = await fetch(`${API}/api/pedidos/${pedidoId}/items`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ producto_id, cantidad })
    });
    if (!r.ok) throw new Error("Error agregando item");
    return r.json(); // {ok, total}
  },

  async enviar(pedidoId) {
    const r = await fetch(`${API}/api/pedidos/${pedidoId}/enviar`, { method:"POST" });
    if (!r.ok) throw new Error("Error enviando pedido");
    return r.json();
  },

  async eliminar(pedidoId) {
    const r = await fetch(`${API}/api/pedidos/${pedidoId}`, { method:"DELETE" });
    if (!r.ok) throw new Error("No se puede eliminar");
    return r.json();
  },

  async misPedidos(tendero_id) {
    const r = await fetch(`${API}/api/pedidos?tendero_id=${tendero_id}`);
    if (!r.ok) throw new Error("Error historial");
    return r.json();
  },

  async detalle(pedidoId) {
    const r = await fetch(`${API}/api/pedidos/${pedidoId}`);
    if (!r.ok) throw new Error("Error detalle");
    return r.json();
  },

  async confirmarRecepcion(pedidoId) {
    const r = await fetch(`${API}/api/pedidos/${pedidoId}/confirmar-recepcion`, {
      method: "PUT"
    });
    if (!r.ok) throw new Error("Error confirmando recepción");
    return r.json();
  },

  // Consolidaciones - Admin
  async consolidarPorCategoria() {
    const r = await fetch(`${API}/api/consolidaciones/consolidar`, {
      method: "POST"
    });
    if (!r.ok) throw new Error("Error consolidando pedidos");
    return r.json();
  },

  async listarConsolidaciones() {
    const r = await fetch(`${API}/api/consolidaciones`);
    if (!r.ok) throw new Error("Error obteniendo consolidaciones");
    return r.json();
  },

  async detalleConsolidacion(consolidacionId) {
    const r = await fetch(`${API}/api/consolidaciones/${consolidacionId}`);
    if (!r.ok) throw new Error("Error obteniendo detalle");
    return r.json();
  },

  async estadoDetalladoPedido(pedidoId) {
    const r = await fetch(`${API}/api/consolidaciones/pedido/${pedidoId}/estado-detallado`);
    if (!r.ok) throw new Error("Error obteniendo estado detallado");
    return r.json();
  },

  // Consolidaciones - Proveedor
  async misConsolidaciones(proveedor_id) {
    const r = await fetch(`${API}/api/consolidaciones/proveedor/mis-consolidaciones?proveedor_id=${proveedor_id}`);
    if (!r.ok) throw new Error("Error obteniendo mis consolidaciones");
    return r.json();
  },

  async actualizarEstadoConsolidacion(consolidacionId, estado) {
    const r = await fetch(`${API}/api/consolidaciones/${consolidacionId}/estado`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ estado })
    });
    if (!r.ok) throw new Error("Error actualizando estado");
    return r.json();
  },

  // Categorías-Proveedores - Admin
  async listarCategoriasProveedores() {
    const r = await fetch(`${API}/api/categorias-proveedores`);
    if (!r.ok) throw new Error("Error obteniendo categorías");
    return r.json();
  },

  async crearCategoriaProveedor(categoria, proveedor_id) {
    const r = await fetch(`${API}/api/categorias-proveedores`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ categoria, proveedor_id })
    });
    if (!r.ok) throw new Error("Error creando categoría-proveedor");
    return r.json();
  },

  async actualizarCategoriaProveedor(id, proveedor_id) {
    const r = await fetch(`${API}/api/categorias-proveedores/${id}`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ proveedor_id })
    });
    if (!r.ok) throw new Error("Error actualizando categoría-proveedor");
    return r.json();
  },

  // Pedidos - Admin
  async todosPedidos() {
    const r = await fetch(`${API}/api/pedidos/todos`);
    if (!r.ok) throw new Error("Error obteniendo todos los pedidos");
    return r.json();
  }
};
