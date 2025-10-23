# Nuevo Flujo de Carrito - Módulo Tendero

## 🔄 Cambios Implementados

### **Problema Anterior**
- Los productos se agregaban directamente al backend
- Aparecían en el historial antes de confirmar
- No se podía eliminar productos individuales
- El botón "Limpiar" eliminaba el pedido del backend
- Confusión entre carrito temporal y pedido confirmado

### **Solución Implementada**
- **Carrito local** (frontend) hasta confirmar envío
- Solo se crea el pedido en backend al confirmar
- Eliminar productos individuales del carrito
- Limpiar carrito no afecta el backend
- Flujo claro: Carrito → Confirmar → Historial

---

## 📋 Nuevo Flujo Completo

### **1. Agregar Productos al Carrito**
```
Usuario selecciona producto → Ingresa cantidad → Click "Agregar"
↓
Producto se agrega al CARRITO LOCAL (estado en React)
↓
NO se toca el backend
↓
Usuario ve el producto en "Mi Carrito" con botón × para eliminar
```

**Características**:
- ✅ Carrito completamente local (useState)
- ✅ Si el producto ya existe, suma la cantidad
- ✅ Calcula subtotal automáticamente
- ✅ Muestra total en tiempo real
- ✅ Botón × rojo para eliminar producto individual

---

### **2. Gestión del Carrito**

**Eliminar Producto Individual**:
```javascript
// Botón × en cada producto
eliminarDelCarrito(producto_id)
↓
Filtra el carrito removiendo ese producto
↓
Recalcula total automáticamente
```

**Limpiar Todo el Carrito**:
```javascript
// Botón "Limpiar Carrito"
limpiarCarrito()
↓
Confirmación: "¿Estás seguro?"
↓
setCarrito([]) // Vacía el array
↓
NO toca el backend
```

---

### **3. Enviar Pedido (Confirmar)**

```
Usuario click "Enviar Pedido"
↓
Modal de confirmación con resumen
↓
Usuario revisa productos y total
↓
Click "Confirmar Envío"
↓
AHORA SÍ se crea el pedido en backend:
  1. POST /api/pedidos (crea pedido en estado "pendiente")
  2. POST /api/pedidos/:id/items (por cada producto del carrito)
  3. POST /api/pedidos/:id/enviar (confirma y recalcula total)
↓
Pedido queda en estado "pendiente"
↓
Carrito local se limpia
↓
Mensaje: "Pedido enviado. Estado: Pendiente de consolidación"
```

**Estados del Pedido**:
- **Pendiente**: Enviado por tendero, esperando consolidación de plataforma
  - ✅ **PUEDE CANCELAR** desde el historial
- **Consolidación**: Procesado por plataforma, enviado a proveedor
  - ❌ **NO PUEDE CANCELAR**
- **Asignación/Despacho/Entregado**: En proceso de entrega
  - ❌ **NO PUEDE CANCELAR**

---

### **4. Historial de Pedidos**

**Solo aparecen pedidos confirmados**:
- Pedidos que pasaron por el flujo completo
- Tienen estado (pendiente, consolidación, etc.)
- Pueden verse detalles
- Pueden cancelarse si están en "pendiente"

**Cancelación**:
```
Usuario en historial → Click en pedido "Pendiente"
↓
Ve detalle con mensaje: "Puedes cancelar mientras esté pendiente"
↓
Click "Cancelar Pedido"
↓
Confirmación: "¿Estás seguro?"
↓
DELETE /api/pedidos/:id
↓
Solo funciona si estado = "pendiente"
↓
Si estado = "consolidacion" → Error: "No se puede eliminar"
```

---

## 🔧 Cambios Técnicos

### **Frontend - PedidoForm.jsx**

**Estado del componente**:
```javascript
const [carrito, setCarrito] = useState([]); // Carrito local
const [productos, setProductos] = useState([]); // Catálogo
const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
const [enviando, setEnviando] = useState(false);
```

**Estructura del carrito**:
```javascript
[
  {
    producto_id: 1,
    nombre: "Arroz 1Kg",
    precio: 4500,
    cantidad: 2,
    subtotal: 9000
  },
  // ...más productos
]
```

**Funciones principales**:
- `agregarAlCarrito(producto)` - Agrega o actualiza cantidad
- `eliminarDelCarrito(producto_id)` - Elimina producto individual
- `limpiarCarrito()` - Vacía todo el carrito
- `calcularTotal()` - Suma todos los subtotales
- `confirmarEnvio()` - Muestra modal de confirmación
- `enviarPedido()` - Crea pedido en backend y envía items

---

### **Backend - pedidoController.js**

**Cambio en `enviarPedido()`**:
```javascript
// ANTES: Cambiaba estado a 'consolidacion'
await pool.query("UPDATE pedidos SET estado='consolidacion' WHERE id=?", [pedidoId]);

// AHORA: Mantiene estado 'pendiente'
// No cambia el estado, solo recalcula total
const total = await recalcTotal(pedidoId);
res.json({ ok: true, total });
```

**Razón**: El tendero envía el pedido, pero queda "pendiente" hasta que la plataforma lo consolide. Solo la plataforma puede cambiar el estado a "consolidacion".

---

### **Frontend - HistorialPedidosPage.jsx**

**Mensajes informativos por estado**:

**Pendiente**:
```
ℹ️ Este pedido está pendiente de consolidación por la plataforma.
   Puedes cancelarlo mientras esté en este estado.
[Botón: Cancelar Pedido]
```

**Consolidación**:
```
ℹ️ Este pedido ya fue consolidado por la plataforma y enviado al proveedor.
   Ya no puede ser cancelado.
```

**En proceso (asignación/despacho/entregado)**:
```
✓ Este pedido está en proceso de entrega
```

**Cancelado**:
```
✗ Este pedido fue cancelado
```

---

## ✅ Pruebas Realizadas

### Test 1: Crear pedido
```bash
POST /api/pedidos {"tendero_id":11}
→ {"id":5}
```

### Test 2: Agregar items
```bash
POST /api/pedidos/5/items {"producto_id":1,"cantidad":2}
→ {"ok":true,"total":"9000.00"}

POST /api/pedidos/5/items {"producto_id":2,"cantidad":3}
→ {"ok":true,"total":"20400.00"}
```

### Test 3: Confirmar pedido (mantiene pendiente)
```bash
POST /api/pedidos/5/enviar
→ {"ok":true,"total":"20400.00"}
```

### Test 4: Ver historial
```bash
GET /api/pedidos?tendero_id=11
→ [{"id":5,"fecha":"...","estado":"pendiente","total":"20400.00"}]
```

### Test 5: Cancelar pedido pendiente ✅
```bash
DELETE /api/pedidos/5
→ {"ok":true}
```

### Test 6: Intentar cancelar pedido consolidado ❌
```bash
# Cambiar estado a consolidacion
UPDATE pedidos SET estado='consolidacion' WHERE id=7

# Intentar cancelar
DELETE /api/pedidos/7
→ {"message":"No se puede eliminar"}
```

---

## 🎯 Flujo Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    PANEL DEL TENDERO                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CATÁLOGO                          MI CARRITO               │
│  ┌──────────────────┐             ┌──────────────────┐     │
│  │ Arroz 1Kg        │             │ Arroz 1Kg    [×] │     │
│  │ $4500            │             │ 2 × $4500        │     │
│  │ [1] [Agregar]    │             │ = $9000          │     │
│  └──────────────────┘             ├──────────────────┤     │
│                                   │ Lentejas 500g [×]│     │
│  ┌──────────────────┐             │ 3 × $3800        │     │
│  │ Lentejas 500g    │             │ = $11400         │     │
│  │ $3800            │             └──────────────────┘     │
│  │ [1] [Agregar]    │             Total: $20400            │
│  └──────────────────┘             [Enviar Pedido]          │
│                                   [Limpiar Carrito]        │
└─────────────────────────────────────────────────────────────┘
                         ↓
                  [Confirmar Envío]
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  HISTORIAL DE PEDIDOS                       │
├─────────────────────────────────────────────────────────────┤
│  Pedido #5                                                  │
│  ⏳ Pendiente de Consolidación                              │
│  $20400                                                     │
│  23/10/2025 21:02                                          │
│                                                             │
│  [Ver Detalle] → [Cancelar Pedido] ✅                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
              (Plataforma consolida)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Pedido #5                                                  │
│  📦 Consolidado por Plataforma                              │
│  $20400                                                     │
│  23/10/2025 21:02                                          │
│                                                             │
│  ℹ️ Ya no puede ser cancelado                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Resumen de Mejoras

### ✅ Implementado
1. **Carrito local** - No toca backend hasta confirmar
2. **Eliminar productos individuales** - Botón × en cada item
3. **Limpiar carrito** - Solo vacía el array local
4. **Envío crea pedido** - Backend solo se usa al confirmar
5. **Estados claros** - Pendiente (puede cancelar) vs Consolidación (no puede)
6. **Mensajes informativos** - Usuario sabe qué puede hacer en cada estado
7. **Historial limpio** - Solo pedidos confirmados

### 🎨 UX Mejorada
- Botón × rojo para eliminar productos
- Confirmación antes de limpiar carrito
- Modal de confirmación con resumen completo
- Mensajes claros según estado del pedido
- Feedback visual en cada acción

### 🔒 Lógica de Negocio
- Tendero: Envía pedido → Estado "Pendiente" → Puede cancelar
- Plataforma: Consolida pedido → Estado "Consolidación" → Ya no se puede cancelar
- Proveedor: Recibe pedido consolidado → Procesa entrega

---

## 🚀 Próximos Pasos (Opcional)

1. **Persistencia del carrito**: Guardar en localStorage para no perder al recargar
2. **Editar cantidad**: Input para cambiar cantidad sin eliminar y re-agregar
3. **Validaciones**: Stock disponible, cantidad máxima, etc.
4. **Notificaciones**: Toast en lugar de alerts
5. **Animaciones**: Transiciones al agregar/eliminar del carrito

---

## ✨ Resultado Final

El módulo del tendero ahora tiene un flujo lógico y claro:
- ✅ Carrito temporal para construir el pedido
- ✅ Confirmación antes de enviar
- ✅ Historial solo con pedidos reales
- ✅ Control sobre cancelaciones según estado
- ✅ Experiencia de usuario intuitiva

Todo funciona como un e-commerce moderno. 🛒
