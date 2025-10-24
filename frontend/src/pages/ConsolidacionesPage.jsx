import React, { useEffect, useState } from "react";
import "../App.css";

export default function ConsolidacionesPage() {
  const [consolidaciones, setConsolidaciones] = useState([]);
  const [consolidacionSeleccionada, setConsolidacionSeleccionada] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // === CARGAR CONSOLIDACIONES ===
  useEffect(() => {
    const obtenerConsolidaciones = async () => {
      try {
        const res = await fetch("/api/consolidaciones");
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(`Error ${res.status}: ${msg}`);
        }
        const data = await res.json();
        setConsolidaciones(data);
      } catch (err) {
        console.error("Error al cargar consolidaciones:", err);
        setError("No se pudieron cargar las consolidaciones");
      } finally {
        setCargando(false);
      }
    };
    obtenerConsolidaciones();
  }, []);

  // === CARGAR DETALLE DE CONSOLIDACIÓN ===
  const cargarDetalleConsolidacion = async (consolidacionId) => {
    try {
      const res = await fetch(`/api/consolidaciones/${consolidacionId}`);
      if (!res.ok) throw new Error("Error al cargar detalle");
      const data = await res.json();
      setDetalle(data);
      setConsolidacionSeleccionada(consolidacionId);
    } catch (err) {
      console.error("Error al cargar detalle:", err);
      alert("No se pudo cargar el detalle de la consolidación");
    }
  };

  // === COLORES DE ESTADO ===
  const getEstadoColor = (estado) => {
    const colores = {
      en_preparacion: "#f59e0b",
      enviado: "#3b82f6",
      entregado: "#10b981",
    };
    return colores[estado] || "#6b7280";
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      en_preparacion: "En Preparación",
      enviado: "Enviado",
      entregado: "Entregado",
    };
    return textos[estado] || estado;
  };

  if (cargando)
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <p>Cargando consolidaciones...</p>
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
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "white" }}>
            📦 Consolidaciones Creadas
          </h1>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
            Visualiza todas las consolidaciones con sus productos y proveedores asignados
          </p>
        </div>
      </div>

      {/* ======= Contenido ======= */}
      {consolidaciones.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            No hay consolidaciones creadas actualmente.
          </p>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>
            Ve a "Consolidar Pedidos" para crear consolidaciones desde pedidos pendientes.
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
          {/* ===== Lista de consolidaciones ===== */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ marginTop: 0 }}>Lista de Consolidaciones</h2>
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {consolidaciones.map((c) => (
                <div
                  key={c.id}
                  onClick={() => cargarDetalleConsolidacion(c.id)}
                  style={{
                    padding: "16px",
                    background:
                      consolidacionSeleccionada === c.id ? "#f3f4f6" : "white",
                    border: `2px solid ${
                      consolidacionSeleccionada === c.id ? "#1E3A8A" : "#e5e7eb"
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
                      Consolidación #{c.id}
                    </span>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: getEstadoColor(c.estado) + "20",
                        color: getEstadoColor(c.estado),
                      }}
                    >
                      {getEstadoTexto(c.estado)}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    🚛 {c.proveedor_nombre}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    📍 {c.zona_nombre}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#1E3A8A",
                      marginTop: "8px",
                    }}
                  >
                    ${c.total?.toLocaleString("es-CO")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== Detalle de la consolidación ===== */}
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
                <p>Selecciona una consolidación para ver sus detalles</p>
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
                    Consolidación #{detalle.id}
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
                  <strong>Proveedor:</strong> {detalle.proveedor_nombre}
                </p>
                <p>
                  <strong>Email:</strong> {detalle.proveedor_email}
                </p>
                <p>
                  <strong>Zona:</strong> {detalle.zona_nombre}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(detalle.fecha_consolidacion).toLocaleString("es-CO")}
                </p>

                <h3 style={{ fontSize: "16px", marginTop: "16px" }}>
                  Productos Consolidados
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
                  {Array.isArray(detalle.productos) &&
                  detalle.productos.length > 0 ? (
                    detalle.productos.map((prod, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "8px",
                          borderBottom:
                            idx < detalle.productos.length - 1
                              ? "1px solid #e5e7eb"
                              : "none",
                        }}
                      >
                        <div style={{ fontWeight: "600" }}>
                          {prod.producto_nombre}
                        </div>
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                          Tendero: {prod.tendero_nombre} | Cantidad:{" "}
                          {prod.cantidad} | Subtotal: $
                          {prod.subtotal?.toLocaleString("es-CO")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "#6b7280" }}>
                      No hay productos en esta consolidación
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
                    Total de la consolidación
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700" }}>
                    ${detalle.total?.toLocaleString("es-CO")}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
