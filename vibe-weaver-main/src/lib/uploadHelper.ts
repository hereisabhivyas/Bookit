import { API_URL } from './api';

/**
 * Upload images using native fetch to avoid CapacitorHttp issues with FormData
 * This bypasses the Capacitor HTTP plugin which doesn't handle multipart/form-data correctly
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  // Use native fetch instead of axios to avoid CapacitorHttp interception
  const response = await fetch(`${API_URL}/upload/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type - let the browser set it with the boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.urls || !Array.isArray(data.urls)) {
    throw new Error('Invalid response from server');
  }

  return data.urls;
}

/**
 * Upload a single image
 */
export async function uploadSingleImage(file: File): Promise<string> {
  const urls = await uploadImages([file]);
  if (urls.length === 0) {
    throw new Error('No URL returned from upload');
  }
  return urls[0];
}
