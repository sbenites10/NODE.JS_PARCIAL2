import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ProductosPage() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [productoActual, setProductoActual] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", tipo: "", precio: "" });

  // 🔹 Obtener productos del backend
  const obtenerProductos = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/productos");
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("❌ Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  // 🔹 Crear o editar producto
  const guardarProducto = async (e) => {
    e.preventDefault();
    const url = editando
      ? `http://localhost:5000/api/productos/${productoActual.id}`
      : "http://localhost:5000/api/productos";
    const method = editando ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(editando ? "✅ Producto actualizado" : "✅ Producto agregado");
        setShowModal(false);
        setFormData({ nombre: "", tipo: "", precio: "" });
        setEditando(false);
        obtenerProductos();
      } else {
        alert("⚠️ Error al guardar producto");
      }
    } catch (error) {
      console.error("❌ Error al guardar producto:", error);
    }
  };

  // 🔹 Abrir modal en modo edición
  const editarProducto = (producto) => {
    setProductoActual(producto);
    setFormData({
      nombre: producto.nombre,
      tipo: producto.tipo,
      precio: producto.precio,
    });
    setEditando(true);
    setShowModal(true);
  };

  return (
    <div className="productos-container bg-gradient">
      <div className="productos-header">
        <button className="btn-secondary" onClick={() => navigate("/plataforma")}>
          ← Volver al Menú
        </button>
        <h1 className="productos-title">📦 Gestión de Productos</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowModal(true);
            setEditando(false);
            setFormData({ nombre: "", tipo: "", precio: "" });
          }}
        >
          ➕ Crear Producto
        </button>
      </div>

      {/* Tabla centrada */}
      <div className="tabla-wrapper centered">
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length > 0 ? (
              productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.tipo}</td>
                  <td>${p.precio}</td>
                  <td>
                    <button
                      className="btn-warning"
                      onClick={() => editarProducto(p)}
                    >
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No hay productos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editando ? "✏️ Editar Producto" : "🧾 Crear Nuevo Producto"}
            </h2>
            <form onSubmit={guardarProducto} className="modal-form">
              <input
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Tipo"
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={formData.precio}
                onChange={(e) =>
                  setFormData({ ...formData, precio: e.target.value })
                }
                required
              />
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">
                  {editando ? "Actualizar" : "Guardar"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductosPage;
