import express from 'express';
import cors from 'cors';
import connection from './src/config/database.js';
import usuarioRoutes from "./src/routes/usuarioRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/usuarios", usuarioRoutes);

// Ruta de prueba para verificar conexión con MySQL
app.get('/api/usuarios', (req, res) => {
  connection.query('SELECT * FROM usuarios', (err, rows) => {
    if (err) {
      console.error('❌ Error al consultar usuarios:', err);
      res.status(500).send('Error al consultar usuarios');
    } else {
      console.log('✅ Consulta exitosa de usuarios');
      res.json(rows);
    }
  });
});

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
