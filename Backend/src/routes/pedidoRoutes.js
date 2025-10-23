import express from "express";
import {
  crearOBuscarBorrador,
  agregarActualizarItem,
  enviarPedido,
  eliminarSiPendiente,
  misPedidos,
  detallePedido
} from "../controllers/pedidoController.js";

const router = express.Router();

// Tendero
router.post("/", crearOBuscarBorrador);                 // crea o devuelve pedido 'pendiente'
router.post("/:id/items", agregarActualizarItem);       // agrega/actualiza línea
router.post("/:id/enviar", enviarPedido);               // pasa a 'consolidacion'
router.delete("/:id", eliminarSiPendiente);             // elimina si 'pendiente'
router.get("/", misPedidos);                            // historial del tendero
router.get("/:id", detallePedido);                      // detalle + items

export default router;
