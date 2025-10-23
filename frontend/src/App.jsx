import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import PlataformaPage from "./pages/PlataformaPage";
import ProductosPage from "./pages/ProductosPage";
import ProveedorDashboard from "./components/Proveedor/ProveedorDashboard";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página principal (login) */}
        <Route path="/" element={<LoginForm />} />

        {/* Plataforma general */}
        <Route path="/plataforma" element={<PlataformaPage />} />

        {/* Listado de productos */}
        <Route path="/listado-productos" element={<ProductosPage />} />

        {/* Dashboard del proveedor */}
        <Route path="/proveedor" element={<ProveedorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
