import express from "express";
import {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from "../controllers/proveedorController.js";

const router = express.Router();

router.get("/", obtenerProveedores);
router.get("/:id", obtenerProveedorPorId);
router.post("/", crearProveedor);
router.put("/:id", actualizarProveedor);
router.delete("/:id", eliminarProveedor);

export default router;
