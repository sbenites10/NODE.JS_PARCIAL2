import connection from "../config/database.js";
import bcrypt from "bcrypt"; // para comparar contraseñas si están cifradas (opcional)

export const loginUsuario = (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM usuarios WHERE email = ?";
  connection.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Error en el servidor" });
    if (results.length === 0)
      return res.status(401).json({ message: "Usuario no encontrado" });

    const usuario = results[0];

    // Si las contraseñas están cifradas con bcrypt, usa:
    // const isMatch = await bcrypt.compare(password, usuario.password);
    // pero si están en texto plano (por ahora):
    if (usuario.password !== password)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    // Autenticación exitosa
    res.status(200).json({
      message: "Login exitoso",
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      zona_id: usuario.zona_id,
    });
  });
};
