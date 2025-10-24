import pool from "../config/database.js";

async function checkAndMigrate() {
  const connection = await pool.getConnection();
  
  try {
    console.log("🔍 Verificando estructura de base de datos...\n");
    
    // Check if consolidacion_detalle exists
    const [cdTable] = await connection.query(`
      SELECT COUNT(*) as count
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'consolidacion_detalle'
    `);
    
    if (cdTable[0].count === 0) {
      console.log("📝 Creando tabla consolidacion_detalle...");
      await connection.query(`
        CREATE TABLE consolidacion_detalle (
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
        )
      `);
      console.log("✅ Tabla consolidacion_detalle creada\n");
    } else {
      console.log("✅ Tabla consolidacion_detalle ya existe\n");
    }
    
    // Check if categorias_proveedores exists
    const [cpTable] = await connection.query(`
      SELECT COUNT(*) as count
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'categorias_proveedores'
    `);
    
    if (cpTable[0].count === 0) {
      console.log("📝 Creando tabla categorias_proveedores...");
      await connection.query(`
        CREATE TABLE categorias_proveedores (
          id INT PRIMARY KEY AUTO_INCREMENT,
          categoria VARCHAR(50) NOT NULL UNIQUE,
          proveedor_id INT NOT NULL,
          FOREIGN KEY (proveedor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          INDEX idx_categoria (categoria)
        )
      `);
      console.log("✅ Tabla categorias_proveedores creada\n");
      
      // Insert initial data
      console.log("📝 Insertando datos iniciales de categorías...");
      await connection.query(`
        INSERT IGNORE INTO categorias_proveedores (categoria, proveedor_id) VALUES
        ('Granos y abarrotes', 4),
        ('Lácteos', 7),
        ('Bebidas', 6),
        ('Aseo', 5),
        ('Dulces y snacks', 9),
        ('Carnes', 10)
      `);
      console.log("✅ Datos iniciales insertados\n");
    } else {
      console.log("✅ Tabla categorias_proveedores ya existe\n");
    }
    
    // Check if consolidaciones has total column
    const [totalCol] = await connection.query(`
      SELECT COUNT(*) as count
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'consolidaciones'
      AND COLUMN_NAME = 'total'
    `);
    
    if (totalCol[0].count === 0) {
      console.log("📝 Agregando columna 'total' a consolidaciones...");
      await connection.query(`
        ALTER TABLE consolidaciones 
        ADD COLUMN total DECIMAL(10,2) NOT NULL DEFAULT 0.00
      `);
      console.log("✅ Columna 'total' agregada\n");
    } else {
      console.log("✅ Columna 'total' ya existe en consolidaciones\n");
    }
    
    // Check pedidos estado enum
    const [estadoCol] = await connection.query(`
      SELECT COLUMN_TYPE
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'pedidos'
      AND COLUMN_NAME = 'estado'
    `);
    
    if (estadoCol.length > 0) {
      const columnType = estadoCol[0].COLUMN_TYPE;
      if (!columnType.includes('recibido')) {
        console.log("📝 Actualizando estados de pedidos para incluir 'recibido'...");
        await connection.query(`
          ALTER TABLE pedidos 
          MODIFY COLUMN estado ENUM(
            'pendiente',
            'consolidacion',
            'asignacion',
            'despacho',
            'entregado',
            'recibido',
            'cancelado'
          ) NOT NULL DEFAULT 'pendiente'
        `);
        console.log("✅ Estados actualizados\n");
      } else {
        console.log("✅ Estado 'recibido' ya existe en pedidos\n");
      }
    }
    
    // Check if pedidos has consolidacion_id (should be removed)
    const [consIdCol] = await connection.query(`
      SELECT COUNT(*) as count
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'pedidos'
      AND COLUMN_NAME = 'consolidacion_id'
    `);
    
    if (consIdCol[0].count > 0) {
      console.log("📝 Eliminando columna 'consolidacion_id' de pedidos...");
      
      // First drop foreign key if exists
      const [fks] = await connection.query(`
        SELECT CONSTRAINT_NAME
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'pedidos'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      `);
      
      for (const fk of fks) {
        try {
          await connection.query(`ALTER TABLE pedidos DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
        } catch (e) {
          // Ignore if FK doesn't exist
        }
      }
      
      await connection.query(`ALTER TABLE pedidos DROP COLUMN consolidacion_id`);
      console.log("✅ Columna 'consolidacion_id' eliminada\n");
    } else {
      console.log("✅ Columna 'consolidacion_id' no existe en pedidos (correcto)\n");
    }
    
    console.log("🎉 Migración completada exitosamente!");
    
  } catch (error) {
    console.error("❌ Error durante la migración:", error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

checkAndMigrate();
