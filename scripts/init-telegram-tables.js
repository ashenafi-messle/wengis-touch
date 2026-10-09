import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

async function initTables() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Ensuring telegram_notification_status and telegram_images_status columns exist in orders...');
    await pool.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS telegram_notification_status VARCHAR(20) DEFAULT 'PENDING';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS telegram_images_status VARCHAR(20) DEFAULT 'NONE';
    `);

    console.log('Ensuring telegram_order_tokens table exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS telegram_order_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_telegram_order_tokens_hash ON telegram_order_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_telegram_order_tokens_order_id ON telegram_order_tokens(order_id);
    `);

    console.log('✓ telegram_order_tokens table and orders schema initialized successfully in Neon PostgreSQL!');
  } catch (err) {
    console.error('Error initializing tables:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initTables();
