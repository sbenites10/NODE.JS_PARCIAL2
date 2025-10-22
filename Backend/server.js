import express from 'express';
import cors from 'cors';
import connection from './src/config/database.js';
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import proveedorRoutes from "./src/routes/proveedorRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proveedores", proveedorRoutes);

// 🔍 Ruta de prueba para verificar conexión MySQL
app.get("/api/usuarios", async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM usuarios");
    console.log("✅ Consulta exitosa de usuarios");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al consultar usuarios:", err);
    res.status(500).send("Error al consultar usuarios");
  }
});


// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
