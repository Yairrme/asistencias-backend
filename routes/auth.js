const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * REGISTRO DE NUEVO USUARIO
 * (Sin tokens, con apellido y vinculación a 'alumnos'/'profesores')
 */
router.post('/register', (req, res) => {
    // 1. Obtenemos todos los campos, incluido el apellido
    const { nombre, apellido, email, password, tipo } = req.body;

    if (!nombre || !apellido || !email || !password || !tipo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // 2. Insertamos el nuevo usuario en la tabla `usuarios`
    const sqlInsertUsuario = 'INSERT INTO usuarios (nombre, apellido, email, password, tipo) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sqlInsertUsuario, [nombre, apellido, email, password, tipo], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'El email ya está registrado' });
            }
            console.error('Error al registrar en usuarios:', err);
            return res.status(500).json({ error: 'Error interno al registrar el usuario.' });
        }

        // 3. Obtenemos el ID del usuario recién creado
        const nuevoUsuarioId = result.insertId;

        // 4. Insertamos en 'alumnos' o 'profesores' para vincularlos
        let sqlInsertRol;
        if (tipo === 'alumno') {
            sqlInsertRol = 'INSERT INTO alumnos (nombre, apellido, usuario_id) VALUES (?, ?, ?)';
        } else if (tipo === 'profesor') {
            sqlInsertRol = 'INSERT INTO profesores (nombre, apellido, usuario_id) VALUES (?, ?, ?)';
        } else {
            return res.status(201).json({ 
                mensaje: 'Usuario registrado con éxito (sin rol específico)', 
                id: nuevoUsuarioId 
            });
        }
        
        db.query(sqlInsertRol, [nombre, apellido, nuevoUsuarioId], (errRol, resultRol) => {
            if (errRol) {
                console.error(`Error al registrar en ${tipo}:`, errRol);
                return res.status(500).json({ error: `Error interno al vincular el rol de ${tipo}.` });
            }
            
            res.status(201).json({ 
                mensaje: `Usuario registrado y vinculado como ${tipo} con éxito`, 
                id: nuevoUsuarioId 
            });
        });
    });
});


/**
 * LOGIN DE USUARIO (SIN TOKENS)
 */
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error del servidor' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }
        const usuario = results[0];
        if (password !== usuario.password) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }
        // Devolvemos los datos del usuario directamente
        res.json({
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            tipo: usuario.tipo
        });
    });
});
