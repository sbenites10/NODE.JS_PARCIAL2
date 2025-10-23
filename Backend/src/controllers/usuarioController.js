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

export const registrarTendero = async (req, res) => {
  const { nombre, email, password, contacto, zona_id } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ message: "Nombre, email y contraseña son obligatorios" });
  }

  try {
    // Verificar si el email ya existe
    const [existente] = await connection.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    
    if (existente.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // Insertar nuevo tendero
    const [result] = await connection.query(
      "INSERT INTO usuarios (nombre, email, password, rol, contacto, zona_id) VALUES (?, ?, ?, 'tendero', ?, ?)",
      [nombre, email, password, contacto || null, zona_id || 1]
    );

    res.status(201).json({
      message: "Registro exitoso",
      id: result.insertId,
      nombre,
      email,
      rol: "tendero"
    });
  } catch (err) {
    console.error("Error en registrarTendero:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
