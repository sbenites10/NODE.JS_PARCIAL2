import React, { useEffect, useState } from "react";

export default function InformePedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ✅ Cargar pedidos al iniciar
  useEffect(() => {
    fetch("http://localhost:3000/api/pedidos")
      .then((res) => res.json())
      .then((data) => {
        setPedidos(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar pedidos:", err);
        setCargando(false);
      });
  }, []);

  // ✅ Cambiar estado del pedido
  const cambiarEstado = async (idPedido, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:3000/api/pedidos/${idPedido}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar el estado");
      }

      // Actualiza visualmente sin recargar
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) =>
          pedido.id === idPedido ? { ...pedido, estado: nuevoEstado } : pedido
        )
      );

      alert("Estado actualizado correctamente ✅");
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("No se pudo actualizar el estado ❌");
    }
  };

  if (cargando) return <p>Cargando pedidos...</p>;

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2>📋 Informe de Pedidos</h2>
      <table
        style={{
          borderCollapse: "collapse",
          width: "80%",
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Cliente</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Estado</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{pedido.id}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{pedido.cliente}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{pedido.estado}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {pedido.estado === "Pendiente" ? (
                  <button
                    onClick={() => cambiarEstado(pedido.id, "En asignación")}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Cambiar a En Asignación
                  </button>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
