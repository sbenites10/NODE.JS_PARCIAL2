import express from "express";
import {
  listarCategoriasProveedores,
  obtenerProveedorPorCategoria,
  crearCategoriaProveedor,
  actualizarCategoriaProveedor,
  eliminarCategoriaProveedor
} from "../controllers/categoriaProveedorController.js";

const router = express.Router();

router.get("/", listarCategoriasProveedores);
router.get("/:categoria", obtenerProveedorPorCategoria);
router.post("/", crearCategoriaProveedor);
router.put("/:id", actualizarCategoriaProveedor);
router.delete("/:id", eliminarCategoriaProveedor);

export default router;
