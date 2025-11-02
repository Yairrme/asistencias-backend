import pool from "../config/db.js";
import bcrypt from "bcryptjs";

/**
 * ✅ Registrar nuevo usuario (alumno o profesor)
 */
export async function register(req, res) {
  try {
    const { username, password, rol, nombre, apellido, email } = req.body;

    if (!username || !password || !rol) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Verificar si ya existe el username
    const [exists] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE username = ?",
      [username]
    );
    if (exists.length > 0) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Crear registro base en usuarios
    const [userResult] = await pool.query(
      "INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)",
      [username, hashed, rol]
    );

    const usuarioId = userResult.insertId;

    // Crear registro asociado según el rol
    if (rol === "alumno") {
      const [alumnoResult] = await pool.query(
        "INSERT INTO alumnos (nombre, apellido, email) VALUES (?, ?, ?)",
        [nombre || username, apellido || "", email || null]
      );
      const alumnoId = alumnoResult.insertId;
      await pool.query(
        "UPDATE usuarios SET id_alumno = ? WHERE id_usuario = ?",
        [alumnoId, usuarioId]
      );
    } else if (rol === "profesor") {
      const [profResult] = await pool.query(
        "INSERT INTO profesores (nombre, apellido, email) VALUES (?, ?, ?)",
        [nombre || username, apellido || "", email || null]
      );
      const profId = profResult.insertId;
      await pool.query(
        "UPDATE usuarios SET id_profesor = ? WHERE id_usuario = ?",
        [profId, usuarioId]
      );
    }

    res.status(201).json({
      message: "Usuario registrado correctamente ✅",
      usuarioId,
    });
  } catch (err) {
    console.error("Error en register:", err.message);
    res.status(500).json({ error: "Error interno en el registro" });
  }
}

/**
 * ✅ Iniciar sesión (por email o username)
 */
export async function login(req, res) {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        error: "Debe enviar username o email, y el password",
      });
    }

    // Buscar usuario por email o username
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.username, u.password, u.rol, u.id_alumno, u.id_profesor
       FROM usuarios u
       LEFT JOIN alumnos a ON u.id_alumno = a.id_alumno
       LEFT JOIN profesores p ON u.id_profesor = p.id_profesor
       WHERE u.username = ? OR a.email = ? OR p.email = ?`,
      [username || null, email || null, email || null]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

    // Datos adicionales según el rol
    let extraData = {};
    if (user.id_alumno) {
      const [a] = await pool.query(
        "SELECT nombre, apellido, email FROM alumnos WHERE id_alumno = ?",
        [user.id_alumno]
      );
      extraData = a[0] || {};
    } else if (user.id_profesor) {
      const [p] = await pool.query(
        "SELECT nombre, apellido, email FROM profesores WHERE id_profesor = ?",
        [user.id_profesor]
      );
      extraData = p[0] || {};
    }

    res.json({
      message: "Login exitoso ✅",
      usuario: {
        id_usuario: user.id_usuario,
        username: user.username,
        rol: user.rol,
        id_alumno: user.id_alumno,
        id_profesor: user.id_profesor,
        ...extraData,
      },
    });
  } catch (err) {
    console.error("Error en login:", err.message);
    res.status(500).json({ error: "Error interno al iniciar sesión" });
  }
}
