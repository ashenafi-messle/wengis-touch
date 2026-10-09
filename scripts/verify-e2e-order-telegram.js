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
  isValidProductImageUrl,
  extractPrimaryProductImageUrl,
  sendTelegramPhoto,
  sendTelegramMediaGroup,
  sendCustomerResponse,
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

  // Image validation unit tests
  console.log('\n--- VERIFYING IMAGE URL VALIDATION & EXTRACTION ---');
  assert(isValidProductImageUrl('https://res.cloudinary.com/oydsg6yc/image/upload/sample.jpg') === true, 'Cloudinary HTTPS URL is accepted');
  assert(isValidProductImageUrl('https://xiutwblkoardcbavhsem.supabase.co/storage/v1/object/public/test.jpg') === true, 'Supabase HTTPS URL is accepted');
  assert(isValidProductImageUrl('http://res.cloudinary.com/sample.jpg') === false, 'Insecure HTTP URL is rejected');
  assert(isValidProductImageUrl('https://localhost/test.jpg') === false, 'Localhost URL is rejected');
  assert(isValidProductImageUrl('https://127.0.0.1/test.jpg') === false, 'Loopback IP URL is rejected');
  assert(isValidProductImageUrl('https://192.168.1.1/test.jpg') === false, 'Private IP URL is rejected');
  assert(isValidProductImageUrl('file:///etc/passwd') === false, 'File URI scheme is rejected');

  assert(
    extractPrimaryProductImageUrl('https://res.cloudinary.com/test.jpg') === 'https://res.cloudinary.com/test.jpg',
    'Extracts direct string image URL'
  );
  assert(
    extractPrimaryProductImageUrl(null, ['https://res.cloudinary.com/cat1.jpg', 'https://res.cloudinary.com/cat2.jpg']) === 'https://res.cloudinary.com/cat1.jpg',
    'Extracts primary image from catalog array when item image is missing'
  );
  assert(
    extractPrimaryProductImageUrl(null, JSON.stringify(['https://res.cloudinary.com/json.jpg'])) === 'https://res.cloudinary.com/json.jpg',
    'Extracts primary image from JSON string array'
  );

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

    const updatedOrder = await pool.query(`SELECT telegram_notification_status, telegram_images_status FROM orders WHERE id = $1`, [orderId]);
    assert(updatedOrder.rows[0].telegram_notification_status === 'SENT', 'Order status updated to telegram_notification_status = SENT');
    assert(updatedOrder.rows[0].telegram_images_status === 'SENT', 'Order images status updated to telegram_images_status = SENT');

    // 4. Test Token Replay Protection
    console.log('\n--- TESTING REPLAY / IDEMPOTENCY PROTECTION ---');
    const replayResult = await processTelegramStartToken(tokenResult.rawToken, config.adminChatId);
    assert(replayResult.success === false, 'Replaying the same token was safely rejected');
    assert(replayResult.message.includes('used'), 'Correct "Token already used" message returned');

    // 5. Test Missing Image Resilience (Order with no images should still succeed safely)
    console.log('\n--- TESTING MISSING IMAGE SAFETY ---');
    const noImgOrder = await pool.query(
      `INSERT INTO orders (order_ref, customer_name, customer_email, customer_phone, shipping_address,
                           total_amount, status, delivery_preference, payment_method, telegram_notification_status)
       VALUES ('WT-E2E-NOIMG-001', 'Test Customer No Img', 'noimg@test.com', '+251911000000', 'Addis Ababa',
               500, 'Pending', 'Standard', 'Cash on Delivery', 'PENDING')
       RETURNING id`
    );
    const noImgOrderId = noImgOrder.rows[0].id;
    createdOrderIds.push(noImgOrderId);

    await pool.query(
      `INSERT INTO order_items (order_id, product_title, quantity, price, color, product_image)
       VALUES ($1, 'Plain Handcrafted Item (No Photo)', 1, 500, 'Natural', '')`,
      [noImgOrderId]
    );

    const noImgTokenRes = await generateTelegramOrderToken(noImgOrderId);
    createdTokenIds.push(
      (await pool.query(`SELECT id FROM telegram_order_tokens WHERE token_hash = $1`, [
        crypto.createHash('sha256').update(noImgTokenRes.rawToken).digest('hex')
      ])).rows[0].id
    );

    const noImgDispatch = await processTelegramStartToken(noImgTokenRes.rawToken, config.adminChatId);
    assert(noImgDispatch.success === true, 'Order without images dispatched text notification successfully');
    const noImgDb = await pool.query(`SELECT telegram_images_status FROM orders WHERE id = $1`, [noImgOrderId]);
    assert(noImgDb.rows[0].telegram_images_status === 'NONE', 'Order without images marked telegram_images_status = NONE');

    // 6. Test Missing Token Handling (/start without token)
    console.log('\n--- TESTING /start WITHOUT TOKEN (TELEGRAM WEB COMPATIBILITY) ---');
    const noTokenResult = await handleTelegramStartWithoutToken(config.adminChatId);
    assert(noTokenResult.success === true, 'Handled /start without token safely with guidance message');

    // 7. Test Admin Chat Isolation (Customer messages NEVER reach administrator)
    console.log('\n--- TESTING ADMINISTRATOR CHAT ISOLATION ---');
    const customerResponseToAdmin = await sendCustomerResponse(config.adminChatId, '✅ Order received!');
    assert(customerResponseToAdmin.skipped === true, 'Customer confirmation text is strictly suppressed for administrator chat');

    const welcomeResponseToAdmin = await sendCustomerResponse(config.adminChatId, '🧶 Welcome to Wengi\'s Touch!');
    assert(welcomeResponseToAdmin.skipped === true, 'Customer welcome text is strictly suppressed for administrator chat');

    // 8. Test Exact Formatting Requirements
    console.log('\n--- TESTING EXACT NOTIFICATION FORMATTING ---');
    const testFormattedMessage = formatTelegramOrderMessage({
      orderRef: 'WT-E2E-LIVE-001',
      customerName: 'Abebe Bikila (E2E Test)',
      customerPhone: '+251911223344',
      customerEmail: 'abebe.test@wengistouch.com',
      shippingAddress: 'Gondar, Piazza, House #42',
      deliveryPreference: 'Express 2-Day',
      paymentMethod: 'Cash on Delivery',
      status: 'Pending',
      specialNotes: 'Automated End-to-End Verification Test Order',
      totalAmount: 1850,
      createdAt: '2026-10-09T00:00:00.000Z',
      items: [
        {
          productTitle: 'Royal Crochet Beanie',
          quantity: 1,
          price: 650,
          color: 'Burgundy',
        },
        {
          productTitle: 'Atelier Handcrafted Shrug',
          quantity: 1,
          price: 1200,
          color: 'Warm Sand',
        },
      ],
    });

    assert(testFormattedMessage.includes("🛍 <b>WENGI'S TOUCH — NEW ORDER</b>"), 'Format includes exact title');
    assert(testFormattedMessage.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━'), 'Format includes separator lines');
    assert(testFormattedMessage.includes('<b>Order ID:</b> <code>#WT-E2E-LIVE-001</code>'), 'Format includes Order ID');
    assert(testFormattedMessage.includes('<b>Date:</b> 2026-10-09'), 'Format includes Date');
    assert(testFormattedMessage.includes('👤 <b>CUSTOMER INFORMATION</b>'), 'Format includes Customer header');
    assert(testFormattedMessage.includes('• <b>Name:</b> Abebe Bikila (E2E Test)'), 'Format includes Customer Name');
    assert(testFormattedMessage.includes('• <b>Phone:</b> <code>+251911223344</code>'), 'Format includes Customer Phone');
    assert(testFormattedMessage.includes('• <b>Email:</b> abebe.test@wengistouch.com'), 'Format includes Customer Email');
    assert(testFormattedMessage.includes('📍 <b>DELIVERY INFORMATION</b>'), 'Format includes Delivery header');
    assert(testFormattedMessage.includes('• <b>Address:</b> Gondar, Piazza, House #42'), 'Format includes Delivery Address');
    assert(testFormattedMessage.includes('• <b>Delivery Preference:</b> Express 2-Day'), 'Format includes Delivery Preference');
    assert(testFormattedMessage.includes('🛒 <b>ORDERED PRODUCTS</b>'), 'Format includes Ordered Products header');
    assert(testFormattedMessage.includes('<b>1. Royal Crochet Beanie</b>\nQuantity: <b>1</b>\nUnit Price: <b>650.00 ETB</b>\nSubtotal: <b>650.00 ETB</b>\nColor: <b>Burgundy</b>'), 'Product 1 matches exact unindented structure');
    assert(testFormattedMessage.includes('<b>2. Atelier Handcrafted Shrug</b>\nQuantity: <b>1</b>\nUnit Price: <b>1200.00 ETB</b>\nSubtotal: <b>1200.00 ETB</b>\nColor: <b>Warm Sand</b>'), 'Product 2 matches exact unindented structure');
    assert(testFormattedMessage.includes('💰 <b>ORDER SUMMARY</b>\n• <b>Subtotal:</b> 1850.00 ETB\n• <b>Delivery Fee:</b> 0.00 ETB\n• <b>Discount:</b> 0.00 ETB\n• <b>TOTAL:</b> <b>1850.00 ETB</b>'), 'Order summary matches exact numbers and labels');
    assert(testFormattedMessage.includes('💳 <b>PAYMENT</b>\n• <b>Payment Method:</b> Cash on Delivery\n• <b>Payment Status:</b> Pending'), 'Payment section matches exact format');
    assert(testFormattedMessage.includes('📝 <b>Special Notes:</b>\nAutomated End-to-End Verification Test Order'), 'Special notes matches exact format');
    assert(testFormattedMessage.includes('📦 <b>ORDER STATUS</b>\nNew Order (Confirmed via Telegram)'), 'Order status matches exact format');
    assert(testFormattedMessage.includes('Admin Destination: @wengi67'), 'Admin destination matches @wengi67');

    // Test omission of optional absent fields
    const minimalOrder = formatTelegramOrderMessage({
      orderRef: 'WT-MINIMAL',
      customerName: 'Minimal Customer',
      customerPhone: '0900000000',
      totalAmount: 100,
    });
    assert(!minimalOrder.includes('• <b>Email:</b>'), 'Omitted absent email');
    assert(!minimalOrder.includes('• <b>Address:</b>'), 'Omitted absent address');
    assert(!minimalOrder.includes('• <b>Delivery Preference:</b>'), 'Omitted absent delivery preference');
    assert(!minimalOrder.includes('📝 <b>Special Notes:</b>'), 'Omitted absent special notes');

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
