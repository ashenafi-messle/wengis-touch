import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

// Configure Cloudinary using server-side environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'oydsg6yc';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(apiKey && apiSecret && cloudName);
}

// Allowed product image MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGES_PER_PRODUCT = 10;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImage(file: { type: string; size: number }): ImageValidationResult {
  const normalizedType = file.type.toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.includes(normalizedType)) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type}). Supported formats: JPEG, PNG, WEBP, AVIF.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Image is too large (${sizeMb}MB). Maximum allowed size is 10MB.`,
    };
  }

  return { valid: true };
}

/**
 * Upload a file Buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    filename?: string;
  } = {}
): Promise<{ secure_url: string; public_id: string; format: string; width: number; height: number }> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials (CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured.');
  }

  const folder = options.folder || 'wengis-touch/products';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload returned empty response'));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Upload a remote image URL directly to Cloudinary (used for migration)
 */
export async function uploadRemoteUrlToCloudinary(
  remoteUrl: string,
  options: { folder?: string; publicId?: string } = {}
): Promise<{ secure_url: string; public_id: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  const folder = options.folder || 'wengis-touch/products';
  const result = await cloudinary.uploader.upload(remoteUrl, {
    folder,
    public_id: options.publicId,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}

/**
 * Extract Cloudinary public_id from a Cloudinary URL
 */
export function extractPublicId(imageUrl: string): string | null {
  if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * Delete an image from Cloudinary by its public_id or full URL
 */
export async function deleteFromCloudinary(publicIdOrUrl: string): Promise<boolean> {
  if (!isCloudinaryConfigured()) return false;

  const publicId = publicIdOrUrl.startsWith('http')
    ? extractPublicId(publicIdOrUrl)
    : publicIdOrUrl;

  if (!publicId) return false;

  try {
    const res = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    return res.result === 'ok' || res.result === 'not found';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
}
