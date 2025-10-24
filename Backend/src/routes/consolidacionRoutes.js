import express from "express";
import {
  consolidarPorCategoria,
  listarConsolidaciones,
  obtenerDetalleConsolidacion,
  misConsolidaciones,
  actualizarEstadoConsolidacion,
  confirmarRecepcion,
  obtenerEstadoDetallado
} from "../controllers/consolidacionController.js";

const router = express.Router();

// ADMIN routes
router.post("/consolidar", consolidarPorCategoria);
router.get("/", listarConsolidaciones);
router.get("/:id", obtenerDetalleConsolidacion);

// PROVIDER routes
router.get("/proveedor/mis-consolidaciones", misConsolidaciones);
router.put("/:id/estado", actualizarEstadoConsolidacion);

// TENDERO routes
router.put("/pedido/:id/confirmar-recepcion", confirmarRecepcion);
router.get("/pedido/:id/estado-detallado", obtenerEstadoDetallado);

export default router;
