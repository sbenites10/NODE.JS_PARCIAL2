// En desarrollo usa el proxy de Vite, en producción usa la variable de entorno
const API = import.meta.env.VITE_API_URL || "";

export const Api = {
  async productos() {
    const r = await fetch(`${API}/api/productos`);
    if (!r.ok) throw new Error("Error productos");
    return r.json();
  },

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
  }
};
