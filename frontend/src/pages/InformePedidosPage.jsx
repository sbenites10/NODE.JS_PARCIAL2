import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 agregado para la navegación
import "../App.css";

export default function InformePedidos() {
  const navigate = useNavigate(); // 👈 necesario para volver
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // === CARGAR PEDIDOS ===
  useEffect(() => {
    const obtenerPedidos = async () => {
      try {
        const res = await fetch("/api/pedidos/todos");
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(`Error ${res.status}: ${msg}`);
        }
        const data = await res.json();
        setPedidos(data);
      } catch (err) {
        console.error("Error al cargar pedidos:", err);
        setError("No se pudieron cargar los pedidos");
      } finally {
        setCargando(false);
      }
    };
    obtenerPedidos();
  }, []);

  // === CARGAR DETALLE DEL PEDIDO ===
  const cargarDetallePedido = async (pedidoId) => {
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`);
      if (!res.ok) throw new Error("Error al cargar detalle");
      const data = await res.json();
      
      // Buscar info adicional del pedido en la lista
      const pedidoInfo = pedidos.find(p => p.id === pedidoId);
      if (pedidoInfo) {
        data.tendero = pedidoInfo.tendero;
        data.zona = pedidoInfo.zona;
      }
      
      setPedidoSeleccionado(data);
    } catch (err) {
      console.error("Error al cargar detalle:", err);
      alert("No se pudo cargar el detalle del pedido");
    }
  };

  // === CAMBIAR ESTADO ===
  const actualizarEstado = async (idPedido, nuevoEstado) => {
    try {
      const res = await fetch(`/api/pedidos/${idPedido}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error("Error al actualizar estado");
      alert(`Pedido #${idPedido} actualizado a: ${nuevoEstado}`);

      const updated = pedidos.map((p) =>
        p.id === idPedido ? { ...p, estado: nuevoEstado } : p
      );
      setPedidos(updated);
      if (pedidoSeleccionado?.id === idPedido)
        setPedidoSeleccionado({ ...pedidoSeleccionado, estado: nuevoEstado });
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo actualizar el estado.");
    }
  };

  // === EVENTO CONSOLIDAR ===
  const handleConsolidar = () => {
    if (!pedidoSeleccionado) return;
    if (pedidoSeleccionado.estado === "pendiente") {
      actualizarEstado(pedidoSeleccionado.id, "en_asignacion");
    } else {
      alert("⚠️ El pedido ya está en asignación o completado.");
    }
  };

  // === COLORES DE ESTADO ===
  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: "#facc15",
      consolidacion: "#3b82f6",
      en_asignacion: "#3b82f6",
      en_preparacion: "#8b5cf6",
      entregado: "#10b981",
      cancelado: "#ef4444",
    };
    return colores[estado] || "#6b7280";
  };

  if (cargando)
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <p>Cargando pedidos...</p>
      </div>
    );

  if (error)
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );

  return (
    <div
      style={{
        padding: "24px",
        minWidth: "1400px",
        margin: "0 auto",
        justifyContent: "center",
      }}
    >
      {/* ======= Encabezado ======= */}
      <div
        style={{
          backgroundColor: "#1E3A8A",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "24px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
         {/* 👇 Botón de volver al menú principal */}
        <button
          onClick={() => navigate("/plataforma")}
          style={{
            backgroundColor: "#2563EB",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#1D4ED8")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#2563EB")}
        >
          ← Volver al Menú
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "white" }}>
            📊 Informe General de Pedidos
          </h1>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
            Visualiza y gestiona todos los pedidos realizados por los tenderos
          </p>
        </div>
      </div>

      {/* ======= Contenido ======= */}
      {pedidos.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            No hay pedidos registrados actualmente.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {/* ===== Lista de pedidos ===== */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ marginTop: 0 }}>Pedidos Recibidos</h2>
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {pedidos.map((p) => (
                <div
                  key={p.id}
                  onClick={() => cargarDetallePedido(p.id)}
                  style={{
                    padding: "16px",
                    background:
                      pedidoSeleccionado?.id === p.id ? "#f3f4f6" : "white",
                    border: `2px solid ${
                      pedidoSeleccionado?.id === p.id ? "#1E3A8A" : "#e5e7eb"
                    }`,
                    borderRadius: "8px",
                    marginBottom: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontWeight: "600", fontSize: "16px" }}>
                      Pedido #{p.id}
                    </span>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: getEstadoColor(p.estado) + "20",
                        color: getEstadoColor(p.estado),
                      }}
                    >
                      {p.estado}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    🧍 {p.tendero} — 🗺️ {p.zona}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#1E3A8A",
                      marginTop: "8px",
                    }}
                  >
                    ${p.total?.toLocaleString("es-CO")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== Detalle del pedido ===== */}
          <div
            className="card"
            style={{
              padding: "24px",
              position: "sticky",
              top: "24px",
              height: "fit-content",
            }}
          >
            {!pedidoSeleccionado ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                <p>Selecciona un pedido para ver sus detalles</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h2 style={{ margin: 0 }}>
                    Detalle del Pedido #{pedidoSeleccionado.id}
                  </h2>
                  <span
                    style={{
                      padding: "6px 16px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      background:
                        getEstadoColor(pedidoSeleccionado.estado) + "20",
                      color: getEstadoColor(pedidoSeleccionado.estado),
                    }}
                  >
                    {pedidoSeleccionado.estado}
                  </span>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <p style={{ marginBottom: "8px" }}>
                    <strong>Tendero:</strong> {pedidoSeleccionado.tendero || "No disponible"}
                  </p>
                  <p style={{ marginBottom: "8px" }}>
                    <strong>Zona:</strong> {pedidoSeleccionado.zona || "No disponible"}
                  </p>
                </div>

                <h3 style={{ fontSize: "16px", marginTop: "16px" }}>
                  Productos
                </h3>
                <div
                  style={{
                    background: "#f9fafb",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {Array.isArray(pedidoSeleccionado.items) &&
                  pedidoSeleccionado.items.length > 0 ? (
                    pedidoSeleccionado.items.map((item, idx) => (
                      <div 
                        key={idx}
                        style={{
                          padding: "8px",
                          borderBottom: idx < pedidoSeleccionado.items.length - 1 ? "1px solid #e5e7eb" : "none",
                        }}
                      >
                        <div style={{ fontWeight: "600" }}>{item.nombre}</div>
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                          Cantidad: {item.cantidad} | Subtotal: ${item.subtotal?.toLocaleString("es-CO")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "#6b7280" }}>
                      No hay productos registrados
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "16px",
                    background: "#1E3A8A",
                    color: "white",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ fontSize: "14px", opacity: 0.9 }}>
                    Total del pedido
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700" }}>
                    ${pedidoSeleccionado.total?.toLocaleString("es-CO")}
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                    <strong>Fecha:</strong> {new Date(pedidoSeleccionado.fecha).toLocaleString("es-CO")}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
