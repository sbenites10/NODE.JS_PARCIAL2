// InformePedidosPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function InformePedidosPage() {
  const navigate = useNavigate();
  const usuarioActual = localStorage.getItem("usuario"); // email del usuario logueado
  const [pedidos, setPedidos] = useState([]);
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState([]);
  const [pedidoActivo, setPedidoActivo] = useState(null);

  // Mapa de acciones según estado
  const accionesPorEstado = {
    pendiente: ["Consolidar"],
    consolidacion: ["Asignar proveedor"],
    asignacion: ["Despachar"],
    despacho: ["Finalizado"],
    rechazado: []
  };

  // Verifica acceso
  useEffect(() => {
    if (usuarioActual !== "plataforma@correo.com") {
      alert("⚠️ No tienes permisos para acceder a esta sección");
      navigate("/plataforma");
    }
  }, [usuarioActual, navigate]);

  // Cargar pedidos
  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/pedidos");
      const data = await res.json();
      setPedidos(data);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  // Seleccionar/deseleccionar pedidos
  const togglePedidoSeleccionado = (pedidoId) => {
    setPedidosSeleccionados(prev =>
      prev.includes(pedidoId)
        ? prev.filter(id => id !== pedidoId)
        : [...prev, pedidoId]
    );
  };

  // Seleccionar pedido activo para mostrar detalle
  const seleccionarPedido = (pedido) => {
    setPedidoActivo(pedido);
  };

  // Actualizar estado de pedidos
  const actualizarEstadoPedidos = async (nuevoEstado) => {
    try {
      await Promise.all(
        pedidosSeleccionados.map(async (pedidoId) => {
          const res = await fetch(`/api/pedidos/${pedidoId}/estado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado })
          });
          if (!res.ok) throw new Error("Error al actualizar pedido");
        })
      );
      alert("✅ Estado actualizado");
      setPedidosSeleccionados([]);
      fetchPedidos();
    } catch (error) {
      console.error(error);
      alert("❌ Error al actualizar pedidos");
    }
  };

  return (
    <div className="informe-pedidos-page" style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {/* ===== Lista de pedidos ===== */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "80vh" }}>
        <h2>Pedidos</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Tendero</th>
              <th>Valor</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(pedido => (
              <tr key={pedido.id} onClick={() => seleccionarPedido(pedido)}>
                <td>
                  <input
                    type="checkbox"
                    checked={pedidosSeleccionados.includes(pedido.id)}
                    onChange={(e) => { e.stopPropagation(); togglePedidoSeleccionado(pedido.id); }}
                  />
                </td>
                <td>{pedido.id}</td>
                <td>{pedido.tendero_nombre}</td>
                <td>${pedido.valor}</td>
                <td>{pedido.fecha}</td>
                <td>{pedido.estado}</td>
                <td>
                  {accionesPorEstado[pedido.estado].map(accion => (
                    <button
                      key={accion}
                      onClick={(e) => { e.stopPropagation(); actualizarEstadoPedidos(accion.toLowerCase()); }}
                    >
                      {accion}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Detalle del pedido seleccionado ===== */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "80vh" }}>
        <h2>Detalle del pedido</h2>
        {pedidoActivo ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Pedido ID</th>
                <th>Producto ID</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedidoActivo.productos?.map(prod => (
                <tr key={prod.id}>
                  <td>{prod.id}</td>
                  <td>{prod.pedido_id}</td>
                  <td>{prod.producto_id}</td>
                  <td>{prod.cantidad}</td>
                  <td>${prod.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Seleccione un pedido para ver los detalles.</p>
        )}
      </div>
    </div>
  );
}

export default InformePedidosPage;
