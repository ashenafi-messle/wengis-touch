import {
  getOptimizedImageUrl,
  getCardImageUrl,
  getDetailImageUrl,
  getThumbnailImageUrl,
  getZoomImageUrl,
  getHeroImageUrl,
  getCardSrcSet,
  getDetailSrcSet,
  getHeroSrcSet
} from '../src/utils/imageOptimizer.ts';

console.log('========================================================');
console.log('  WENGI\'S TOUCH — IMAGE PERFORMANCE & BACK NAV AUDIT    ');
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

// 1. Cloudinary Transformations
console.log('--- AUDITING CLOUDINARY TRANSFORMATION LOGIC ---');
const testCloudinaryUrl = 'https://res.cloudinary.com/oydsg6yc/image/upload/v1791546044/5926965701123970020.jpg';

const cardUrl = getCardImageUrl(testCloudinaryUrl);
assert(cardUrl.includes('w_450') && cardUrl.includes('f_auto') && cardUrl.includes('q_auto'), 'Product card URL contains w_450, f_auto, q_auto');

const detailUrl = getDetailImageUrl(testCloudinaryUrl);
assert(detailUrl.includes('w_1000') && detailUrl.includes('f_auto') && detailUrl.includes('q_auto'), 'Product detail URL contains w_1000, f_auto, q_auto');

const thumbUrl = getThumbnailImageUrl(testCloudinaryUrl);
assert(thumbUrl.includes('w_160') && thumbUrl.includes('h_160') && thumbUrl.includes('c_fill'), 'Cart thumbnail contains 160x160 fill crop');

const heroUrl = getHeroImageUrl(testCloudinaryUrl);
assert(heroUrl.includes('w_800') && heroUrl.includes('f_auto') && heroUrl.includes('q_auto'), 'Hero image contains w_800, f_auto, q_auto');

const zoomUrl = getZoomImageUrl(testCloudinaryUrl);
assert(zoomUrl.includes('w_1600') && zoomUrl.includes('f_auto') && zoomUrl.includes('q_auto'), 'Zoom modal contains w_1600, f_auto, q_auto');

// 2. Duplicate Transformation Prevention
console.log('\n--- AUDITING DUPLICATE TRANSFORMATION PREVENTION ---');
const alreadyTransformed = 'https://res.cloudinary.com/oydsg6yc/image/upload/f_auto,q_auto,w_450/v1791546044/5926965701123970020.jpg';
const reTransformed = getDetailImageUrl(alreadyTransformed);
assert(!reTransformed.includes('w_450'), 'Re-transforming replaces previous w_450 instead of stacking');
assert(reTransformed.includes('w_1000'), 'Re-transforming applies new w_1000 transformation cleanly');

// Check that count of '/upload/' is exactly 1
const uploadCount = (reTransformed.match(/\/upload\//g) || []).length;
assert(uploadCount === 1, 'Only exactly 1 /upload/ segment exists in URL');

// 3. Responsive SrcSet Generation
console.log('\n--- AUDITING RESPONSIVE SRCSET GENERATION ---');
const cardSrcSet = getCardSrcSet(testCloudinaryUrl);
assert(cardSrcSet.includes('280w') && cardSrcSet.includes('400w') && cardSrcSet.includes('600w') && cardSrcSet.includes('800w'), 'Card srcset covers responsive breakpoints 280w, 400w, 600w, 800w');

const detailSrcSet = getDetailSrcSet(testCloudinaryUrl);
assert(detailSrcSet.includes('500w') && detailSrcSet.includes('800w') && detailSrcSet.includes('1000w') && detailSrcSet.includes('1200w'), 'Detail srcset covers breakpoints 500w, 800w, 1000w, 1200w');

const heroSrcSet = getHeroSrcSet(testCloudinaryUrl);
assert(heroSrcSet.includes('400w') && heroSrcSet.includes('600w') && heroSrcSet.includes('800w') && heroSrcSet.includes('1000w'), 'Hero srcset covers breakpoints 400w, 600w, 800w, 1000w');

// 4. Non-Cloudinary Safety Passthrough
console.log('\n--- AUDITING NON-CLOUDINARY AND EDGE SAFETY ---');
const localUrl = '/logo.jpg';
assert(getCardImageUrl(localUrl) === '/logo.jpg', 'Local asset URLs pass through unaltered');

const externalUrl = 'https://example.com/crochet.jpg';
assert(getCardImageUrl(externalUrl) === 'https://example.com/crochet.jpg', 'Non-Cloudinary external URLs pass through unaltered');

const nullUrl = getCardImageUrl(null);
assert(nullUrl.includes('res.cloudinary.com'), 'Null or undefined URLs fall back safely to curated crochet fallback');

console.log('\n========================================================');
console.log(`   ALL AUDIT CHECKS PASSED! (${passed}/${total} assertions successful)`);
console.log('========================================================\n');
