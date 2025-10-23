import pool from "../config/database.js";

// 📦 Obtener todos los productos
export const getProductos = async (req, res) => {
  try {
    // Usamos pool directamente, sin callbacks
    const [rows] = await pool.query("SELECT * FROM productos");
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

// ➕ Crear producto
export const createProducto = async (req, res) => {
  const { nombre, tipo, precio } = req.body;

  // Validación básica
  if (!nombre || !tipo || !precio) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO productos (nombre, tipo, precio) VALUES (?, ?, ?)",
      [nombre, tipo, precio]
    );
    res.status(201).json({
      id: result.insertId,
      nombre,
      tipo,
      precio,
    });
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(500).json({ message: "Error al crear producto" });
  }
};

// ✏ Actualizar producto
export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, precio } = req.body;

  if (!nombre || !tipo || !precio) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE productos SET nombre=?, tipo=?, precio=? WHERE id=?",
      [nombre, tipo, precio, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

// ❌ Eliminar producto (opcional)
export const deleteProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM productos WHERE id=?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};


productocontroller