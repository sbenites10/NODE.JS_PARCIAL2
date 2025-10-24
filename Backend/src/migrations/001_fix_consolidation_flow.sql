-- Migration: Fix consolidation flow according to analisis.txt
-- This implements the proper many-to-many relationship between orders and consolidations

-- 1. Create consolidacion_detalle table (intermediate table)
CREATE TABLE IF NOT EXISTS consolidacion_detalle (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consolidacion_id INT NOT NULL,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (consolidacion_id) REFERENCES consolidaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  INDEX idx_consolidacion (consolidacion_id),
  INDEX idx_pedido (pedido_id),
  INDEX idx_producto (producto_id)
);

-- 2. Create categorias_proveedores table
CREATE TABLE IF NOT EXISTS categorias_proveedores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoria VARCHAR(50) NOT NULL UNIQUE,
  proveedor_id INT NOT NULL,
  FOREIGN KEY (proveedor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_categoria (categoria)
);

-- 3. Add total field to consolidaciones if not exists
ALTER TABLE consolidaciones 
ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- 4. Modify pedidos estado to include 'recibido'
-- Note: This will fail if the column already has the value, so we use a workaround
ALTER TABLE pedidos 
MODIFY COLUMN estado ENUM(
  'pendiente',
  'consolidacion',
  'asignacion',
  'despacho',
  'entregado',
  'recibido',
  'cancelado'
) NOT NULL DEFAULT 'pendiente';

-- 5. Remove consolidacion_id from pedidos (if exists)
-- First, check if the foreign key exists and drop it
SET @fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'pedidos'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    AND CONSTRAINT_NAME LIKE '%consolidacion%'
);

SET @drop_fk = IF(@fk_exists > 0, 
  'ALTER TABLE pedidos DROP FOREIGN KEY pedidos_ibfk_3', 
  'SELECT "FK does not exist"');
PREPARE stmt FROM @drop_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop the column if it exists
SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'pedidos'
    AND COLUMN_NAME = 'consolidacion_id'
);

SET @drop_col = IF(@col_exists > 0,
  'ALTER TABLE pedidos DROP COLUMN consolidacion_id',
  'SELECT "Column does not exist"');
PREPARE stmt FROM @drop_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Insert initial categorias_proveedores data
-- Note: Adjust proveedor_id values based on your actual provider IDs
INSERT IGNORE INTO categorias_proveedores (categoria, proveedor_id) VALUES
('Granos y abarrotes', 4),
('Lácteos', 7),
('Bebidas', 6),
('Aseo', 5),
('Dulces y snacks', 9),
('Carnes', 10);
