import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./src/config/database.js";
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import productoRoutes from "./src/routes/productoRoutes.js";
import proveedorRoutes from "./src/routes/proveedorRoutes.js";
import pedidoRoutes from "./src/routes/pedidoRoutes.js";
import consolidacionRoutes from "./src/routes/consolidacionRoutes.js";
import categoriaProveedorRoutes from "./src/routes/categoriaProveedorRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/proveedores", proveedorRoutes); 
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/consolidaciones", consolidacionRoutes);
app.use("/api/categorias-proveedores", categoriaProveedorRoutes);

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

app.get("/api/pedidos", (req, res) => {
  conexion.query("SELECT * FROM pedidos", (error, resultados) => {
    if (error) {
      console.error("Error en la consulta:", error);
      res.status(500).json({ error: "Error en el servidor" });
    } else {
      res.json(resultados); // ✅ MySQL devuelve un array
    }
  });
});


// 🚀 Servidor
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`✅ Servidor corriendo en http://${HOST}:${PORT}`));
