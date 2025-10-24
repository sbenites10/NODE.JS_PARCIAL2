import React, { useState, useEffect } from "react";
import "../App.css";

export default function ConsolidarPedidosPage() {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [consolidando, setConsolidando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // === CARGAR PEDIDOS PENDIENTES ===
  useEffect(() => {
    cargarPedidosPendientes();
  }, []);

  const cargarPedidosPendientes = async () => {
    try {
      const res = await fetch("/api/pedidos/todos");
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const data = await res.json();
      const pendientes = data.filter((p) => p.estado === "pendiente");
      setPedidosPendientes(pendientes);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
    } finally {
      setCargando(false);
    }
  };

  // === CONSOLIDAR PEDIDOS ===
  const consolidarPedidos = async () => {
    if (pedidosPendientes.length === 0) {
      alert("No hay pedidos pendientes para consolidar");
      return;
    }

    if (!confirm(`¿Consolidar ${pedidosPendientes.length} pedido(s) pendiente(s) por categoría?`)) {
      return;
    }

    setConsolidando(true);
    setMensaje("");

    try {
      const res = await fetch("/api/consolidaciones/consolidar", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Error al consolidar");

      const data = await res.json();
      setMensaje(
        `✅ ${data.message}\n` +
        `Pedidos procesados: ${data.pedidos_procesados}\n` +
        `Consolidaciones creadas: ${data.consolidaciones.length}`
      );

      // Recargar pedidos pendientes
      await cargarPedidosPendientes();
    } catch (err) {
      console.error("Error al consolidar:", err);
      setMensaje(`❌ Error: ${err.message}`);
    } finally {
      setConsolidando(false);
    }
  };

  if (cargando) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <p>Cargando pedidos pendientes...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
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
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px", color: "white" }}>
          🔄 Consolidar Pedidos
        </h1>
        <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
          Agrupa automáticamente los productos de pedidos pendientes por categoría y asígnalos a proveedores
        </p>
      </div>

      {/* ======= Información ======= */}
      <div
        className="card"
        style={{
          padding: "24px",
          marginBottom: "24px",
          background: "#f0f9ff",
          border: "2px solid #3b82f6",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#1e40af" }}>
          ℹ️ ¿Cómo funciona la consolidación?
        </h3>
        <ul style={{ color: "#1e40af", lineHeight: "1.8" }}>
          <li>
            El sistema agrupa automáticamente los productos de todos los pedidos
            pendientes por <strong>categoría</strong>
          </li>
          <li>
            Cada grupo de productos se asigna al proveedor correspondiente según
            su categoría
          </li>
          <li>
            Se crean consolidaciones separadas para cada categoría y zona
          </li>
          <li>
            Los proveedores recibirán sus consolidaciones para procesarlas
          </li>
        </ul>
      </div>

      {/* ======= Botón de Consolidación ======= */}
      <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Pedidos Pendientes</h2>
            <p style={{ margin: "8px 0 0 0", color: "#6b7280" }}>
              {pedidosPendientes.length} pedido(s) esperando consolidación
            </p>
          </div>
          <button
            onClick={consolidarPedidos}
            disabled={consolidando || pedidosPendientes.length === 0}
            style={{
              background:
                pedidosPendientes.length === 0 ? "#9ca3af" : "#10b981",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor:
                pedidosPendientes.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            {consolidando ? "Consolidando..." : "🔄 Consolidar Pedidos"}
          </button>
        </div>

        {mensaje && (
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              background: mensaje.startsWith("✅") ? "#d1fae5" : "#fee2e2",
              color: mensaje.startsWith("✅") ? "#065f46" : "#991b1b",
              whiteSpace: "pre-line",
              marginTop: "16px",
            }}
          >
            {mensaje}
          </div>
        )}
      </div>

      {/* ======= Lista de Pedidos Pendientes ======= */}
      {pedidosPendientes.length > 0 && (
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ marginTop: 0 }}>Detalle de Pedidos Pendientes</h3>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {pedidosPendientes.map((pedido) => (
              <div
                key={pedido.id}
                style={{
                  padding: "16px",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  marginBottom: "12px",
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
                    Pedido #{pedido.id}
                  </span>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: "#fef3c7",
                      color: "#92400e",
                    }}
                  >
                    Pendiente
                  </span>
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  🧍 {pedido.tendero} — 🗺️ {pedido.zona}
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  📅 {new Date(pedido.fecha).toLocaleDateString("es-CO")}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#1E3A8A",
                    marginTop: "8px",
                  }}
                >
                  ${pedido.total?.toLocaleString("es-CO")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pedidosPendientes.length === 0 && !cargando && (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            ✅ No hay pedidos pendientes para consolidar
          </p>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>
            Todos los pedidos han sido procesados
          </p>
        </div>
      )}
    </div>
  );
}
