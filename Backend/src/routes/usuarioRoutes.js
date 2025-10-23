import express from "express";
import { loginUsuario, registrarTendero } from "../controllers/usuarioController.js";

const router = express.Router();

router.post("/login", loginUsuario);
router.post("/registro", registrarTendero);

export default router;
