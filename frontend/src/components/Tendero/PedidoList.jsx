import React, { useEffect, useState } from "react";
import { Api } from "../../services/api";

export default function PedidoList() {
  const tendero_id = Number(localStorage.getItem("user_id"));
  const [rows, setRows] = useState([]);

  useEffect(() => {
    Api.misPedidos(tendero_id).then(setRows).catch(console.error);
  }, [tendero_id]);

  return (
    <div>
      <h2>Historial de pedidos</h2>
      <table>
        <thead><tr><th>Fecha</th><th>Estado</th><th>Total</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{new Date(r.fecha).toLocaleString()}</td>
              <td>{r.estado}</td>
              <td>${r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
