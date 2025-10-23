import React, { useEffect, useState } from "react";
import "../../App.css";

function ProveedorDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener el id del proveedor guardado
  const proveedorId = localStorage.getItem("proveedorId")?.trim();;

  // Si no hay proveedor logueado, redirigir al login
  if (!proveedorId) {
    window.location.href = "/";
  }

  // Cargar pedidos del proveedor
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/proveedores/${proveedorId}/pedidos`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al cargar pedidos");
        }

        setPedidos(data);
      } catch (error) {
        console.error("❌ Error al obtener pedidos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [proveedorId]);

  // Mostrar estados de carga o error
  if (loading)
    return (
      <div className="bg-gradient">
        <div className="card" style={{ width: "400px", textAlign: "center" }}>
          <h2 className="login-title">Cargando pedidos...</h2>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-gradient">
        <div className="card" style={{ width: "400px", textAlign: "center" }}>
          <h2 className="login-title">⚠️ Error</h2>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </div>
    );

  return (
    <div className="bg-gradient">
      <div className="card container fadeIn" style={{ maxWidth: "900px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>📦 Pedidos Asignados</h2>
          <button
            onClick={() => {
              localStorage.removeItem("proveedorId");
              window.location.href = "/";
            }}
            className="btn btn-secondary"
          >
            Cerrar sesión
          </button>
        </div>

        {pedidos.length === 0 ? (
          <p>No tienes pedidos asignados actualmente.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Zona</th>
                <th>Tendero</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.pedido_id}>
                  <td>{p.pedido_id}</td>
                  <td>{p.zona}</td>
                  <td>{p.tendero}</td>
                  <td>{new Date(p.fecha).toLocaleDateString()}</td>
                  <td>{p.estado}</td>
                  <td>${p.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="login-footer">© 2025 Plataforma de Pedidos</p>
      </div>
    </div>
  );
}

export default ProveedorDashboard;
