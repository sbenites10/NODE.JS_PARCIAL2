import express from "express";
import {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  obtenerPedidosPorProveedor
} from "../controllers/proveedorController.js";

const router = express.Router();

router.get("/", obtenerProveedores);
router.get("/:id", obtenerProveedorPorId);
router.get("/:id/pedidos", obtenerPedidosPorProveedor);
router.post("/", crearProveedor);
router.put("/:id", actualizarProveedor);
router.delete("/:id", eliminarProveedor);


export default router;
