import React, { useEffect } from "react";
import PedidoForm from "../components/Tendero/PedidoForm";
import { useNavigate } from "react-router-dom";

export default function TenderoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    const userId = localStorage.getItem("user_id");
    if (!userId || rol !== "tendero") {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      {/* Barra superior */}
      <div style={{
        background: "white",
        borderBottom: "2px solid #e5e7eb",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => navigate("/historial-pedidos")}
            style={{
              padding: "10px 20px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.2s",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => e.target.style.background = "#5568d3"}
            onMouseLeave={(e) => e.target.style.background = "#667eea"}
          >
            📋 Ver Historial
          </button>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            transition: "all 0.2s",
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => e.target.style.background = "#dc2626"}
          onMouseLeave={(e) => e.target.style.background = "#ef4444"}
        >
          Cerrar Sesión
        </button>
      </div>

      <PedidoForm />
    </div>
  );
}
