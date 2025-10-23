import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./src/config/database.js";
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import productoRoutes from "./src/routes/productoRoutes.js"; // ✅ nombre correcto

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Rutas correctas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);

// 🔍 Ruta de prueba
app.get("/api/usuarios", async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al consultar usuarios:", err);
    res.status(500).send("Error al consultar usuarios");
  }
});

// 🚀 Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
