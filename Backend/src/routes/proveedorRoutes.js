import express from "express";
import {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from "../controllers/proveedorController.js";

const router = express.Router();

router.get("/", listarProveedores);
router.get("/:id", obtenerProveedor);
router.post("/", crearProveedor);
router.put("/:id", actualizarProveedor);
router.delete("/:id", eliminarProveedor);

export default router;
