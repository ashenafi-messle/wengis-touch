import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { v2 as cloudinary } from 'cloudinary';

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

async function migrateImages() {
  console.log('--- WENGI\'S TOUCH: PRODUCT IMAGE MIGRATION TO CLOUDINARY ---');

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'oydsg6yc';
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL is not set in .env');
    process.exit(1);
  }

  if (!apiKey || !apiSecret) {
    console.warn('\nNOTICE: Cloudinary API credentials (CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET) are not configured in .env.');
    console.warn('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file to run live Cloudinary image migration.');
    console.warn('Skipping remote migration.\n');
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const { rows: products } = await pool.query('SELECT id, title, images FROM products ORDER BY created_at DESC');
    console.log(`Found ${products.length} products in Neon PostgreSQL.\n`);

    let migratedProducts = 0;
    let migratedImagesCount = 0;
    let alreadyCloudinaryCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const images = Array.isArray(product.images) ? product.images : [];
      let productChanged = false;
      const updatedImages = [];

      for (let j = 0; j < images.length; j++) {
        const imgUrl = images[j];
        if (!imgUrl || typeof imgUrl !== 'string') continue;

        // Skip if already hosted on Cloudinary
        if (imgUrl.includes('res.cloudinary.com')) {
          updatedImages.push(imgUrl);
          alreadyCloudinaryCount++;
          continue;
        }

        console.log(`[${i + 1}/${products.length}] Migrating image for product "${product.title}" (${product.id}): ${imgUrl.slice(0, 60)}...`);

        try {
          // Upload directly to Cloudinary via remote URL
          const result = await cloudinary.uploader.upload(imgUrl, {
            folder: `wengis-touch/products/${product.id}`,
            resource_type: 'image',
            fetch_format: 'auto',
            quality: 'auto',
          });

          updatedImages.push(result.secure_url);
          productChanged = true;
          migratedImagesCount++;
          console.log(`  -> Successfully uploaded to Cloudinary: ${result.secure_url}`);
        } catch (uploadErr) {
          console.error(`  -> Failed to migrate image: ${uploadErr.message}. Keeping existing reference.`);
          updatedImages.push(imgUrl);
        }
      }

      if (productChanged) {
        await pool.query('UPDATE products SET images = $1 WHERE id = $2', [updatedImages, product.id]);
        migratedProducts++;
      }
    }

    console.log('\n--- MIGRATION SUMMARY ---');
    console.log(`Total Products Checked: ${products.length}`);
    console.log(`Products Updated: ${migratedProducts}`);
    console.log(`Images Migrated to Cloudinary: ${migratedImagesCount}`);
    console.log(`Images Already on Cloudinary: ${alreadyCloudinaryCount}`);
    console.log('-------------------------\n');
  } catch (err) {
    console.error('Migration encountered an error:', err);
  } finally {
    await pool.end();
  }
}

migrateImages();
