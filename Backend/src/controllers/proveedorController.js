import * as Proveedor from "../models/proveedorModel.js";

// Listar todos
export const listarProveedores = async (req, res) => {
  try {
    const data = await Proveedor.getProveedores();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener proveedores", error });
  }
};

// Obtener uno
export const obtenerProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Proveedor.getProveedorById(id);
    if (!data) return res.status(404).json({ message: "Proveedor no encontrado" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener proveedor", error });
  }
};

// Crear
export const crearProveedor = async (req, res) => {
  try {
    const nuevo = await Proveedor.createProveedor(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ message: "Error al crear proveedor", error });
  }
};

// Actualizar
export const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await Proveedor.updateProveedor(id, req.body);
    if (!actualizado) return res.status(404).json({ message: "Proveedor no encontrado" });
    res.json({ message: "Proveedor actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar proveedor", error });
  }
};

// Eliminar
export const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Proveedor.deleteProveedor(id);
    if (!eliminado) return res.status(404).json({ message: "Proveedor no encontrado" });
    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar proveedor", error });
  }
};
