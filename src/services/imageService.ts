import { supabase } from '../lib/supabase';

interface ImageUploadResult {
  url: string;
  path: string;
  size: number;
  width?: number;
  height?: number;
}

export async function uploadImage(
  file: File,
  folder: 'products' | 'avatars' | 'makers' | 'events' = 'products'
): Promise<ImageUploadResult> {
  const session = await supabase.auth.getSession();

  if (!session.data.session) {
    throw new Error('User not authenticated');
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-image`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  const result = await response.json();
  return result.data;
}

export async function uploadMultipleImages(
  files: File[],
  folder: 'products' | 'avatars' | 'makers' | 'events' = 'products'
): Promise<ImageUploadResult[]> {
  const uploads = files.map(file => uploadImage(file, folder));
  return Promise.all(uploads);
}

export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('images')
    .remove([path]);

  if (error) throw error;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
    };
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  return { valid: true };
}

export async function validateImageDimensions(
  file: File,
  minWidth: number = 1200,
  minHeight: number = 1200
): Promise<{ valid: boolean; error?: string; width?: number; height?: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image must be at least ${minWidth}x${minHeight} pixels. Your image is ${img.width}x${img.height} pixels.`,
          width: img.width,
          height: img.height,
        });
      } else {
        resolve({
          valid: true,
          width: img.width,
          height: img.height,
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: 'Failed to load image. Please try a different file.',
      });
    };

    img.src = url;
  });
}

export async function validateProductImages(
  files: File[]
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (files.length < 3) {
    errors.push('At least 3 photos required for product listings.');
  }

  for (let i = 0; i < files.length; i++) {
    const fileValidation = validateImageFile(files[i]);
    if (!fileValidation.valid) {
      errors.push(`Photo ${i + 1}: ${fileValidation.error}`);
      continue;
    }

    const dimensionValidation = await validateImageDimensions(files[i]);
    if (!dimensionValidation.valid) {
      errors.push(`Photo ${i + 1}: ${dimensionValidation.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getImageUrl(path: string): string {
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(path);

  return data.publicUrl;
}
