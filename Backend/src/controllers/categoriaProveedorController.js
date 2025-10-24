import CategoriaProveedor from "../models/CategoriaProveedor.js";

export const listarCategoriasProveedores = async (req, res) => {
  try {
    const categorias = await CategoriaProveedor.listarTodas();
    res.json(categorias);
  } catch (error) {
    console.error("Error en listarCategoriasProveedores:", error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
};

export const obtenerProveedorPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    const proveedor = await CategoriaProveedor.obtenerProveedorPorCategoria(categoria);
    
    if (!proveedor) {
      return res.status(404).json({ 
        message: `No hay proveedor asignado para la categoría: ${categoria}` 
      });
    }
    
    res.json(proveedor);
  } catch (error) {
    console.error("Error en obtenerProveedorPorCategoria:", error);
    res.status(500).json({ message: "Error al obtener proveedor" });
  }
};

export const crearCategoriaProveedor = async (req, res) => {
  try {
    const { categoria, proveedor_id } = req.body;
    
    if (!categoria || !proveedor_id) {
      return res.status(400).json({ 
        message: "categoria y proveedor_id son requeridos" 
      });
    }
    
    const id = await CategoriaProveedor.crear(categoria, proveedor_id);
    res.status(201).json({ 
      message: "Categoría-Proveedor creada correctamente",
      id 
    });
  } catch (error) {
    console.error("Error en crearCategoriaProveedor:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        message: "Ya existe un proveedor asignado para esta categoría" 
      });
    }
    
    res.status(500).json({ message: "Error al crear categoría-proveedor" });
  }
};

export const actualizarCategoriaProveedor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { proveedor_id } = req.body;
    
    if (!proveedor_id) {
      return res.status(400).json({ message: "proveedor_id es requerido" });
    }
    
    await CategoriaProveedor.actualizar(id, proveedor_id);
    res.json({ message: "Categoría-Proveedor actualizada correctamente" });
  } catch (error) {
    console.error("Error en actualizarCategoriaProveedor:", error);
    res.status(500).json({ message: "Error al actualizar categoría-proveedor" });
  }
};

export const eliminarCategoriaProveedor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await CategoriaProveedor.eliminar(id);
    res.json({ message: "Categoría-Proveedor eliminada correctamente" });
  } catch (error) {
    console.error("Error en eliminarCategoriaProveedor:", error);
    res.status(500).json({ message: "Error al eliminar categoría-proveedor" });
  }
};
