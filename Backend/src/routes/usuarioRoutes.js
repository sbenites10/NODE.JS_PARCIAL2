import express from "express";
import { loginUsuario } from "../controllers/usuarioController.js";

const router = express.Router();

router.post("/login", loginUsuario);
router.post("/", registrarUsuario);

export default router;
