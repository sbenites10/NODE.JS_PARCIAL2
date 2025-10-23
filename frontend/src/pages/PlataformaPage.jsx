import React from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

function PlataformaPage() {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Elimina los datos de sesión (si los guardas)
    localStorage.removeItem("usuario");
    // Redirige al login
    window.location.href = "/";
  };

  const handleNavigate = (ruta) => {
    alert(`🔄 Navegando a: ${ruta}`);
    // Aquí luego conectarás con React Router o tus vistas reales
  };

  return (
    <div className="bg-gradient min-h-screen flex flex-col items-center justify-center">
      {/* Botón cerrar sesión */}
      <button onClick={handleLogout} className="logout-btn">
        Cerrar sesión
      </button>

      {/* Contenedor principal */}
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
            onClick={() => handleNavigate("informe-pedidos")}
          >
            📊 Informe de Pedidos
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlataformaPage;
