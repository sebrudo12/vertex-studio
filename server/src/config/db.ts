import mysql from 'mysql2/promise';
import { env } from './env';

const useSsl =
  process.env.DB_SSL === 'true' ||
  (env.DB_HOST && env.DB_HOST.includes('tidbcloud.com')) ||
  env.DB_PORT === 4000 ||
  Boolean(process.env.MYSQL_URL || process.env.DATABASE_URL);

export const pool = (process.env.MYSQL_URL || process.env.DATABASE_URL)
  ? mysql.createPool({
      uri: process.env.MYSQL_URL || process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      charset: 'utf8mb4',
      dateStrings: true,
      multipleStatements: true,
      ssl: { rejectUnauthorized: false },
    })
  : mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      charset: 'utf8mb4',
      dateStrings: true,
      multipleStatements: true,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
