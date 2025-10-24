import { useState, useEffect } from "react";
import { Api } from "../../services/api";

export default function ConsolidacionPanel() {
  const [consolidaciones, setConsolidaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [selectedConsolidacion, setSelectedConsolidacion] = useState(null);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    cargarConsolidaciones();
  }, []);

  async function cargarConsolidaciones() {
    try {
      const data = await Api.listarConsolidaciones();
      setConsolidaciones(data);
    } catch (error) {
      console.error("Error cargando consolidaciones:", error);
    }
  }

  async function consolidarPedidos() {
    if (!confirm("¿Consolidar todos los pedidos pendientes por categoría?")) return;
    
    setLoading(true);
    setMensaje("");
    
    try {
      const result = await Api.consolidarPorCategoria();
      setMensaje(`✅ ${result.message}. Pedidos procesados: ${result.pedidos_procesados}`);
      await cargarConsolidaciones();
    } catch (error) {
      setMensaje(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function verDetalle(consolidacionId) {
    try {
      const data = await Api.detalleConsolidacion(consolidacionId);
      setDetalle(data);
      setSelectedConsolidacion(consolidacionId);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    }
  }

  function cerrarDetalle() {
    setDetalle(null);
    setSelectedConsolidacion(null);
  }

  const estadoColor = (estado) => {
    switch (estado) {
      case 'en_preparacion': return 'bg-yellow-100 text-yellow-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'entregado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const estadoTexto = (estado) => {
    switch (estado) {
      case 'en_preparacion': return 'En Preparación';
      case 'enviado': return 'Enviado';
      case 'entregado': return 'Entregado';
      default: return estado;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Panel de Consolidación</h2>
        
        <button
          onClick={consolidarPedidos}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Consolidando..." : "Consolidar Pedidos Pendientes"}
        </button>
        
        {mensaje && (
          <div className={`mt-4 p-3 rounded ${mensaje.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Consolidaciones Creadas</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zona</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {consolidaciones.map((cons) => (
                <tr key={cons.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{cons.id}</td>
                  <td className="px-4 py-3 text-sm">{new Date(cons.fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm">{cons.zona_nombre}</td>
                  <td className="px-4 py-3 text-sm">{cons.proveedor_nombre}</td>
                  <td className="px-4 py-3 text-sm font-semibold">${cons.total?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${estadoColor(cons.estado)}`}>
                      {estadoTexto(cons.estado)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => verDetalle(cons.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {consolidaciones.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No hay consolidaciones creadas
            </div>
          )}
        </div>
      </div>

      {detalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Detalle Consolidación #{detalle.id}</h3>
              <button onClick={cerrarDetalle} className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Proveedor</p>
                  <p className="font-semibold">{detalle.proveedor_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Zona</p>
                  <p className="font-semibold">{detalle.zona_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${estadoColor(detalle.estado)}`}>
                    {estadoTexto(detalle.estado)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold text-lg">${detalle.total?.toLocaleString()}</p>
                </div>
              </div>

              <h4 className="font-semibold mb-3">Productos</h4>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tendero</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cantidad</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {detalle.productos?.map((prod, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm">{prod.producto_nombre}</td>
                      <td className="px-4 py-2 text-sm">{prod.tendero_nombre}</td>
                      <td className="px-4 py-2 text-sm">{prod.cantidad}</td>
                      <td className="px-4 py-2 text-sm">${prod.subtotal?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
