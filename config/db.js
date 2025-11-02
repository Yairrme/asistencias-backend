import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '149.50.150.216',
  user: process.env.DB_USER || 'user_asistencia',
  password: process.env.DB_PASSWORD || 'userits25',
  database: process.env.DB_NAME || 'asistencia', // ✅ corregido
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 33366,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

// Base: sistema_asistencias
// User: user_asistencia
// Pass: userits25
