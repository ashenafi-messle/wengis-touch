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
  dpr?: 'auto' | number;
}

export const FALLBACK_CROCHET_IMAGE =
  'https://res.cloudinary.com/oydsg6yc/image/upload/f_auto,q_auto,w_600/v1791546044/5926965701123970020.jpg';

/**
 * Returns an optimized Cloudinary delivery URL or falls back to original if non-Cloudinary.
 * Safely strips any existing transformation segments to avoid duplicate stacking.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== 'string') {
    return FALLBACK_CROCHET_IMAGE;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return FALLBACK_CROCHET_IMAGE;
  }

  // If not hosted on Cloudinary, return as is
  if (!trimmed.includes('res.cloudinary.com') || !trimmed.includes('/upload/')) {
    return trimmed;
  }

  const {
    width,
    height,
    crop = 'limit',
    quality = 'auto',
    format = 'auto',
    dpr
  } = options;

  const transformations: string[] = [];

  if (format) transformations.push(`f_${format}`);
  if (quality) transformations.push(`q_${quality}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);
  if (dpr) transformations.push(`dpr_${dpr}`);

  const transformString = transformations.join(',');
  if (!transformString) return trimmed;

  const uploadIndex = trimmed.indexOf('/upload/');
  if (uploadIndex === -1) return trimmed;

  const prefix = trimmed.substring(0, uploadIndex + '/upload/'.length);
  const remainder = trimmed.substring(uploadIndex + '/upload/'.length);

  // Split path segments after /upload/
  const segments = remainder.split('/');
  
  // Find where the version tag or actual asset path begins (e.g. v12345 or folder/file.jpg)
  // Any segment matching Cloudinary transformation parameter pattern before the version tag
  // is removed to prevent duplicate stacked transformations.
  let firstAssetIndex = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    // Version tag like v1234567890
    if (/^v\d+$/.test(seg)) {
      firstAssetIndex = i;
      break;
    }
    // Check if segment is a transformation parameter
    if (/[a-z]_[a-z0-9]/i.test(seg)) {
      continue;
    }
    // If not a transformation segment and not version, it's the file/folder path
    firstAssetIndex = i;
    break;
  }

  const cleanAssetPath = segments.slice(firstAssetIndex).join('/');
  return `${prefix}${transformString}/${cleanAssetPath}`;
}

/**
 * Product Card Grid Image (~450px, fast load, automatic WebP/AVIF compression)
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

/**
 * Hero rotating showcase image (~800px)
 */
export function getHeroImageUrl(url: string | undefined | null): string {
  return getOptimizedImageUrl(url, {
    width: 800,
    crop: 'limit',
    quality: 'auto',
    format: 'auto'
  });
}

/**
 * Generates responsive srcset string for Cloudinary images across specified widths.
 */
export function getResponsiveSrcSet(
  url: string | undefined | null,
  widths: number[] = [280, 400, 600, 800],
  options: Omit<ImageOptimizationOptions, 'width'> = { crop: 'limit', quality: 'auto', format: 'auto' }
): string {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return '';
  }

  return widths
    .map(w => {
      const optUrl = getOptimizedImageUrl(url, { ...options, width: w });
      return `${optUrl} ${w}w`;
    })
    .join(', ');
}

export function getCardSrcSet(url: string | undefined | null): string {
  return getResponsiveSrcSet(url, [280, 400, 600, 800], { crop: 'limit', quality: 'auto', format: 'auto' });
}

export function getDetailSrcSet(url: string | undefined | null): string {
  return getResponsiveSrcSet(url, [500, 800, 1000, 1200], { crop: 'limit', quality: 'auto', format: 'auto' });
}

export function getHeroSrcSet(url: string | undefined | null): string {
  return getResponsiveSrcSet(url, [400, 600, 800, 1000], { crop: 'limit', quality: 'auto', format: 'auto' });
}
