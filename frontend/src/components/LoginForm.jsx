import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Usa los estilos globales

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Bienvenido, ${data.nombre} (${data.rol})`);

        // Redirigir según el rol:
          if (data.rol === "admin") {
          navigate("/plataforma");
        } else if (data.rol === "tendero") {
          navigate("/tendero");
        } else if (data.rol === "proveedor") {
          navigate("/proveedor");
        }
      } else {
        alert(`⚠️ ${data.message}`);
      }
    } catch (error) {
      console.error("Error en el login:", error);
      alert("❌ Error al conectar con el servidor");
    }
  };

  return (
    <div className="login-page bg-gradient">
      <div className="login-box card">
        <h2 className="login-title">Plataforma de Pedidos</h2>
        <p className="login-subtitle">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Ingresar
          </button>
        </form>

        <p className="login-footer">© 2025 Plataforma de Pedidos</p>
      </div>
    </div>
  );
}

export default LoginForm;
