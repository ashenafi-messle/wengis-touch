/**
 * Cloudinary Responsive Image Optimization Helper
 * Injects automatic format, quality, and size transformations into Cloudinary delivery URLs.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  crop?: 'limit' | 'fill' | 'scale' | 'thumb' | 'fit';
  quality?: 'auto' | string;
  format?: 'auto' | string;
}

/**
 * Returns an optimized Cloudinary delivery URL or falls back to original if non-Cloudinary.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== 'string') {
    return 'https://picsum.photos/seed/crochet/600/450';
  }

  // If not hosted on Cloudinary, return as is
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  const {
    width,
    height,
    crop = 'limit',
    quality = 'auto',
    format = 'auto'
  } = options;

  const transformations: string[] = [];

  if (format) transformations.push(`f_${format}`);
  if (quality) transformations.push(`q_${quality}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  const transformString = transformations.join(',');

  // Check if URL already has transformation segment after /upload/
  // Example pattern: /image/upload/v12345/ or /image/upload/w_500,q_auto/v12345/
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const prefix = url.substring(0, uploadIndex + '/upload/'.length);
  const remainder = url.substring(uploadIndex + '/upload/'.length);

  // If first segment is already a transformation (e.g. w_300,q_auto)
  const segments = remainder.split('/');
  if (segments.length > 1 && /[a-z]_[a-z0-9]/i.test(segments[0])) {
    // Replace existing transformation
    return `${prefix}${transformString}/${segments.slice(1).join('/')}`;
  }

  return `${prefix}${transformString}/${remainder}`;
}

/**
 * Product Card Grid Image (~400px, fast load, automatic WebP/AVIF compression)
 */
export function getCardImageUrl(url: string | undefined | null): string {
  return getOptimizedImageUrl(url, {
    width: 450,
    crop: 'limit',
    quality: 'auto',
    format: 'auto'
  });
}

/**
 * Product Details Modal / Showcase Main View (~1000px, high quality, responsive)
 */
export function getDetailImageUrl(url: string | undefined | null): string {
  return getOptimizedImageUrl(url, {
    width: 1000,
    crop: 'limit',
    quality: 'auto',
    format: 'auto'
  });
}

/**
 * Cart & Mini-list Thumbnail (~160x160px cropped square)
 */
export function getThumbnailImageUrl(url: string | undefined | null): string {
  return getOptimizedImageUrl(url, {
    width: 160,
    height: 160,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
}

/**
 * Lightbox / Fullscreen Zoom (~1600px, detailed zoom resolution)
 */
export function getZoomImageUrl(url: string | undefined | null): string {
  return getOptimizedImageUrl(url, {
    width: 1600,
    crop: 'limit',
    quality: 'auto',
    format: 'auto'
  });
}
