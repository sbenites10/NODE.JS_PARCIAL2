import mysql from "mysql2/promise";
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión exitosa a MySQL (Clever Cloud)");
    connection.release(); // liberar la conexión al pool
  } catch (err) {
    console.error("❌ Error al conectar a MySQL:", err.message);
  }
})();

export default pool;
