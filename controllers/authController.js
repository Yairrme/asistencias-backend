import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export async function register(req, res, next) {
  try {
    const { nombre, apellido, email, password, tipo } = req.body;
    if (!nombre || !apellido || !email || !password || !tipo) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // verificar si email ya existe
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está en uso' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, tipo) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, hashed, tipo]
    );

    const usuarioId = result.insertId;

    // opcional: crear registro en tabla alumnos si tipo = 'alumno'
    if (tipo === 'alumno') {
      await pool.query('INSERT INTO alumnos (nombre, apellido, usuario_id) VALUES (?, ?, ?)', [nombre, apellido, usuarioId]);
    }

    res.status(201).json({ message: 'Usuario registrado', usuarioId });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan email o password' });

    const [rows] = await pool.query('SELECT id, nombre, apellido, password, tipo FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    // No usamos JWT: devolvemos info básica (sin password)
    res.json({
      message: 'Login exitoso',
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        tipo: user.tipo
      }
    });
  } catch (err) {
    next(err);
  }
}
