import { useState, useEffect } from "react";
import { Api } from "../../services/api";

export default function ConsolidacionesProveedor() {
  const proveedorId = Number(localStorage.getItem("proveedorId"));
  const nombreProveedor = localStorage.getItem("proveedorNombre") || "Proveedor";
  
  const [consolidaciones, setConsolidaciones] = useState([]);
  const [selectedConsolidacion, setSelectedConsolidacion] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarConsolidaciones();
  }, []);

  async function cargarConsolidaciones() {
    try {
      const data = await Api.misConsolidaciones(proveedorId);
      setConsolidaciones(data);
    } catch (error) {
      console.error("Error cargando consolidaciones:", error);
    } finally {
      setLoading(false);
    }
  }

  async function verDetalle(consolidacionId) {
    try {
      const data = await Api.detalleConsolidacion(consolidacionId);
      setDetalle(data);
      setSelectedConsolidacion(consolidacionId);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    }
  }

  async function cambiarEstado(consolidacionId, nuevoEstado) {
    if (!confirm(`¿Cambiar estado a "${estadoTexto(nuevoEstado)}"?`)) return;
    
    setMensaje("");
    try {
      await Api.actualizarEstadoConsolidacion(consolidacionId, nuevoEstado);
      setMensaje(`✅ Estado actualizado correctamente`);
      await cargarConsolidaciones();
      
      if (selectedConsolidacion === consolidacionId) {
        await verDetalle(consolidacionId);
      }
    } catch (error) {
      setMensaje(`❌ Error: ${error.message}`);
    }
  }

  const estadoColor = (estado) => {
    switch (estado) {
      case 'en_preparacion': return '#f59e0b';
      case 'enviado': return '#3b82f6';
      case 'entregado': return '#10b981';
      default: return '#6b7280';
    }
  };

  const estadoTexto = (estado) => {
    switch (estado) {
      case 'en_preparacion': return 'En Preparación';
      case 'enviado': return 'Enviado';
      case 'entregado': return 'Entregado';
      default: return estado;
    }
  };

  const accionesDisponibles = (estado) => {
    switch (estado) {
      case 'en_preparacion':
        return [{ texto: '📦 Marcar como Enviado', nuevoEstado: 'enviado' }];
      case 'enviado':
        return [{ texto: '✅ Marcar como Entregado', nuevoEstado: 'entregado' }];
      case 'entregado':
        return [];
      default:
        return [];
    }
  };

  return (
    <div style={{ padding: "24px", minWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#1E3A8A",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "24px",
          color: "white",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px" }}>
          🚛 Mis Consolidaciones - {nombreProveedor}
        </h1>
        <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
          Gestiona los pedidos consolidados asignados a tu categoría
        </p>
      </div>

      {mensaje && (
        <div
          style={{
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "8px",
            background: mensaje.startsWith('✅') ? '#d1fae5' : '#fee2e2',
            color: mensaje.startsWith('✅') ? '#065f46' : '#991b1b',
          }}
        >
          {mensaje}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Cargando consolidaciones...</p>
        </div>
      ) : consolidaciones.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", background: "white", borderRadius: "12px" }}>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            No tienes consolidaciones asignadas actualmente.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Lista de consolidaciones */}
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginTop: 0 }}>Consolidaciones Asignadas</h2>
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {consolidaciones.map((cons) => (
                <div
                  key={cons.id}
                  onClick={() => verDetalle(cons.id)}
                  style={{
                    padding: "16px",
                    background: selectedConsolidacion === cons.id ? "#f3f4f6" : "white",
                    border: `2px solid ${selectedConsolidacion === cons.id ? "#1E3A8A" : "#e5e7eb"}`,
                    borderRadius: "8px",
                    marginBottom: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "600", fontSize: "16px" }}>
                      Consolidación #{cons.id}
                    </span>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: estadoColor(cons.estado) + "20",
                        color: estadoColor(cons.estado),
                      }}
                    >
                      {estadoTexto(cons.estado)}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    📍 {cons.zona_nombre}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    📅 {new Date(cons.fecha).toLocaleDateString()}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#1E3A8A",
                      marginTop: "8px",
                    }}
                  >
                    ${cons.total?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalle de consolidación */}
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              position: "sticky",
              top: "24px",
              height: "fit-content",
            }}
          >
            {!detalle ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                <p>Selecciona una consolidación para ver los detalles</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ margin: 0 }}>Consolidación #{detalle.id}</h2>
                  <span
                    style={{
                      padding: "6px 16px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      background: estadoColor(detalle.estado) + "20",
                      color: estadoColor(detalle.estado),
                    }}
                  >
                    {estadoTexto(detalle.estado)}
                  </span>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <p><strong>Zona:</strong> {detalle.zona_nombre}</p>
                  <p><strong>Fecha:</strong> {new Date(detalle.fecha).toLocaleDateString()}</p>
                </div>

                <h3 style={{ fontSize: "16px", marginTop: "16px" }}>Productos</h3>
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
                  {detalle.productos?.map((prod, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px",
                        borderBottom: idx < detalle.productos.length - 1 ? "1px solid #e5e7eb" : "none",
                      }}
                    >
                      <div style={{ fontWeight: "600" }}>{prod.producto_nombre}</div>
                      <div style={{ fontSize: "14px", color: "#6b7280" }}>
                        Tendero: {prod.tendero_nombre} | Cantidad: {prod.cantidad} | ${prod.subtotal?.toLocaleString()}
                      </div>
                    </div>
                  ))}
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
                  <div style={{ fontSize: "14px", opacity: 0.9 }}>Total de la consolidación</div>
                  <div style={{ fontSize: "28px", fontWeight: "700" }}>
                    ${detalle.total?.toLocaleString()}
                  </div>
                </div>

                <h3>Acciones disponibles</h3>
                {accionesDisponibles(detalle.estado).length > 0 ? (
                  accionesDisponibles(detalle.estado).map((accion, idx) => (
                    <button
                      key={idx}
                      onClick={() => cambiarEstado(detalle.id, accion.nuevoEstado)}
                      style={{
                        background: "#1E3A8A",
                        color: "white",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        marginRight: "8px",
                        marginTop: "8px",
                      }}
                    >
                      {accion.texto}
                    </button>
                  ))
                ) : (
                  <p style={{ color: "#6b7280" }}>
                    Esta consolidación ya fue entregada. No hay acciones disponibles.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
