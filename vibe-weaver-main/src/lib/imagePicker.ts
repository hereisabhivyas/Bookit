import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Convert base64 string to Blob object
 */
function base64ToBlob(base64String: string, mimeType: string = 'image/jpeg'): Blob {
  // Remove data URL prefix if present
  const base64Data = base64String.includes(',') 
    ? base64String.split(',')[1] 
    : base64String;
  
  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: mimeType });
}

/**
 * Convert base64 string to File object
 */
function base64ToFile(base64String: string, filename: string): File {
  // Detect MIME type from base64 header or default to jpeg
  let mimeType = 'image/jpeg';
  if (base64String.startsWith('data:')) {
    const match = base64String.match(/data:([^;]+);/);
    if (match) {
      mimeType = match[1];
    }
  }
  
  const blob = base64ToBlob(base64String, mimeType);
  return new File([blob], filename, { type: mimeType });
}

/**
 * Pick a single image from gallery or camera on Android/iOS, or use file input on web
 */
export async function pickSingleImage(): Promise<File | null> {
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos, // Use gallery
      });
      
      if (image.base64String) {
        const filename = `image_${Date.now()}.${image.format || 'jpg'}`;
        return base64ToFile(image.base64String, filename);
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      // User cancelled or error occurred
      return null;
    }
  } else {
    // Web: Use standard file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        resolve(file || null);
      };
      
      input.oncancel = () => {
        resolve(null);
      };
      
      input.click();
    });
  }
}

/**
 * Pick multiple images from gallery on Android/iOS, or use file input on web
 */
export async function pickMultipleImages(): Promise<File[]> {
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative) {
    try {
      // For native, we'll allow users to pick images one by one
      // Note: Capacitor Camera doesn't support multiple selection natively
      // You may want to call this multiple times or use a different plugin
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });
      
      if (image.base64String) {
        const filename = `image_${Date.now()}.${image.format || 'jpg'}`;
        const file = base64ToFile(image.base64String, filename);
        return [file];
      }
      
      return [];
    } catch (error) {
      console.error('Error picking images:', error);
      return [];
    }
  } else {
    // Web: Use standard file input with multiple selection
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          resolve(Array.from(files));
        } else {
          resolve([]);
        }
      };
      
      input.oncancel = () => {
        resolve([]);
      };
      
      input.click();
    });
  }
}

/**
 * Take a photo using camera on Android/iOS
 */
export async function takePhoto(): Promise<File | null> {
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera, // Use camera
      });
      
      if (image.base64String) {
        const filename = `photo_${Date.now()}.${image.format || 'jpg'}`;
        return base64ToFile(image.base64String, filename);
      }
      
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  } else {
    // Web: Use standard file input with camera capture
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        resolve(file || null);
      };
      
      input.oncancel = () => {
        resolve(null);
      };
      
      input.click();
    });
  }
}

/**
 * Pick image with choice between camera and gallery on native platforms
 */
export async function pickImageWithPrompt(): Promise<File | null> {
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt, // Let user choose camera or gallery
      });
      
      if (image.base64String) {
        const filename = `image_${Date.now()}.${image.format || 'jpg'}`;
        return base64ToFile(image.base64String, filename);
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  } else {
    // Web: Use standard file input
    return pickSingleImage();
  }
}
