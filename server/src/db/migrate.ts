import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

async function runMigration() {
  console.log('--- Starting Vertex Studio DB Migration ---');
  
  // 1. Connect without database to ensure DB exists
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true,
  });

  console.log(`Connected to MySQL at ${env.DB_HOST}:${env.DB_PORT}`);

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await connection.query(schemaSql);
  console.log('Database and all 15 tables verified/created successfully!');

  await connection.end();
  console.log('--- Migration Finished Successfully ---');
}

if (require.main === module) {
  runMigration().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

export { runMigration };
