import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function ProveedorDashboard() {
  const navigate = useNavigate();
  const proveedorId = Number(localStorage.getItem("proveedorId"));
  const nombreProveedor = localStorage.getItem("proveedorNombre") || "Proveedor";
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar pedidos asignados al proveedor
  useEffect(() => {
    cargarPedidos();
  }, [proveedorId]);

  const cargarPedidos = async () => {
    try {
      const res = await fetch(`/api/proveedores/${proveedorId}/pedidos`);
      const data = await res.json();
      setPedidos(data || []);
    } catch (error) {
      console.error("Error cargando pedidos del proveedor:", error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (pedido) => {
    setDetalle(pedido);
    setPedidoSeleccionado(pedido.pedido_id);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      "en consolidación": "#3b82f6",
      confirmado: "#8b5cf6",
      despachado: "#06b6d4",
      entregado: "#10b981",
      cancelado: "#ef4444",
    };
    return colores[estado] || "#6b7280";
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      "en consolidación": "📦 En Consolidación",
      confirmado: "✅ Confirmado",
      despachado: "🚚 Despachado",
      entregado: "📬 Entregado",
      cancelado: "❌ Cancelado",
    };
    return textos[estado] || estado;
  };

  const handleAccion = (accion, pedidoId) => {
    console.log(`Ejecutar acción "${accion}" sobre pedido ${pedidoId}`);
    alert(`🔧 Acción "${accion}" ejecutada (simulación)`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ padding: "24px", minWidth: "1400px", margin: "0 auto", justifyContent: "center" }}>
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
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "white" }}>
            🚛 Pedidos Asignados - {nombreProveedor}
          </h1>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
            Gestiona y monitorea los pedidos que te han sido asignados
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "white",
            color: "#1E3A8A",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* ======= Contenido ======= */}
      {loading ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p>Cargando pedidos...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            No tienes pedidos asignados actualmente.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* ===== Lista de pedidos ===== */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ marginTop: 0 }}>Pedidos Asignados</h2>
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {pedidos.map((p) => (
                <div
                  key={p.pedido_id}
                  onClick={() => verDetalle(p)}
                  style={{
                    padding: "16px",
                    background:
                      pedidoSeleccionado === p.pedido_id ? "#f3f4f6" : "white",
                    border: `2px solid ${
                      pedidoSeleccionado === p.pedido_id ? "#1E3A8A" : "#e5e7eb"
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
                      Pedido #{p.pedido_id}
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
                      {getEstadoTexto(p.estado)}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    📅{" "}
                    {new Date(p.fecha).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#1E3A8A",
                      marginTop: "8px",
                    }}
                  >
                    ${p.total.toLocaleString("es-CO")}
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
            {!detalle ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                <p>Selecciona un pedido para ver los detalles</p>
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
                    Detalle del Pedido #{detalle.pedido_id}
                  </h2>
                  <span
                    style={{
                      padding: "6px 16px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      background: getEstadoColor(detalle.estado) + "20",
                      color: getEstadoColor(detalle.estado),
                    }}
                  >
                    {getEstadoTexto(detalle.estado)}
                  </span>
                </div>

                <p>
                  <strong>Zona:</strong> {detalle.zona}
                </p>
                <p>
                  <strong>Tendero:</strong> {detalle.tendero}
                </p>

                <h3 style={{ fontSize: "16px", marginTop: "16px" }}>Productos</h3>
                <div
                  style={{
                    background: "#f9fafb",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  {detalle.productos
                    ? detalle.productos.split("\n").map((linea, idx) => (
                        <div key={idx}>{linea}</div>
                      ))
                    : "No hay productos en este pedido"}
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
                    ${detalle.total.toLocaleString("es-CO")}
                  </div>
                </div>

                <h3>Acciones disponibles</h3>
                {detalle.acciones && detalle.acciones.length > 0 ? (
                  detalle.acciones.map((accion, idx) => (
                    <button
                      key={idx}
                      className="btn btn-primary"
                      style={{ marginRight: "8px", marginTop: "8px" }}
                      onClick={() =>
                        handleAccion(accion, detalle.pedido_id)
                      }
                    >
                      {accion}
                    </button>
                  ))
                ) : (
                  <p style={{ color: "#6b7280" }}>No hay acciones disponibles</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
