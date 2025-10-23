import React from "react";
import LoginForm from "./components/LoginForm";
import ProveedorDashboard from "./components/Proveedor/ProveedorDashboard";
import "./App.css";

function App() {
  // Detectar la ruta actual
  const currentPath = window.location.pathname;

  // Si el usuario está en /proveedor, mostrar el dashboard
  if (currentPath === "/proveedor") {
    return <ProveedorDashboard />;
  }

  // Si está en cualquier otra ruta, mostrar el login
  return <LoginForm />;
}

export default App;
