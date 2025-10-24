import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Api } from "../services/api";
import "../App.css";

export default function HistorialPedidosPage() {
  const navigate = useNavigate();
  const tendero_id = Number(localStorage.getItem("user_id"));
  const nombreTendero = localStorage.getItem("nombre");
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPedidos();
  }, [tendero_id]);

  const cargarPedidos = async () => {
    try {
      const data = await Api.misPedidos(tendero_id);
      setPedidos(data || []);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (pedidoId) => {
    try {
      const data = await Api.detalle(pedidoId);
      setDetalle(data);
      setPedidoSeleccionado(pedidoId);
    } catch (error) {
      console.error("Error cargando detalle:", error);
      alert("❌ Error al cargar detalle del pedido");
    }
  };

  const cancelarPedido = async (pedidoId) => {
    if (!window.confirm("¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await Api.eliminar(pedidoId);
      alert("✅ Pedido cancelado exitosamente");
      cargarPedidos();
      setPedidoSeleccionado(null);
      setDetalle(null);
    } catch (error) {
      console.error("Error cancelando pedido:", error);
      alert("❌ Solo puedes cancelar pedidos en estado 'pendiente'");
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: "#f59e0b",
      consolidacion: "#3b82f6",
      asignacion: "#8b5cf6",
      despacho: "#06b6d4",
      entregado: "#10b981",
      cancelado: "#ef4444"
    };
    return colores[estado] || "#6b7280";
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: "⏳ Pendiente de Consolidación",
      consolidacion: "📦 Consolidado por Plataforma",
      asignacion: "🚚 Asignado a Proveedor",
      despacho: "🛵 En Despacho",
      entregado: "✅ Entregado",
      recibido: "✅ Recibido y Confirmado",
      cancelado: "❌ Cancelado"
    };
    return textos[estado] || estado;
  };

  const confirmarRecepcion = async (pedidoId) => {
    if (!window.confirm("¿Confirmar que recibiste todos los productos de este pedido?")) {
      return;
    }

    try {
      await Api.confirmarRecepcion(pedidoId);
      alert("✅ Recepción confirmada exitosamente");
      cargarPedidos();
      verDetalle(pedidoId); // Recargar detalle
    } catch (error) {
      console.error("Error confirmando recepción:", error);
      alert("❌ Error al confirmar recepción: " + error.message);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "24px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px" }}>📋 Historial de Pedidos - {nombreTendero}</h1>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>Revisa el estado de todos tus pedidos</p>
        </div>
        <button
          onClick={() => navigate("/tendero")}
          style={{
            background: "white",
            color: "#667eea",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px"
          }}
        >
          ← Volver al Panel
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p>Cargando historial...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            No tienes pedidos registrados aún
          </p>
          <button
            onClick={() => navigate("/tendero")}
            className="btn btn-primary"
            style={{ marginTop: "16px" }}
          >
            Crear mi primer pedido
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Lista de pedidos */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ marginTop: 0 }}>Mis Pedidos</h2>
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {pedidos.map(pedido => (
                <div
                  key={pedido.id}
                  onClick={() => verDetalle(pedido.id)}
                  style={{
                    padding: "16px",
                    background: pedidoSeleccionado === pedido.id ? "#f3f4f6" : "white",
                    border: `2px solid ${pedidoSeleccionado === pedido.id ? "#667eea" : "#e5e7eb"}`,
                    borderRadius: "8px",
                    marginBottom: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "600", fontSize: "16px" }}>
                      Pedido #{pedido.id}
                    </span>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: getEstadoColor(pedido.estado) + "20",
                        color: getEstadoColor(pedido.estado)
                      }}
                    >
                      {getEstadoTexto(pedido.estado)}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    📅 {new Date(pedido.fecha).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                  <div style={{ 
                    fontSize: "18px", 
                    fontWeight: "700", 
                    color: "#667eea",
                    marginTop: "8px"
                  }}>
                    ${pedido.total}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalle del pedido */}
          <div className="card" style={{ padding: "24px", position: "sticky", top: "24px", height: "fit-content" }}>
            {!detalle ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                <p>Selecciona un pedido para ver los detalles</p>
              </div>
            ) : (
              <>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "20px"
                }}>
                  <h2 style={{ margin: 0 }}>Detalle del Pedido #{detalle.id}</h2>
                  <span
                    style={{
                      padding: "6px 16px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      background: getEstadoColor(detalle.estado) + "20",
                      color: getEstadoColor(detalle.estado)
                    }}
                  >
                    {getEstadoTexto(detalle.estado)}
                  </span>
                </div>

                <div style={{ 
                  background: "#f9fafb", 
                  padding: "16px", 
                  borderRadius: "8px",
                  marginBottom: "20px"
                }}>
                  <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
                    Fecha del pedido
                  </div>
                  <div style={{ fontWeight: "600" }}>
                    {new Date(detalle.fecha).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>

                <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Productos</h3>
                <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "20px" }}>
                  {detalle.items && detalle.items.length > 0 ? (
                    detalle.items.map(item => (
                      <div key={item.id} style={{
                        padding: "12px",
                        background: "#f9fafb",
                        borderRadius: "8px",
                        marginBottom: "8px"
                      }}>
                        <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                          {item.nombre}
                        </div>
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between",
                          fontSize: "14px",
                          color: "#6b7280"
                        }}>
                          <span>Cantidad: {item.cantidad}</span>
                          <span style={{ fontWeight: "600", color: "#374151" }}>
                            ${item.subtotal}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#6b7280", textAlign: "center" }}>
                      No hay productos en este pedido
                    </p>
                  )}
                </div>

                <div style={{
                  padding: "16px",
                  background: "#667eea",
                  color: "white",
                  borderRadius: "8px",
                  marginBottom: "20px"
                }}>
                  <div style={{ fontSize: "14px", opacity: 0.9 }}>Total del pedido</div>
                  <div style={{ fontSize: "28px", fontWeight: "700" }}>${detalle.total}</div>
                </div>

                {detalle.estado === "pendiente" && (
                  <>
                    <div style={{
                      padding: "12px",
                      background: "#dbeafe",
                      border: "1px solid #3b82f6",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#1e40af",
                      marginBottom: "12px"
                    }}>
                      ℹ️ Este pedido está pendiente de consolidación por la plataforma. Puedes cancelarlo mientras esté en este estado.
                    </div>
                    <button
                      onClick={() => cancelarPedido(detalle.id)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px"
                      }}
                    >
                      Cancelar Pedido
                    </button>
                  </>
                )}

                {detalle.estado === "consolidacion" && (
                  <div style={{
                    padding: "12px",
                    background: "#fef3c7",
                    border: "1px solid #fbbf24",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#92400e"
                  }}>
                    ℹ️ Este pedido ya fue consolidado por la plataforma y enviado al proveedor. Ya no puede ser cancelado.
                  </div>
                )}

                {(detalle.estado === "asignacion" || detalle.estado === "despacho") && (
                  <div style={{
                    padding: "12px",
                    background: "#dcfce7",
                    border: "1px solid #10b981",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#065f46"
                  }}>
                    ✓ Este pedido está en proceso de entrega
                  </div>
                )}

                {detalle.estado === "entregado" && (
                  <>
                    <div style={{
                      padding: "12px",
                      background: "#dbeafe",
                      border: "1px solid #3b82f6",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#1e40af",
                      marginBottom: "12px"
                    }}>
                      📦 Todos los productos de tu pedido han sido entregados. Por favor confirma que los recibiste correctamente.
                    </div>
                    <button
                      onClick={() => confirmarRecepcion(detalle.id)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px"
                      }}
                    >
                      ✅ Confirmar Recepción
                    </button>
                  </>
                )}

                {detalle.estado === "recibido" && (
                  <div style={{
                    padding: "12px",
                    background: "#dcfce7",
                    border: "1px solid #10b981",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#065f46"
                  }}>
                    ✅ Pedido recibido y confirmado exitosamente
                  </div>
                )}

                {detalle.estado === "cancelado" && (
                  <div style={{
                    padding: "12px",
                    background: "#fee2e2",
                    border: "1px solid #ef4444",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#991b1b"
                  }}>
                    ✗ Este pedido fue cancelado
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
