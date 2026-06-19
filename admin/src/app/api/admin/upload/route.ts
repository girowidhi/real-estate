import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-utils';
import sharp from 'sharp';
import { supabaseAdmin } from '@/lib/db';

export const POST = withAdminAuth(async (req) => {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const maxSizeMB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10');
  if (buffer.length > maxSizeMB * 1024 * 1024) {
    return NextResponse.json({ error: `File exceeds ${maxSizeMB}MB limit` }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and SVG allowed.' }, { status: 400 });
  }

  const timestamp = Date.now();
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${timestamp}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  // Resize if image (not SVG)
  const buf = buffer as unknown as Buffer;
  let processedBuffer = buf;
  let metadata: sharp.Metadata | null = null;
  let isTransparent = false;
  let finalExt = ext;
  let finalMime = file.type;
  if (file.type !== 'image/svg+xml') {
    metadata = await sharp(processedBuffer).metadata();
    isTransparent = !!(metadata.channels && metadata.channels === 4);
    const resized = sharp(processedBuffer).resize({ width: Math.min(metadata.width || 1920, 1920), withoutEnlargement: true });
    if (isTransparent) {
      processedBuffer = await resized.png().toBuffer();
      finalExt = 'png';
      finalMime = 'image/png';
    } else {
      processedBuffer = await resized.jpeg({ quality: 85 }).toBuffer();
      finalMime = 'image/jpeg';
    }
  }

  const finalFilename = `${timestamp}-${Math.random().toString(36).substring(2, 8)}.${finalExt}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('admin-uploads')
    .upload(finalFilename, processedBuffer, {
      contentType: finalMime,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from('admin-uploads').getPublicUrl(finalFilename);

  // Generate thumbnail for images
  let thumbnailUrl = publicUrl;
  if (file.type !== 'image/svg+xml') {
    const thumbFilename = `thumb-${finalFilename}`;
    if (isTransparent) {
      const thumbBuffer = await sharp(buf)
        .resize(200, 200, { fit: 'cover' })
        .png()
        .toBuffer();
      await supabaseAdmin.storage.from('admin-uploads').upload(thumbFilename, thumbBuffer, { contentType: 'image/png' });
    } else {
      const thumbBuffer = await sharp(buf)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toBuffer();
      await supabaseAdmin.storage.from('admin-uploads').upload(thumbFilename, thumbBuffer, { contentType: 'image/jpeg' });
    }
    const { data: { publicUrl: thumbPublicUrl } } = supabaseAdmin.storage.from('admin-uploads').getPublicUrl(thumbFilename);
    thumbnailUrl = thumbPublicUrl;
  }

  return NextResponse.json({
    url: publicUrl,
    thumbnail: thumbnailUrl,
    filename: finalFilename,
    size: processedBuffer.length,
    width: metadata?.width || null,
    height: metadata?.height || null,
  });
});
