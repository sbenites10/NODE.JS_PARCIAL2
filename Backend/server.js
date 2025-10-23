import express from 'express';
import cors from 'cors';
import connection from './src/config/database.js';
import dotenv from "dotenv";

import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import productoRoutes from "./src/routes/productoRoutes.js";
import proveedorRoutes from "./src/routes/proveedorRoutes.js";
import productoRoutes from "./src/routes/productoRoutes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Usar rutas con los prefijos correctos
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/proveedores", proveedorRoutes);

// ✅ Ruta de prueba para verificar conexión MySQL
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM usuarios");
    console.log("✅ Conexión a la base de datos exitosa");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al consultar la base de datos:", err);
    res.status(500).send("Error al conectar con la base de datos");
  }
});

// ✅ Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
