import {
  getProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor
} from "../models/proveedorModel.js";

// Obtener todos los proveedores
export const obtenerProveedores = async (req, res) => {
  try {
    const proveedores = await getProveedores();
    res.json(proveedores);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Obtener proveedor por ID
export const obtenerProveedorPorId = async (req, res) => {
  try {
    const proveedor = await getProveedorById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    res.json(proveedor);
  } catch (error) {
    console.error("Error al obtener proveedor:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Crear proveedor
export const crearProveedor = async (req, res) => {
  try {
    const nuevoProveedor = await createProveedor(req.body);
    res.status(201).json(nuevoProveedor);
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Actualizar proveedor
export const actualizarProveedor = async (req, res) => {
  try {
    const actualizado = await updateProveedor(req.params.id, req.body);
    if (!actualizado) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    res.json({ message: "Proveedor actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Eliminar proveedor
export const eliminarProveedor = async (req, res) => {
  try {
    const eliminado = await deleteProveedor(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
