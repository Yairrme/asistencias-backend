const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();

/**
 * LOGIN DE USUARIO (ALUMNO / PROFESOR)
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Faltan campos" });

  const sql = "SELECT * FROM usuarios WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Error en el servidor" });
    if (results.length === 0)
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).json({ success: false, message: "Contraseña incorrecta" });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, tipo: user.tipo, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      message: "Login exitoso",
      token,
      tipo: user.tipo
    });
  });
});

/**
 * REGISTRO DE NUEVO USUARIO
 */
router.post("/register", async (req, res) => {
  const { nombre, email, password, tipo } = req.body;

  if (!nombre || !email || !password || !tipo)
    return res.status(400).json({ success: false, message: "Faltan campos" });

  const hashed = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO usuarios (nombre, email, password, tipo) VALUES (?, ?, ?, ?)";

  db.query(sql, [nombre, email, hashed, tipo], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Error al registrar usuario" });
    }

    const nuevoUsuarioId = result.insertId;

    // Vincular el usuario automáticamente según su tipo
    if (tipo === "alumno") {
      db.query("INSERT INTO alumnos (nombre, usuario_id) VALUES (?, ?)", [nombre, nuevoUsuarioId]);
    } else if (tipo === "profesor") {
      db.query("INSERT INTO docentes (nombre, usuario_id) VALUES (?, ?)", [nombre, nuevoUsuarioId]);
    }


    res.json({ success: true, message: "Usuario registrado correctamente y vinculado correctamente" });
  });
});

/**
 * Middleware de verificación de token
 */
function verificarToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(403).json({ message: "Token requerido" });

  const token = header.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token inválido" });
    req.user = decoded;
    next();
  });
}

module.exports = { router, verificarToken };
