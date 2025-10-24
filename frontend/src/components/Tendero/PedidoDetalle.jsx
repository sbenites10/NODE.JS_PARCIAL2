import { useState, useEffect } from "react";
import { Api } from "../../services/api";

export default function PedidoDetalle({ pedidoId, onClose }) {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarDetalle();
  }, [pedidoId]);

  async function cargarDetalle() {
    try {
      const data = await Api.estadoDetalladoPedido(pedidoId);
      setDetalle(data);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setLoading(false);
    }
  }

  async function confirmarRecepcion() {
    if (!confirm("¿Confirmar que recibiste todos los productos del pedido?")) return;
    
    setMensaje("");
    try {
      await Api.confirmarRecepcion(pedidoId);
      setMensaje("✅ Recepción confirmada correctamente");
      await cargarDetalle();
    } catch (error) {
      setMensaje(`❌ Error: ${error.message}`);
    }
  }

  const estadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return '#6b7280';
      case 'consolidacion': return '#f59e0b';
      case 'asignacion': return '#8b5cf6';
      case 'despacho': return '#3b82f6';
      case 'entregado': return '#10b981';
      case 'recibido': return '#059669';
      case 'cancelado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const estadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'consolidacion': return 'En Consolidación';
      case 'asignacion': return 'Asignado a Proveedores';
      case 'despacho': return 'En Despacho';
      case 'entregado': return 'Entregado';
      case 'recibido': return 'Recibido';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  const estadoConsolidacionColor = (estado) => {
    switch (estado) {
      case 'en_preparacion': return '#f59e0b';
      case 'enviado': return '#3b82f6';
      case 'entregado': return '#10b981';
      default: return '#6b7280';
    }
  };

  const estadoConsolidacionTexto = (estado) => {
    switch (estado) {
      case 'en_preparacion': return '📦 En Preparación';
      case 'enviado': return '🚚 Enviado';
      case 'entregado': return '✅ Entregado';
      default: return estado;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p>Cargando detalle...</p>
        </div>
      </div>
    );
  }

  if (!detalle) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Detalle del Pedido #{detalle.id}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {mensaje && (
            <div
              className={`mb-4 p-3 rounded ${
                mensaje.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {mensaje}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Fecha</p>
              <p className="font-semibold">{new Date(detalle.fecha).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado General</p>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background: estadoColor(detalle.estado) + "20",
                  color: estadoColor(detalle.estado),
                }}
              >
                {estadoTexto(detalle.estado)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total del Pedido</p>
              <p className="font-bold text-2xl text-blue-900">${detalle.total?.toLocaleString()}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-4">Seguimiento por Proveedor</h3>
          
          {detalle.consolidaciones && detalle.consolidaciones.length > 0 ? (
            <div className="space-y-4">
              {detalle.consolidaciones.map((cons, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4"
                  style={{ borderColor: estadoConsolidacionColor(cons.estado) }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{cons.proveedor}</h4>
                      <p className="text-sm text-gray-600">Consolidación #{cons.consolidacion_id}</p>
                    </div>
                    <span
                      style={{
                        padding: "6px 16px",
                        borderRadius: "16px",
                        fontSize: "14px",
                        fontWeight: "600",
                        background: estadoConsolidacionColor(cons.estado) + "20",
                        color: estadoConsolidacionColor(cons.estado),
                      }}
                    >
                      {estadoConsolidacionTexto(cons.estado)}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm font-semibold mb-2">Productos:</p>
                    {cons.productos.map((prod, pidx) => (
                      <div key={pidx} className="flex justify-between text-sm py-1">
                        <span>
                          {prod.producto} ({prod.categoria})
                        </span>
                        <span className="font-semibold">
                          x{prod.cantidad} - ${prod.subtotal?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
              <p className="text-yellow-800">
                Este pedido aún no ha sido consolidado por la plataforma.
              </p>
            </div>
          )}

          {detalle.estado === 'entregado' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="mb-3 text-blue-900 font-semibold">
                ¿Recibiste todos los productos correctamente?
              </p>
              <button
                onClick={confirmarRecepcion}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
              >
                ✅ Confirmar Recepción
              </button>
            </div>
          )}

          {detalle.estado === 'recibido' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-center">
              <p className="text-green-800 font-semibold">
                ✅ Pedido recibido y confirmado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
