const mysql = require('mysql2');
require('dotenv').config();

// Leer configuración desde variables de entorno con valores por defecto
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'asistencias_db';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

// Usar pool para manejar reconexiones y múltiples solicitudes simultáneas
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Opcional: establecer timezone si tu app requiere consistencia
  timezone: 'Z'
});

// Probar una conexión al iniciar (no obliga a que la app falle si hay error)
pool.getConnection((err, connection) => {
  if (err) {
    console.error('\u26A0\uFE0F Error al conectar con la base de datos MySQL:');
    console.error(err.message || err);
    // No hacemos process.exit para permitir que la app maneje reconexiones o que el usuario corrija las credenciales
    return;
  }
  console.log('\u2705 Conectado a MySQL (pool)');
  connection.release();
});

// Exportar el pool; mantiene compatibilidad con llamadas tipo db.query(sql, params, cb)
module.exports = pool;
