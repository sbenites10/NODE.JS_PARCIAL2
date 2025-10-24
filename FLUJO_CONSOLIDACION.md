# 📦 Flujo de Consolidación Implementado

## 🎯 Resumen

Se ha implementado el flujo completo de consolidación por categoría según el análisis detallado en `analisis.txt`. El sistema ahora permite que un pedido con productos de diferentes categorías sea dividido y asignado a múltiples proveedores automáticamente.

---

## 🔄 Flujo Completo

```
TENDERO → Crea pedido → Estado: PENDIENTE
    ↓
ADMIN → Consolida por categoría → Estado: CONSOLIDACION
    ↓
PROVEEDOR → Recibe pedido → Estado: ASIGNACION
    ↓
PROVEEDOR → Envía productos → Estado: DESPACHO
    ↓
PROVEEDOR → Entrega → Estado: ENVIADO
    ↓
TENDERO → Confirma recepción → Estado: RECIBIDO
```

---

## 🗄️ Cambios en Base de Datos

### Nuevas Tablas

#### 1. `consolidacion_detalle`
Tabla intermedia que relaciona productos de pedidos con consolidaciones.

```sql
CREATE TABLE consolidacion_detalle (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consolidacion_id INT NOT NULL,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (consolidacion_id) REFERENCES consolidaciones(id),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

**Beneficio**: Permite que productos del mismo pedido vayan a diferentes consolidaciones.

#### 2. `categorias_proveedores`
Mapea categorías de productos a proveedores específicos.

```sql
CREATE TABLE categorias_proveedores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoria VARCHAR(50) NOT NULL UNIQUE,
  proveedor_id INT NOT NULL,
  FOREIGN KEY (proveedor_id) REFERENCES usuarios(id)
);
```

**Datos iniciales**:
- Granos y abarrotes → Proveedor ID 4
- Lácteos → Proveedor ID 7
- Bebidas → Proveedor ID 6
- Aseo → Proveedor ID 5
- Dulces y snacks → Proveedor ID 9
- Carnes → Proveedor ID 10

### Modificaciones a Tablas Existentes

#### Tabla `pedidos`
- ✅ **Agregado**: Estado `recibido`
- ✅ **Eliminado**: Columna `consolidacion_id` (ya no es necesaria)

Estados actuales:
```
pendiente → consolidacion → asignacion → despacho → entregado → recibido
```

#### Tabla `consolidaciones`
- ✅ **Agregado**: Columna `total` (DECIMAL(10,2))

---

## 🔧 Backend - Nuevos Endpoints

### Admin - Consolidación

#### `POST /api/consolidaciones/consolidar`
Consolida todos los pedidos pendientes agrupándolos por categoría y zona.

**Proceso**:
1. Obtiene todos los pedidos en estado `pendiente`
2. Agrupa productos por categoría y zona
3. Para cada grupo:
   - Obtiene el proveedor asignado a esa categoría
   - Crea una consolidación
   - Agrega productos a `consolidacion_detalle`
4. Actualiza estado de pedidos a `consolidacion`

**Response**:
```json
{
  "message": "Se consolidaron 3 grupos de productos",
  "pedidos_procesados": 5,
  "consolidaciones": [
    {
      "id": 1,
      "categoria": "Granos y abarrotes",
      "zona_id": 1,
      "proveedor": "Distribuidora Granos",
      "total": 45000,
      "productos": 8
    }
  ]
}
```

#### `GET /api/consolidaciones`
Lista todas las consolidaciones creadas.

#### `GET /api/consolidaciones/:id`
Obtiene detalle de una consolidación específica con todos sus productos.

### Proveedor - Gestión de Consolidaciones

#### `GET /api/consolidaciones/proveedor/mis-consolidaciones?proveedor_id=X`
Lista consolidaciones asignadas a un proveedor específico.

#### `PUT /api/consolidaciones/:id/estado`
Actualiza el estado de una consolidación.

**Body**:
```json
{
  "estado": "enviado"  // en_preparacion | enviado | entregado
}
```

**Proceso**:
1. Actualiza estado de la consolidación
2. Recalcula estado de todos los pedidos afectados
3. El estado del pedido depende del estado de TODAS sus consolidaciones

**Lógica de estados del pedido**:
- Si todas las consolidaciones están `entregado` → pedido `entregado`
- Si al menos una está `enviado` → pedido `despacho`
- Si todas están `en_preparacion` → pedido `asignacion`
- Estado mixto → pedido `consolidacion`

### Tendero - Seguimiento

#### `GET /api/consolidaciones/pedido/:id/estado-detallado`
Obtiene estado detallado del pedido con información de cada consolidación.

**Response**:
```json
{
  "id": 1,
  "fecha": "2024-10-24",
  "estado": "despacho",
  "total": 50000,
  "consolidaciones": [
    {
      "consolidacion_id": 1,
      "estado": "entregado",
      "proveedor": "Distribuidora Granos",
      "productos": [
        {
          "producto": "Arroz 1Kg",
          "categoria": "Granos y abarrotes",
          "cantidad": 2,
          "subtotal": 9000
        }
      ]
    },
    {
      "consolidacion_id": 2,
      "estado": "enviado",
      "proveedor": "Dulces Ramírez",
      "productos": [
        {
          "producto": "Chocolate",
          "categoria": "Dulces y snacks",
          "cantidad": 3,
          "subtotal": 6000
        }
      ]
    }
  ]
}
```

#### `PUT /api/pedidos/:id/confirmar-recepcion`
Confirma que el tendero recibió todos los productos del pedido.

**Requisito**: El pedido debe estar en estado `entregado`.

### Categorías-Proveedores (Admin)

#### `GET /api/categorias-proveedores`
Lista todas las asignaciones categoría-proveedor.

#### `POST /api/categorias-proveedores`
Crea nueva asignación categoría-proveedor.

#### `PUT /api/categorias-proveedores/:id`
Actualiza el proveedor asignado a una categoría.

---

## 🎨 Frontend - Nuevos Componentes

### Admin

#### `ConsolidacionPanel.jsx`
Panel de administración para:
- Consolidar pedidos pendientes con un clic
- Ver lista de todas las consolidaciones
- Ver detalle de cada consolidación
- Monitorear estados

**Ubicación**: `/src/components/Admin/ConsolidacionPanel.jsx`

### Proveedor

#### `ConsolidacionesProveedor.jsx`
Dashboard para proveedores que permite:
- Ver consolidaciones asignadas
- Ver detalle de productos por consolidación
- Cambiar estado de consolidaciones:
  - `en_preparacion` → `enviado`
  - `enviado` → `entregado`

**Ubicación**: `/src/components/Proveedor/ConsolidacionesProveedor.jsx`

### Tendero

#### `PedidoDetalle.jsx`
Modal que muestra:
- Estado general del pedido
- Desglose por proveedor/consolidación
- Estado individual de cada consolidación
- Botón para confirmar recepción (cuando estado = `entregado`)

**Ubicación**: `/src/components/Tendero/PedidoDetalle.jsx`

---

## 📊 Ejemplo de Flujo Completo

### Escenario
**Tendero crea pedido con**:
- 2x Arroz 1Kg (Granos y abarrotes) - $9,000
- 3x Chocolate (Dulces y snacks) - $6,000
- 1x Aceite (Granos y abarrotes) - $8,000

### Paso 1: Tendero crea pedido
```
Pedido #1
  Estado: pendiente
  Total: $23,000
  Productos: 3 items
```

### Paso 2: Admin consolida
```
Consolidación #1 (Granos y abarrotes)
  Proveedor: Distribuidora Granos (ID 4)
  Productos:
    - Arroz 1Kg x2 = $9,000
    - Aceite x1 = $8,000
  Total: $17,000
  Estado: en_preparacion

Consolidación #2 (Dulces y snacks)
  Proveedor: Dulces Ramírez (ID 9)
  Productos:
    - Chocolate x3 = $6,000
  Total: $6,000
  Estado: en_preparacion

Pedido #1
  Estado: asignacion (todas las consolidaciones en preparación)
```

### Paso 3: Proveedor de Granos envía
```
Consolidación #1
  Estado: enviado

Pedido #1
  Estado: despacho (al menos una consolidación enviada)
```

### Paso 4: Proveedor de Dulces envía
```
Consolidación #2
  Estado: enviado

Pedido #1
  Estado: despacho (todas enviadas pero ninguna entregada)
```

### Paso 5: Ambos proveedores entregan
```
Consolidación #1
  Estado: entregado

Consolidación #2
  Estado: entregado

Pedido #1
  Estado: entregado (todas las consolidaciones entregadas)
```

### Paso 6: Tendero confirma recepción
```
Pedido #1
  Estado: recibido
```

---

## 🚀 Cómo Usar

### 1. Ejecutar Migración
```bash
cd Backend
node src/utils/checkAndMigrate.js
```

### 2. Iniciar Backend
```bash
cd Backend
node server.js
```

### 3. Iniciar Frontend
```bash
cd frontend
npm run dev
```

### 4. Flujo de Uso

#### Como Admin:
1. Ir a panel de consolidación
2. Hacer clic en "Consolidar Pedidos Pendientes"
3. Ver consolidaciones creadas agrupadas por categoría

#### Como Proveedor:
1. Ver consolidaciones asignadas
2. Seleccionar una consolidación
3. Cambiar estado según progreso:
   - Marcar como "Enviado" cuando se despacha
   - Marcar como "Entregado" cuando se entrega

#### Como Tendero:
1. Ver historial de pedidos
2. Hacer clic en un pedido para ver detalle
3. Ver estado de cada proveedor/consolidación
4. Cuando todas estén entregadas, confirmar recepción

---

## ✅ Ventajas del Nuevo Sistema

1. **Consolidación Automática**: El sistema agrupa productos por categoría automáticamente
2. **Múltiples Proveedores**: Un pedido puede ir a varios proveedores sin conflictos
3. **Seguimiento Detallado**: El tendero ve el estado de cada proveedor por separado
4. **Estados Precisos**: El estado del pedido refleja el progreso real de todas sus partes
5. **Escalable**: Fácil agregar nuevas categorías y proveedores
6. **Trazabilidad**: Cada producto tiene registro de qué consolidación lo manejó

---

## 🔍 Verificación

Para verificar que todo funciona:

1. **Base de datos**:
```sql
-- Verificar tablas nuevas
SHOW TABLES LIKE 'consolidacion_detalle';
SHOW TABLES LIKE 'categorias_proveedores';

-- Ver categorías asignadas
SELECT * FROM categorias_proveedores;
```

2. **Backend**:
```bash
# Probar endpoint de consolidación
curl -X POST http://localhost:5000/api/consolidaciones/consolidar
```

3. **Frontend**:
- Crear pedido como tendero
- Consolidar como admin
- Gestionar como proveedor
- Confirmar como tendero

---

## 📝 Notas Importantes

- Los IDs de proveedores en `categorias_proveedores` deben coincidir con los usuarios de tipo "proveedor" en tu base de datos
- Si un producto tiene una categoría sin proveedor asignado, no se consolidará (se mostrará advertencia en logs)
- El estado del pedido se recalcula automáticamente cada vez que cambia el estado de una consolidación
- Solo se pueden confirmar recepciones de pedidos en estado `entregado`

---

## 🐛 Troubleshooting

### Error: "No hay proveedor asignado para la categoría X"
**Solución**: Agregar la categoría en `categorias_proveedores`:
```sql
INSERT INTO categorias_proveedores (categoria, proveedor_id) 
VALUES ('Nombre Categoría', ID_PROVEEDOR);
```

### Pedido no cambia de estado
**Verificar**: Que todas las consolidaciones del pedido tengan el estado esperado:
```sql
SELECT c.id, c.estado 
FROM consolidaciones c
JOIN consolidacion_detalle cd ON cd.consolidacion_id = c.id
WHERE cd.pedido_id = X;
```

### Consolidación no aparece para proveedor
**Verificar**: Que el proveedor_id de la consolidación coincida con el usuario:
```sql
SELECT * FROM consolidaciones WHERE proveedor_id = X;
```

---

## 📚 Archivos Modificados/Creados

### Backend
- ✅ `src/migrations/001_fix_consolidation_flow.sql`
- ✅ `src/models/Consolidacion.js`
- ✅ `src/models/ConsolidacionDetalle.js`
- ✅ `src/models/CategoriaProveedor.js`
- ✅ `src/controllers/consolidacionController.js`
- ✅ `src/controllers/categoriaProveedorController.js`
- ✅ `src/controllers/pedidoController.js` (modificado)
- ✅ `src/routes/consolidacionRoutes.js`
- ✅ `src/routes/categoriaProveedorRoutes.js`
- ✅ `src/routes/pedidoRoutes.js` (modificado)
- ✅ `server.js` (modificado)

### Frontend
- ✅ `src/services/api.js` (modificado)
- ✅ `src/components/Admin/ConsolidacionPanel.jsx`
- ✅ `src/components/Proveedor/ConsolidacionesProveedor.jsx`
- ✅ `src/components/Tendero/PedidoDetalle.jsx`

### Documentación
- ✅ `FLUJO_CONSOLIDACION.md` (este archivo)

---

## 🎉 Conclusión

El sistema ahora implementa completamente el flujo descrito en `analisis.txt`, permitiendo:
- Consolidación automática por categoría
- Múltiples proveedores por pedido
- Seguimiento detallado del estado
- Confirmación de recepción por el tendero

El flujo es escalable, mantenible y refleja correctamente el proceso de negocio real.
