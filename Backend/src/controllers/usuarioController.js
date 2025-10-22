import connection from "../config/database.js";

export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [results] = await connection.query("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const usuario = results[0];

    if (usuario.password !== password) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    res.status(200).json({
      message: "Login exitoso",
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      zona_id: usuario.zona_id,
    });
  } catch (err) {
    console.error("Error en loginUsuario:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
