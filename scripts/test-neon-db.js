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

async function testNeon() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is missing in .env');
    process.exit(1);
  }

  const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isLocalhost ? false : { rejectUnauthorized: false }
  });

  const results = {};

  try {
    console.log('Testing Neon PostgreSQL Connection...');
    const connRes = await pool.query('SELECT NOW() as now, version() as version');
    if (connRes.rows.length > 0) {
      results['Neon connection'] = 'PASS';
      console.log('✓ Neon connection established');
    }

    // 1. Check tables exist
    const tablesRes = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('Tables found in database:', tables.join(', '));

    const requiredTables = ['products', 'messages', 'admin_settings', 'orders', 'order_items'];
    for (const table of requiredTables) {
      if (tables.includes(table)) {
        results[`Table ${table} exists`] = 'PASS';
      } else {
        results[`Table ${table} exists`] = 'FAIL';
      }
    }

    // 2. Products CRUD
    console.log('\nTesting Products CRUD...');
    // CREATE
    const insertProd = await pool.query(
      `INSERT INTO products (title, category, description, price, images, colors, available)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, price, available`,
      ['Test Crochet Hat', 'hats', 'Automated test product', 120.50, ['/uploads/test.jpg'], 'Red, Blue', true]
    );
    const testProdId = insertProd.rows[0].id;
    results['Products CREATE'] = testProdId ? 'PASS' : 'FAIL';
    console.log(`✓ Products CREATE: created ID ${testProdId}`);

    // READ
    const readProd = await pool.query(`SELECT * FROM products WHERE id = $1`, [testProdId]);
    results['Products READ'] = readProd.rows.length === 1 && readProd.rows[0].title === 'Test Crochet Hat' ? 'PASS' : 'FAIL';
    console.log('✓ Products READ verified');

    // UPDATE
    const updateProd = await pool.query(
      `UPDATE products SET title = $1, price = $2 WHERE id = $3 RETURNING *`,
      ['Updated Test Crochet Hat', 150.00, testProdId]
    );
    results['Products UPDATE'] = updateProd.rows[0].title === 'Updated Test Crochet Hat' && Number(updateProd.rows[0].price) === 150.00 ? 'PASS' : 'FAIL';
    console.log('✓ Products UPDATE verified');

    // DELETE
    const deleteProd = await pool.query(`DELETE FROM products WHERE id = $1`, [testProdId]);
    const readDeletedProd = await pool.query(`SELECT * FROM products WHERE id = $1`, [testProdId]);
    results['Products DELETE'] = readDeletedProd.rows.length === 0 ? 'PASS' : 'FAIL';
    console.log('✓ Products DELETE verified & test data cleaned up');

    // 3. Messages CRUD
    console.log('\nTesting Messages CRUD...');
    // CREATE
    const insertMsg = await pool.query(
      `INSERT INTO messages (name, email, phone, subject, message, read)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, name, email, read`,
      ['Test Customer', 'test@example.com', '1234567890', 'Inquiry', 'Test inquiry message']
    );
    const testMsgId = insertMsg.rows[0].id;
    results['Messages CREATE'] = testMsgId ? 'PASS' : 'FAIL';
    console.log(`✓ Messages CREATE: created ID ${testMsgId}`);

    // READ
    const readMsg = await pool.query(`SELECT * FROM messages WHERE id = $1`, [testMsgId]);
    results['Messages READ'] = readMsg.rows.length === 1 ? 'PASS' : 'FAIL';
    console.log('✓ Messages READ verified');

    // UPDATE
    const updateMsg = await pool.query(
      `UPDATE messages SET read = true WHERE id = $1 RETURNING read`,
      [testMsgId]
    );
    results['Messages UPDATE'] = updateMsg.rows[0].read === true ? 'PASS' : 'FAIL';
    console.log('✓ Messages UPDATE read state verified');

    // DELETE (cleanup)
    await pool.query(`DELETE FROM messages WHERE id = $1`, [testMsgId]);
    const readDeletedMsg = await pool.query(`SELECT * FROM messages WHERE id = $1`, [testMsgId]);
    results['Messages DELETE'] = readDeletedMsg.rows.length === 0 ? 'PASS' : 'FAIL';
    console.log('✓ Messages DELETE verified & test data cleaned up');

    // 4. Admin Settings CRUD
    console.log('\nTesting Admin Settings CRUD...');
    const adminCheck = await pool.query(`SELECT id, admin_password_hash FROM admin_settings LIMIT 1`);
    results['Admin Settings READ'] = adminCheck.rows.length > 0 ? 'PASS' : 'FAIL';
    console.log('✓ Admin Settings READ verified');

    if (adminCheck.rows.length > 0) {
      const origHash = adminCheck.rows[0].admin_password_hash;
      const adminId = adminCheck.rows[0].id;
      // UPDATE to temp
      await pool.query(`UPDATE admin_settings SET admin_password_hash = $1 WHERE id = $2`, ['temp_test_hash', adminId]);
      const updatedAdmin = await pool.query(`SELECT admin_password_hash FROM admin_settings WHERE id = $1`, [adminId]);
      const updateOk = updatedAdmin.rows[0].admin_password_hash === 'temp_test_hash';
      // Revert back
      await pool.query(`UPDATE admin_settings SET admin_password_hash = $1 WHERE id = $2`, [origHash, adminId]);
      results['Admin Settings UPDATE'] = updateOk ? 'PASS' : 'FAIL';
      console.log('✓ Admin Settings UPDATE verified & original password restored');
    }

    console.log('\n=======================================');
    console.log('           TEST RESULTS SUMMARY         ');
    console.log('=======================================');
    for (const [test, status] of Object.entries(results)) {
      console.log(`${test.padEnd(30)}: ${status}`);
    }
    console.log('=======================================\n');

    const hasFailure = Object.values(results).some(s => s === 'FAIL');
    if (hasFailure) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testNeon();
