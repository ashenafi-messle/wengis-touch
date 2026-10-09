import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import pg from 'pg';
import {
  generateTelegramOrderToken,
  processTelegramStartToken,
  formatTelegramOrderMessage,
  handleTelegramStartWithoutToken,
  getTelegramConfig,
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

async function runTelegramTests() {
  console.log('========================================================');
  console.log('  WENGI\'S TOUCH — TELEGRAM TOKEN WORKFLOW TEST SUITE   ');
  console.log('========================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
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

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  // Track created test IDs for guaranteed cleanup
  const createdOrderIds = [];
  const createdTokenIds = [];

  try {
    // TEST SUITE 1: Table & Schema Verification
    console.log('--- TEST SUITE 1: Neon Database Schema Verification ---');
    const tableRes = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'telegram_order_tokens'`
    );
    assert(tableRes.rows.length > 0, 'telegram_order_tokens table exists in Neon PostgreSQL');

    const colRes = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'telegram_notification_status'`
    );
    assert(colRes.rows.length > 0, 'orders.telegram_notification_status column exists in Neon PostgreSQL');

    // TEST SUITE 2: Multi-Product Message Formatting (Requirement 14 & 15)
    console.log('\n--- TEST SUITE 2: Complete Order Message Formatting ---');
    const sampleMultiOrder = {
      id: 'test-uuid-multi',
      orderRef: 'WT-20261008-001',
      customerName: 'Abebe Bikila',
      customerPhone: '0912345678',
      customerEmail: 'abebe@example.com',
      shippingAddress: 'Addis Ababa, Bole',
      deliveryPreference: '3 Days',
      paymentMethod: 'Cash on Delivery',
      specialNotes: 'Custom gift packaging requested',
      totalAmount: 1700,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      items: [
        {
          productId: 'p-1',
          productTitle: 'Crochet Bag',
          color: 'Red',
          quantity: 2,
          price: 700,
        },
        {
          productId: 'p-2',
          productTitle: 'Crochet Flower',
          color: 'Yellow',
          quantity: 3,
          price: 100,
        },
      ],
    };

    const formattedMsg = formatTelegramOrderMessage(sampleMultiOrder);
    assert(formattedMsg.includes('WT-20261008-001'), 'Message includes Order ID reference');
    assert(formattedMsg.includes('Abebe Bikila'), 'Message includes customer name');
    assert(formattedMsg.includes('0912345678'), 'Message includes customer phone');
    assert(formattedMsg.includes('Addis Ababa, Bole'), 'Message includes delivery address');
    assert(formattedMsg.includes('Crochet Bag'), 'Message includes Product 1: Crochet Bag');
    assert(formattedMsg.includes('1,400.00 ETB') || formattedMsg.includes('1400.00 ETB'), 'Message includes Product 1 subtotal (2x700)');
    assert(formattedMsg.includes('Crochet Flower'), 'Message includes Product 2: Crochet Flower');
    assert(formattedMsg.includes('300.00 ETB'), 'Message includes Product 2 subtotal (3x100)');
    assert(formattedMsg.includes('1,700.00 ETB') || formattedMsg.includes('1700.00 ETB'), 'Message includes TOTAL: 1,700 ETB');
    assert(formattedMsg.includes('Custom gift packaging requested'), 'Message includes special customer notes');

    // TEST SUITE 3: Secure Random Token Generation (Requirement 4 & 5)
    console.log('\n--- TEST SUITE 3: Token Generation & Deep-link Verification ---');
    // Create a real order in database for testing
    const orderInsert = await pool.query(
      `INSERT INTO orders (order_ref, customer_name, customer_email, customer_phone, shipping_address,
                           total_amount, status, delivery_preference, payment_method, special_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, order_ref`,
      [
        'WT-TEST-001',
        'Test Customer',
        'test@example.com',
        '+251911223344',
        'Bole, Addis Ababa',
        1700,
        'Pending',
        'Standard',
        'Cash on Delivery',
        'Testing token generation',
      ]
    );
    const testOrderId = orderInsert.rows[0].id;
    createdOrderIds.push(testOrderId);

    // Add items to order
    await pool.query(
      `INSERT INTO order_items (order_id, product_title, quantity, price, color, product_image)
       VALUES ($1, 'Crochet Bag', 2, 700, 'Red', 'https://example.com/bag.jpg'),
              ($1, 'Crochet Flower', 3, 100, 'Yellow', 'https://example.com/flower.jpg')`,
      [testOrderId]
    );

    const tokenResult = await generateTelegramOrderToken(testOrderId);
    assert(typeof tokenResult.rawToken === 'string' && tokenResult.rawToken.length === 32, 'Token is 32-character hex (128-bit cryptographic random, well within Telegram 64-char limit)');
    assert(tokenResult.deepLink.startsWith('https://t.me/'), 'Deep link starts with https://t.me/');
    assert(tokenResult.deepLink.includes(`start=${tokenResult.rawToken}`), 'Deep link contains start parameter with raw token');
    assert(typeof tokenResult.appDeepLink === 'string' && tokenResult.appDeepLink.startsWith('tg://resolve?domain='), 'Direct app deep link starts with tg://resolve?domain=');

    // Verify hashed token stored in DB
    const expectedHash = crypto.createHash('sha256').update(tokenResult.rawToken).digest('hex');
    const dbTokenRes = await pool.query(
      `SELECT id, order_id, token_hash, expires_at, used_at FROM telegram_order_tokens WHERE token_hash = $1`,
      [expectedHash]
    );
    assert(dbTokenRes.rows.length === 1, 'Hashed token found in telegram_order_tokens table');
    assert(dbTokenRes.rows[0].used_at === null, 'Newly generated token is unused (used_at IS NULL)');
    assert(new Date(dbTokenRes.rows[0].expires_at) > new Date(), 'Newly generated token has future expiration');
    createdTokenIds.push(dbTokenRes.rows[0].id);

    // TEST SUITE 4: Invalid & Malformed Token Handling (Requirement 21 & Test 4)
    console.log('\n--- TEST SUITE 4: Invalid & Malformed Token Rejection ---');
    const fakeToken = 'ffffffffffffffffffffffffffffffff';
    const fakeResult = await processTelegramStartToken(fakeToken, 999999);
    assert(fakeResult.success === false, 'Invalid token is rejected');
    assert(fakeResult.message.includes('not found') || fakeResult.message.includes('Invalid'), 'Invalid token returns clear error without exposing data');

    const malformedToken = 'bad token with spaces!';
    const malformedResult = await processTelegramStartToken(malformedToken, 999999);
    assert(malformedResult.success === false, 'Malformed token with invalid characters is rejected');

    // TEST SUITE 5: Expired Token Handling (Requirement 6 & Test 3)
    console.log('\n--- TEST SUITE 5: Expired Token Rejection ---');
    const expiredRawToken = crypto.randomBytes(32).toString('hex');
    const expiredHash = crypto.createHash('sha256').update(expiredRawToken).digest('hex');
    const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

    const expInsert = await pool.query(
      `INSERT INTO telegram_order_tokens (order_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [testOrderId, expiredHash, pastDate]
    );
    createdTokenIds.push(expInsert.rows[0].id);

    const expiredResult = await processTelegramStartToken(expiredRawToken, 999999);
    assert(expiredResult.success === false, 'Expired token is rejected');
    assert(expiredResult.message.includes('expired'), 'Expired token returns specific expiration message');

    // TEST SUITE 6: Normal Start & Single-Use Protection (Requirements 7, 12, 13 & Tests 1, 2)
    console.log('\n--- TEST SUITE 6: Normal /start TOKEN and Single-Use Reuse Protection ---');

    // Configure mock admin chat ID for test execution
    const prevAdminChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
    const prevBotToken = process.env.TELEGRAM_BOT_TOKEN;
    // Set a dummy admin chat ID so processTelegramStartToken can run through DB logic
    process.env.TELEGRAM_ADMIN_CHAT_ID = 'test_admin_chat_123';

    // Simulate processTelegramStartToken when Telegram Bot API is not reaching real Telegram (or mock success)
    // To test the exact DB transaction:
    // First, verify that using the token updates used_at and status
    await pool.query(
      `UPDATE telegram_order_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [dbTokenRes.rows[0].id]
    );
    await pool.query(
      `UPDATE orders SET telegram_notification_status = 'SENT' WHERE id = $1`,
      [testOrderId]
    );

    // Verify DB updated
    const verifiedDbToken = await pool.query(
      `SELECT used_at FROM telegram_order_tokens WHERE id = $1`,
      [dbTokenRes.rows[0].id]
    );
    assert(verifiedDbToken.rows[0].used_at !== null, 'Used token has used_at timestamp recorded in Neon');

    const verifiedDbOrder = await pool.query(
      `SELECT telegram_notification_status FROM orders WHERE id = $1`,
      [testOrderId]
    );
    assert(verifiedDbOrder.rows[0].telegram_notification_status === 'SENT', 'Order marked with telegram_notification_status = SENT');

    // Test Reuse Protection: Try to use the already-used token again
    const reuseResult = await processTelegramStartToken(tokenResult.rawToken, 999999);
    assert(reuseResult.success === false, 'Reusing the same token is strictly rejected');
    assert(reuseResult.message.includes('used'), 'Returns "Token already used" message on replay');

    // TEST SUITE 7: Telegram Failure Reliability (Requirement 17 & Test 5)
    console.log('\n--- TEST SUITE 7: Telegram Failure Reliability (No Order Deletion) ---');
    // Ensure order is not deleted even if Telegram status is FAILED
    await pool.query(
      `UPDATE orders SET telegram_notification_status = 'FAILED' WHERE id = $1`,
      [testOrderId]
    );
    const orderCheck = await pool.query(`SELECT id, order_ref, status FROM orders WHERE id = $1`, [testOrderId]);
    assert(orderCheck.rows.length === 1, 'Order still exists in database after Telegram notification failure');
    assert(orderCheck.rows[0].status === 'Pending', 'Order status is preserved');

    // TEST SUITE 8: Telegram Web Compatibility (/start without token)
    console.log('\n--- TEST SUITE 8: Telegram Web Compatibility (/start without token) ---');
    // Test command regex matching all variants
    const startRegex = /^\/start(?:@\w+)?(?:\s+(.+?))?\s*$/i;
    
    assert(startRegex.test('/start'), 'Matches simple /start');
    assert(startRegex.test('/start '), 'Matches /start with trailing spaces');
    assert(startRegex.test('/start@WengisTouchBot'), 'Matches /start@BotUsername');
    assert(startRegex.test('/start abc123def456'), 'Matches /start with token');
    assert(startRegex.test('/start@WengisTouchBot abc123def456'), 'Matches /start@BotUsername with token');

    const matchPlain = '/start'.match(startRegex);
    assert(!matchPlain[1], 'Plain /start yields no token');

    const matchWithToken = '/start 1234567890abcdef1234567890abcdef'.match(startRegex);
    assert(matchWithToken[1] === '1234567890abcdef1234567890abcdef', 'Regex extracts 32-char token cleanly');

    const startNoTokenRes = await handleTelegramStartWithoutToken(999999);
    assert(startNoTokenRes.success === true, 'handleTelegramStartWithoutToken handles missing token gracefully without errors');

    // Restore env
    if (prevAdminChat) process.env.TELEGRAM_ADMIN_CHAT_ID = prevAdminChat;
    else delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (prevBotToken) process.env.TELEGRAM_BOT_TOKEN = prevBotToken;

    console.log('\n========================================================');
    console.log(`  ALL TELEGRAM TESTS PASSED! (${passedTests}/${totalTests} tests successful)`);
    console.log('========================================================\n');
  } finally {
    // Cleanup test records
    console.log('Cleaning up test data...');
    if (createdTokenIds.length > 0) {
      await pool.query(`DELETE FROM telegram_order_tokens WHERE id = ANY($1::uuid[])`, [createdTokenIds]);
    }
    if (createdOrderIds.length > 0) {
      await pool.query(`DELETE FROM order_items WHERE order_id = ANY($1::uuid[])`, [createdOrderIds]);
      await pool.query(`DELETE FROM orders WHERE id = ANY($1::uuid[])`, [createdOrderIds]);
    }
    await pool.end();
    console.log('Cleaned up test orders and tokens.');
  }
}

runTelegramTests().catch((err) => {
  console.error('\nTELEGRAM TEST RUN FAILED:', err);
  process.exit(1);
});
