import { NextRequest, NextResponse } from 'next/server';
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
  validateImage,
  MAX_IMAGES_PER_PRODUCT,
} from '@/lib/cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Check existing images count passed from frontend
    const existingCountStr = formData.get('existingCount');
    const existingCount = existingCountStr ? parseInt(existingCountStr as string, 10) : 0;

    // Collect all files from FormData
    const files: File[] = [];
    const directFiles = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;

    if (directFiles && directFiles.length > 0) {
      files.push(...directFiles.filter(f => f && f.size > 0));
    } else if (singleFile && singleFile.size > 0) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No image files provided for upload.' }, { status: 400 });
    }

    // Enforce 10 images maximum restriction on the backend
    if (existingCount + files.length > MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_IMAGES_PER_PRODUCT} images are allowed for one product. You currently have ${existingCount} and attempted to upload ${files.length}.`,
        },
        { status: 400 }
      );
    }

    // Validate every file before processing any upload
    for (const file of files) {
      const validation = validateImage({ type: file.type, size: file.size });
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const uploadedResults: Array<{ url: string; publicId: string }> = [];

    const useCloudinary = isCloudinaryConfigured();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (useCloudinary) {
        try {
          const res = await uploadToCloudinary(buffer, {
            folder: 'wengis-touch/products',
          });
          uploadedResults.push({
            url: res.secure_url,
            publicId: res.public_id,
          });
        } catch (uploadErr: any) {
          console.error('Cloudinary upload error:', uploadErr);
          return NextResponse.json(
            { error: `Image upload failed: ${uploadErr?.message || 'Cloudinary error'}` },
            { status: 500 }
          );
        }
      } else {
        // Safe local fallback if Cloudinary API keys have not been configured yet
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });
        const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const filePath = path.join(uploadsDir, safeName);
        await writeFile(filePath, buffer);
        uploadedResults.push({
          url: `/uploads/${safeName}`,
          publicId: `local-${safeName}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      images: uploadedResults,
      url: uploadedResults[0]?.url || '',
    });
  } catch (error: any) {
    console.error('Upload handling error:', error);
    return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 });
  }
}

/**
 * Handle image deletion from Cloudinary
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');
    const url = searchParams.get('url');

    const target = publicId || url;
    if (!target) {
      return NextResponse.json({ error: 'Missing publicId or url parameter' }, { status: 400 });
    }

    const deleted = await deleteFromCloudinary(target);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json({ error: 'Failed to delete image.' }, { status: 500 });
  }
}
