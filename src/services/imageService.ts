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

export function getImageUrl(path: string): string {
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(path);

  return data.publicUrl;
}
