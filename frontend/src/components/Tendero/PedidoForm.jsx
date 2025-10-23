import React, { useEffect, useState, useRef } from "react";
import { Api } from "../../services/api";
import "../../App.css";

export default function PedidoForm() {
  const tendero_id = Number(localStorage.getItem("user_id"));
  const nombreTendero = localStorage.getItem("nombre");
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]); // Carrito local
  const [busqueda, setBusqueda] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("Todos");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const cantidadRefs = useRef({});

  useEffect(() => {
    Api.productos().then(setProductos).catch(console.error);
  }, []);

  const tipos = ["Todos", ...new Set(productos.map(p => p.tipo).filter(Boolean))];

  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo = tipoSeleccionado === "Todos" || p.tipo === tipoSeleccionado;
    return matchBusqueda && matchTipo;
  });

  const productosAgrupados = productosFiltrados.reduce((acc, p) => {
    const tipo = p.tipo || "Sin categoría";
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(p);
    return acc;
  }, {});

  // Calcular total del carrito
  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // Agregar producto al carrito (local)
  const agregarAlCarrito = (p) => {
    const input = cantidadRefs.current[p.id];
    const cantidad = Number(input?.value || 1);
    
    if (cantidad < 1) {
      alert("⚠️ La cantidad debe ser mayor a 0");
      return;
    }

    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.producto_id === p.id);
    
    if (itemExistente) {
      // Actualizar cantidad
      setCarrito(carrito.map(item => 
        item.producto_id === p.id 
          ? { ...item, cantidad: item.cantidad + cantidad, subtotal: (item.cantidad + cantidad) * p.precio }
          : item
      ));
    } else {
      // Agregar nuevo item
      setCarrito([...carrito, {
        producto_id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        cantidad: cantidad,
        subtotal: cantidad * p.precio
      }]);
    }
    
    if (input) input.value = "";
  };

  // Eliminar producto individual del carrito
  const eliminarDelCarrito = (producto_id) => {
    setCarrito(carrito.filter(item => item.producto_id !== producto_id));
  };

  // Limpiar todo el carrito
  const limpiarCarrito = () => {
    if (!window.confirm("¿Estás seguro de limpiar el carrito?")) return;
    setCarrito([]);
  };

  // Confirmar envío
  const confirmarEnvio = () => {
    if (carrito.length === 0) {
      alert("⚠️ No puedes enviar un pedido vacío");
      return;
    }
    setMostrarConfirmacion(true);
  };

  // Enviar pedido al backend
  const enviarPedido = async () => {
    setEnviando(true);
    try {
      // 1. Crear pedido en el backend (estado: pendiente)
      const { id: pedidoId } = await Api.crearOBuscarBorrador(tendero_id);
      
      // 2. Agregar todos los items del carrito
      for (const item of carrito) {
        await Api.addItem(pedidoId, item.producto_id, item.cantidad);
      }
      
      // 3. Confirmar el pedido (recalcula total, mantiene estado pendiente)
      await Api.enviar(pedidoId);
      
      alert("✅ Pedido enviado a la plataforma. Estado: Pendiente de consolidación.\n\nPodrás cancelarlo desde el historial mientras esté en estado 'Pendiente'.");
      setMostrarConfirmacion(false);
      setCarrito([]); // Limpiar carrito
    } catch (error) {
      console.error("Error enviando pedido:", error);
      alert("❌ Error al enviar pedido. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "24px",
        color: "white"
      }}>
        <h1 style={{ margin: 0, fontSize: "28px" }}>Panel de Tendero - {nombreTendero}</h1>
        <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>Crea tu pedido seleccionando productos del catálogo</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Catálogo */}
        <div className="card" style={{ padding: "24px" }}>
          <h2 style={{ marginTop: 0 }}>📦 Catálogo de Productos</h2>
          
          {/* Búsqueda y filtros */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="🔍 Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "12px"
              }}
            />
            
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {tipos.map(tipo => (
                <button
                  key={tipo}
                  onClick={() => setTipoSeleccionado(tipo)}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "20px",
                    background: tipoSeleccionado === tipo ? "#667eea" : "#f3f4f6",
                    color: tipoSeleccionado === tipo ? "white" : "#374151",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Productos agrupados */}
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {Object.entries(productosAgrupados).map(([tipo, prods]) => (
              <div key={tipo} style={{ marginBottom: "24px" }}>
                <h3 style={{ 
                  color: "#667eea", 
                  fontSize: "16px",
                  marginBottom: "12px",
                  borderBottom: "2px solid #e5e7eb",
                  paddingBottom: "8px"
                }}>
                  {tipo}
                </h3>
                {prods.map(p => (
                  <div key={p.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    marginBottom: "8px"
                  }}>
                    <span style={{ flex: 1, fontWeight: "500" }}>{p.nombre}</span>
                    <span style={{ color: "#059669", fontWeight: "600" }}>${p.precio}</span>
                    <input
                      ref={el => cantidadRefs.current[p.id] = el}
                      type="number"
                      min="1"
                      defaultValue="1"
                      placeholder="Cant."
                      style={{
                        width: "70px",
                        padding: "8px",
                        border: "2px solid #e5e7eb",
                        borderRadius: "6px",
                        textAlign: "center"
                      }}
                    />
                    <button
                      onClick={() => agregarAlCarrito(p)}
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", fontSize: "14px" }}
                    >
                      Agregar
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Carrito */}
        <div className="card" style={{ padding: "24px", position: "sticky", top: "24px", height: "fit-content" }}>
          <h2 style={{ marginTop: 0 }}>🛒 Mi Carrito</h2>
          
          {carrito.length === 0 ? (
            <p style={{ color: "#6b7280", textAlign: "center", padding: "40px 0" }}>
              No hay productos en el carrito
            </p>
          ) : (
            <>
              <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "16px" }}>
                {carrito.map(item => (
                  <div key={item.producto_id} style={{
                    padding: "12px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    position: "relative"
                  }}>
                    <button
                      onClick={() => eliminarDelCarrito(item.producto_id)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold"
                      }}
                      title="Eliminar producto"
                    >
                      ×
                    </button>
                    <div style={{ fontWeight: "500", marginBottom: "4px", paddingRight: "30px" }}>
                      {item.nombre}
                    </div>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                      Cantidad: {item.cantidad} × ${Number(item.precio).toFixed(2)} = ${item.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                padding: "16px",
                background: "#667eea",
                color: "white",
                borderRadius: "8px",
                marginBottom: "16px"
              }}>
                <div style={{ fontSize: "14px", opacity: 0.9 }}>Total del carrito</div>
                <div style={{ fontSize: "28px", fontWeight: "700" }}>${calcularTotal().toFixed(2)}</div>
              </div>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={confirmarEnvio}
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px" }}
              disabled={carrito.length === 0}
            >
              Enviar Pedido
            </button>
            <button
              onClick={limpiarCarrito}
              className="btn btn-secondary"
              style={{ width: "100%", padding: "12px" }}
              disabled={carrito.length === 0}
            >
              Limpiar Carrito
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            padding: "32px", 
            maxWidth: "500px",
            margin: "20px"
          }}>
            <h2 style={{ marginTop: 0 }}>Confirmar Envío de Pedido</h2>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              Tu pedido será enviado a la plataforma para consolidación. Podrás cancelarlo mientras esté en estado "Pendiente".
            </p>
            
            <div style={{ 
              background: "#f9fafb", 
              padding: "16px", 
              borderRadius: "8px",
              marginBottom: "20px",
              maxHeight: "200px",
              overflowY: "auto"
            }}>
              {carrito.map(item => (
                <div key={item.producto_id} style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  marginBottom: "8px"
                }}>
                  <span>{item.nombre} x{item.cantidad}</span>
                  <span style={{ fontWeight: "600" }}>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ 
                borderTop: "2px solid #e5e7eb",
                marginTop: "12px",
                paddingTop: "12px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "18px",
                fontWeight: "700"
              }}>
                <span>Total:</span>
                <span style={{ color: "#667eea" }}>${calcularTotal().toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: "12px" }}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                onClick={enviarPedido}
                className="btn btn-primary"
                style={{ flex: 1, padding: "12px" }}
                disabled={enviando}
              >
                {enviando ? "Enviando..." : "Confirmar Envío"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
