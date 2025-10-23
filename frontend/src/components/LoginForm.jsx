import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function LoginForm() {
  const [isRegistro, setIsRegistro] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Bienvenido, ${data.nombre}`);

        localStorage.setItem("rol", data.rol);
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("user_id", data.id);

        if (data.rol === "tendero") {
          navigate("/tendero");
        } else if (data.rol === "proveedor") {
          localStorage.setItem("proveedorId", String(data.id).trim());
          navigate("/proveedor");
        } else if (data.rol === "admin") {
          navigate("/plataforma");
        }
      } else {
        alert(`⚠️ ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error en el login:", error);
      alert("❌ Error al conectar con el servidor");
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!nombre || !email || !password) {
      alert("⚠️ Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      const response = await fetch("/api/usuarios/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, contacto }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Registro exitoso. Bienvenido, ${data.nombre}`);
        
        localStorage.setItem("rol", data.rol);
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("user_id", data.id);
        
        navigate("/tendero");
      } else {
        alert(`⚠️ ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error en el registro:", error);
      alert("❌ Error al conectar con el servidor");
    }
  };

  return (
    <div className="login-page bg-gradient">
      <div className="login-box card" style={{ 
        maxHeight: "90vh", 
        overflowY: "auto",
        width: isRegistro ? "420px" : "380px"
      }}>
        <h2 className="login-title">Plataforma de Pedidos</h2>
        <p className="login-subtitle">
          {isRegistro ? "Regístrate como tendero" : "Inicia sesión para continuar"}
        </p>

        {!isRegistro ? (
          <form onSubmit={handleLogin}>
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

            <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px" }}>
              ¿No tienes cuenta?{" "}
              <span
                onClick={() => setIsRegistro(true)}
                style={{ color: "#4F46E5", cursor: "pointer", fontWeight: "600" }}
              >
                Regístrate aquí
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegistro}>
            <div className="input-group">
              <label>Nombre completo *</label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Correo electrónico *</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Contraseña *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Teléfono de contacto</label>
              <input
                type="text"
                placeholder="3001234567"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Registrarse
            </button>

            <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px" }}>
              ¿Ya tienes cuenta?{" "}
              <span
                onClick={() => setIsRegistro(false)}
                style={{ color: "#4F46E5", cursor: "pointer", fontWeight: "600" }}
              >
                Inicia sesión
              </span>
            </p>
          </form>
        )}

        <p className="login-footer">© 2025 Plataforma de Pedidos</p>
      </div>
    </div>
  );
}

export default LoginForm;
