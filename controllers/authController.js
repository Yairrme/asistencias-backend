import pool from "../config/db.js";
import bcrypt from "bcryptjs";

/**
 * ✅ Registrar nuevo usuario (alumno o profesor)
 */
export async function register(req, res, next) {
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
    const [result] = await pool.query(
      "INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)",
      [username, hashed, rol]
    );

    const usuarioId = result.insertId;

    // Si el rol es profesor o alumno, crear registro correspondiente
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
      message: "Usuario registrado correctamente",
      usuarioId,
    });
  } catch (err) {
    console.error("Error en register:", err);
    next(err);
  }
}

/**
 * ✅ Iniciar sesión
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan email o password" });
    }

    // Buscar usuario por email en alumnos y profesores
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.username, u.password, u.rol, u.id_alumno, u.id_profesor
       FROM usuarios u
       LEFT JOIN alumnos a ON u.id_alumno = a.id_alumno
       LEFT JOIN profesores p ON u.id_profesor = p.id_profesor
       WHERE a.email = ? OR p.email = ?`,
      [email, email]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

    // Recuperar datos adicionales si es alumno o profesor
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
        id: user.id_usuario,
        rol: user.rol,
        ...extraData,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    next(err);
  }
}
