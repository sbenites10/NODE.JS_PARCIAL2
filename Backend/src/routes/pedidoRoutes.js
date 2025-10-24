import express from "express";
import {
  crearOBuscarBorrador,
  agregarActualizarItem,
  enviarPedido,
  eliminarSiPendiente,
  misPedidos,
  listarTodosPedidos,
  detallePedido,
  confirmarRecepcion,
} from "../controllers/pedidoController.js";

const router = express.Router();

/* ======================
   🧍 RUTAS TENDERO
====================== */
router.post("/", crearOBuscarBorrador);          // Crea o devuelve pedido 'pendiente'
router.post("/:id/items", agregarActualizarItem); // Agrega/actualiza ítem del pedido
router.post("/:id/enviar", enviarPedido);        // Confirma envío del pedido
router.put("/:id/confirmar-recepcion", confirmarRecepcion); // Confirma recepción del pedido
router.delete("/:id", eliminarSiPendiente);      // Elimina si está pendiente
router.get("/", misPedidos);                     // Ver pedidos del tendero (por ?tendero_id)

/* ======================
   🧑‍💼 RUTAS ADMIN/PLATAFORMA
====================== */
router.get("/todos", listarTodosPedidos);        // Ver todos los pedidos

/* ======================
   📄 DETALLE PEDIDO
====================== */
router.get("/:id", detallePedido);               // Ver detalle de un pedido específico

export default router;
