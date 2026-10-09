import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically load .env if DATABASE_URL is not already exported
if (!process.env.DATABASE_URL) {
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
}

async function executeWithRetry(pool, fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`Transient error (${err.message}). Retrying attempt ${attempt + 1}/${maxRetries}...`);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
}

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is missing in .env');
    process.exit(1);
  }

  const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log('Connecting to Neon PostgreSQL...');
    await pool.query('SELECT NOW()');
    console.log('Connected successfully!');

    // 1. Run schema if tables don't exist
    const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'neon-schema.sql'), 'utf8');
    console.log('Applying Neon schema...');
    await pool.query(schemaSql);
    console.log('Schema verified.');

    // 2. Load backup
    const backupPath = path.join(__dirname, '..', 'supabase_backup.json');
    if (!fs.existsSync(backupPath)) {
      console.log('No supabase_backup.json found. Skipping data import.');
      await pool.end();
      return;
    }

    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log(`Loaded backup with ${backup.products?.length || 0} products, ${backup.messages?.length || 0} messages, ${backup.orders?.length || 0} orders.`);

    // 3. Migrate Products in chunks of 20
    if (backup.products && backup.products.length > 0) {
      console.log(`Migrating ${backup.products.length} products in batches...`);
      const chunkSize = 20;
      for (let i = 0; i < backup.products.length; i += chunkSize) {
        const chunk = backup.products.slice(i, i + chunkSize);
        await executeWithRetry(pool, async () => {
          for (const p of chunk) {
            const images = Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? [p.images] : []);
            const colors = typeof p.colors === 'string' ? p.colors : '';
            const color = p.color || colors || '';
            
            await pool.query(
              `INSERT INTO products (id, title, category, description, price, images, color, colors, available, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
               ON CONFLICT (id) DO UPDATE SET
                 title = EXCLUDED.title,
                 category = EXCLUDED.category,
                 description = EXCLUDED.description,
                 price = EXCLUDED.price,
                 images = EXCLUDED.images,
                 color = EXCLUDED.color,
                 colors = EXCLUDED.colors,
                 available = EXCLUDED.available,
                 updated_at = EXCLUDED.updated_at`,
              [
                p.id,
                p.title || '',
                p.category || '',
                p.description || '',
                Number(p.price || 0),
                images,
                color,
                colors,
                p.available !== undefined ? Boolean(p.available) : true,
                p.created_at || new Date().toISOString(),
                p.updated_at || new Date().toISOString()
              ]
            );
          }
        });
        console.log(`Processed ${Math.min(i + chunkSize, backup.products.length)}/${backup.products.length} products...`);
      }
      console.log(`Finished migrating all products.`);
    }

    // 4. Migrate Admin Settings
    if (backup.admin && backup.admin.length > 0) {
      console.log(`Migrating ${backup.admin.length} admin settings...`);
      for (const a of backup.admin) {
        await executeWithRetry(pool, async () => {
          await pool.query(
            `INSERT INTO admin_settings (id, admin_password_hash, updated_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (id) DO UPDATE SET
               admin_password_hash = EXCLUDED.admin_password_hash,
               updated_at = EXCLUDED.updated_at`,
            [a.id, a.admin_password_hash, a.updated_at || new Date().toISOString()]
          );
        });
      }
      console.log('Admin settings migrated.');
    } else {
      const existing = await pool.query('SELECT id FROM admin_settings LIMIT 1');
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO admin_settings (admin_password_hash) VALUES ('wengel6567')`
        );
        console.log('Default admin setting inserted.');
      }
    }

    // 5. Migrate Orders and Items
    if (backup.orders && backup.orders.length > 0) {
      console.log(`Migrating ${backup.orders.length} orders...`);
      for (const o of backup.orders) {
        await executeWithRetry(pool, async () => {
          await pool.query(
            `INSERT INTO orders (id, order_ref, customer_name, customer_email, customer_phone, shipping_address, total_amount, status, delivery_preference, payment_method, special_notes, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             ON CONFLICT (id) DO NOTHING`,
            [
              o.id,
              o.order_ref,
              o.customer_name,
              o.customer_email,
              o.customer_phone,
              o.shipping_address,
              Number(o.total_amount),
              o.status || 'Pending',
              o.delivery_preference || '',
              o.payment_method || '',
              o.special_notes || '',
              o.created_at || new Date().toISOString(),
              o.updated_at || new Date().toISOString()
            ]
          );
        });
      }
      console.log('Orders migrated.');
    }

    if (backup.orderItems && backup.orderItems.length > 0) {
      console.log(`Migrating ${backup.orderItems.length} order items...`);
      for (const oi of backup.orderItems) {
        await executeWithRetry(pool, async () => {
          await pool.query(
            `INSERT INTO order_items (id, order_id, product_id, product_title, product_image, color, quantity, price, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [
              oi.id,
              oi.order_id,
              oi.product_id || null,
              oi.product_title,
              oi.product_image,
              oi.color || '',
              Number(oi.quantity),
              Number(oi.price),
              oi.created_at || new Date().toISOString()
            ]
          );
        });
      }
      console.log('Order items migrated.');
    }

    // 6. Migrate Messages
    if (backup.messages && backup.messages.length > 0) {
      console.log(`Migrating ${backup.messages.length} messages...`);
      for (const m of backup.messages) {
        await executeWithRetry(pool, async () => {
          await pool.query(
            `INSERT INTO messages (id, name, email, phone, subject, message, read, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING`,
            [
              m.id,
              m.name,
              m.email,
              m.phone || '',
              m.subject,
              m.message,
              Boolean(m.read),
              m.created_at || new Date().toISOString()
            ]
          );
        });
      }
      console.log('Messages migrated.');
    }

    // 7. Verify counts
    const pCount = await pool.query('SELECT COUNT(*) FROM products');
    const oCount = await pool.query('SELECT COUNT(*) FROM orders');
    const oiCount = await pool.query('SELECT COUNT(*) FROM order_items');
    const aCount = await pool.query('SELECT COUNT(*) FROM admin_settings');
    const mCount = await pool.query('SELECT COUNT(*) FROM messages');

    console.log('\n--- MIGRATION VERIFICATION ---');
    console.log(`Products in Neon: ${pCount.rows[0].count}`);
    console.log(`Orders in Neon: ${oCount.rows[0].count}`);
    console.log(`Order Items in Neon: ${oiCount.rows[0].count}`);
    console.log(`Admin Settings in Neon: ${aCount.rows[0].count}`);
    console.log(`Messages in Neon: ${mCount.rows[0].count}`);
    console.log('-------------------------------\n');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
