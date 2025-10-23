import express from "express";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../controllers/productoController.js";

const router = express.Router();

/* ============================
   📦 RUTAS DE PRODUCTOS (CRUD)
   ============================ */

// 🟢 Obtener todos los productos
router.get("/", getProductos);

// 🟡 Crear un nuevo producto
router.post("/", createProducto);

// 🔵 Actualizar producto existente
router.put("/:id", updateProducto);

// 🔴 Eliminar un producto
router.delete("/:id", deleteProducto);

export default router;
