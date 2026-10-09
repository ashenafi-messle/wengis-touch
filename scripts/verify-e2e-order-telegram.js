import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import pg from 'pg';
import {
  generateTelegramOrderToken,
  processTelegramStartToken,
  handleTelegramStartWithoutToken,
  formatTelegramOrderMessage,
  getTelegramConfig,
  sendTelegramMessage,
} from '../lib/telegram.ts';

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

async function runEndToEndVerification() {
  console.log('========================================================');
  console.log('  WENGI\'S TOUCH — E2E TELEGRAM ORDER DISPATCH AUDIT');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
  }

  const config = getTelegramConfig();
  console.log('Configuration Audit:');
  console.log(`• TELEGRAM_BOT_USERNAME    : @${config.botUsername}`);
  console.log(`• TELEGRAM_ADMIN_CHAT_ID   : ${config.adminChatId} (expected 7619865911)`);
  console.log(`• TELEGRAM_ADMIN_USERNAME  : @${config.adminUsername}`);
  console.log(`• TOKEN EXPIRY MINUTES     : ${config.expiryMinutes}m\n`);

  assert(config.adminChatId === '7619865911', 'Admin chat ID is configured to numeric 7619865911');
  assert(Boolean(config.botToken), 'Bot token is present in server environment');

  // Verify Telegram Bot API connectivity
  console.log('\n--- VERIFYING TELEGRAM BOT API CREDENTIALS ---');
  const meRes = await fetch(`https://api.telegram.org/bot${config.botToken}/getMe`);
  const meData = await meRes.json();
  assert(meData.ok === true, `Bot authenticated successfully: @${meData.result?.username}`);

  const chatRes = await fetch(`https://api.telegram.org/bot${config.botToken}/getChat?chat_id=${config.adminChatId}`);
  const chatData = await chatRes.json();
  assert(chatData.ok === true && chatData.result?.id === 7619865911, `Admin chat 7619865911 verified: @${chatData.result?.username}`);

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  const createdOrderIds = [];
  const createdTokenIds = [];

  try {
    // 1. Create a real test order in Neon PostgreSQL
    console.log('\n--- CREATING TEST ORDER IN NEON POSTGRESQL ---');
    const orderInsert = await pool.query(
      `INSERT INTO orders (order_ref, customer_name, customer_email, customer_phone, shipping_address,
                           total_amount, status, delivery_preference, payment_method, special_notes, telegram_notification_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, order_ref`,
      [
        'WT-E2E-LIVE-001',
        'Abebe Bikila (E2E Test)',
        'abebe.test@wengistouch.com',
        '+251911223344',
        'Gondar, Piazza, House #42',
        1850,
        'Pending',
        'Express 2-Day',
        'Cash on Delivery',
        'Automated End-to-End Verification Test Order',
        'PENDING',
      ]
    );
    const orderId = orderInsert.rows[0].id;
    const orderRef = orderInsert.rows[0].order_ref;
    createdOrderIds.push(orderId);
    assert(Boolean(orderId), `Order created in Neon PostgreSQL (ID: ${orderId}, Ref: ${orderRef})`);

    // Insert order items
    await pool.query(
      `INSERT INTO order_items (order_id, product_title, quantity, price, color, product_image)
       VALUES ($1, 'Royal Crochet Beanie', 1, 650, 'Burgundy', 'https://res.cloudinary.com/oydsg6yc/image/upload/v1791528555/ee6fe89a61780d65c8c1f2aa501c3470.jpg'),
              ($1, 'Atelier Handcrafted Shrug', 1, 1200, 'Warm Sand', 'https://res.cloudinary.com/oydsg6yc/image/upload/v1791528542/5ed8cbca7e257097c4672381d8b0a7a2.jpg')`,
      [orderId]
    );
    assert(true, 'Order items inserted successfully into order_items table');

    // 2. Generate secure token
    console.log('\n--- GENERATING SECURE TELEGRAM TOKEN ---');
    const tokenResult = await generateTelegramOrderToken(orderId);
    assert(tokenResult.rawToken.length === 32, 'Generated 32-character hexadecimal token (safe within Telegram 64-char limit)');
    assert(tokenResult.deepLink.includes(tokenResult.rawToken), 'Telegram deep link includes exact raw token');
    assert(tokenResult.appDeepLink.startsWith('tg://resolve'), 'App deep link uses direct tg://resolve protocol');

    // Verify token record in database
    const tokenHash = crypto.createHash('sha256').update(tokenResult.rawToken).digest('hex');
    const tokenDb = await pool.query(`SELECT id, used_at, expires_at FROM telegram_order_tokens WHERE token_hash = $1`, [tokenHash]);
    assert(tokenDb.rows.length === 1, 'Token hash verified in telegram_order_tokens table');
    assert(tokenDb.rows[0].used_at === null, 'Token used_at is initially NULL');
    createdTokenIds.push(tokenDb.rows[0].id);

    // 3. Process /start TOKEN (Simulating customer tapping START in Telegram)
    console.log('\n--- DISPATCHING COMPLETE ORDER TO ADMINISTRATOR (@wengi67 / 7619865911) ---');
    // We send confirmation to admin chat ID 7619865911 and use 7619865911 as customer chat for verification
    const dispatchResult = await processTelegramStartToken(tokenResult.rawToken, config.adminChatId);
    assert(dispatchResult.success === true, `Dispatch succeeded: ${dispatchResult.message}`);

    // Verify database state updated
    const updatedToken = await pool.query(`SELECT used_at FROM telegram_order_tokens WHERE id = $1`, [tokenDb.rows[0].id]);
    assert(updatedToken.rows[0].used_at !== null, 'Token marked as used (used_at has timestamp)');

    const updatedOrder = await pool.query(`SELECT telegram_notification_status FROM orders WHERE id = $1`, [orderId]);
    assert(updatedOrder.rows[0].telegram_notification_status === 'SENT', 'Order status updated to telegram_notification_status = SENT');

    // 4. Test Token Replay Protection
    console.log('\n--- TESTING REPLAY / IDEMPOTENCY PROTECTION ---');
    const replayResult = await processTelegramStartToken(tokenResult.rawToken, config.adminChatId);
    assert(replayResult.success === false, 'Replaying the same token was safely rejected');
    assert(replayResult.message.includes('used'), 'Correct "Token already used" message returned');

    // 5. Test Missing Token Handling (/start without token)
    console.log('\n--- TESTING /start WITHOUT TOKEN (TELEGRAM WEB COMPATIBILITY) ---');
    const noTokenResult = await handleTelegramStartWithoutToken(config.adminChatId);
    assert(noTokenResult.success === true, 'Handled /start without token safely with guidance message');

    console.log('\n========================================================');
    console.log(`  ALL E2E VERIFICATION TESTS PASSED! (${passed}/${total})`);
    console.log('========================================================\n');
  } finally {
    console.log('Cleaning up test records from database...');
    if (createdTokenIds.length > 0) {
      await pool.query(`DELETE FROM telegram_order_tokens WHERE id = ANY($1::uuid[])`, [createdTokenIds]);
    }
    if (createdOrderIds.length > 0) {
      await pool.query(`DELETE FROM order_items WHERE order_id = ANY($1::uuid[])`, [createdOrderIds]);
      await pool.query(`DELETE FROM orders WHERE id = ANY($1::uuid[])`, [createdOrderIds]);
    }
    await pool.end();
    console.log('✓ Test data cleaned up.');
  }
}

runEndToEndVerification().catch((err) => {
  console.error('\nE2E VERIFICATION FAILED:', err);
  process.exit(1);
});
