import React from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

function PlataformaPage() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  return (
    <div className="bg-gradient min-h-screen flex flex-col items-center justify-center">
      <button onClick={handleLogout} className="logout-btn">
        Cerrar sesión
      </button>

      <div className="menu-box">
        <h2 className="menu-title">Panel Plataforma Central</h2>
        <p className="menu-subtitle">Selecciona una opción para continuar</p>

        <div className="menu-options">
          <button
            className="menu-btn"
            onClick={() => navigate("/listado-productos")}
          >
            📦 Listado de Productos
          </button>

          <button
            className="menu-btn"
            onClick={() => navigate("/informe-pedidos")}
          >
            📊 Informe de Pedidos
          </button>

          <button
            className="menu-btn"
            onClick={() => navigate("/consolidar-pedidos")}
          >
            🔄 Consolidar Pedidos
          </button>

          <button
            className="menu-btn"
            onClick={() => navigate("/consolidaciones")}
          >
            📦 Ver Consolidaciones
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlataformaPage;

