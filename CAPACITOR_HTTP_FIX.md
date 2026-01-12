# Image Upload Fix - CapacitorHttp FormData Issue

## Problem Identified

When trying to upload images in the Android app, the images were being selected successfully via the Capacitor Camera plugin, but the upload was failing because:

1. **Root Cause**: When using `axios` in a Capacitor Android app, the request is intercepted by `CapacitorHttp` plugin
2. **The Issue**: CapacitorHttp converts FormData to JSON format instead of sending it as `multipart/form-data`
3. **Backend Expectation**: The backend API expects `multipart/form-data` with actual file uploads using multer

### Evidence from Logcat:
```
CapacitorHttp XMLHttpRequest POST
"data":[{"key":"images","value":"<base64_string>"}]
```

The image was being sent as JSON with base64 string instead of as multipart/form-data.

## Solution Implemented

### 1. Created Upload Helper (`src/lib/uploadHelper.ts`)
- Uses native `fetch()` API instead of `axios`
- Bypasses CapacitorHttp interception
- Properly sends FormData as `multipart/form-data`
- Handles authentication with Bearer token

```typescript
export async function uploadImages(files: File[]): Promise<string[]> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('images', file);
  });

  // Use native fetch instead of axios to avoid CapacitorHttp interception
  const response = await fetch(`${API_URL}/upload/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with boundary
    },
    body: formData,
  });
  
  // ... handle response
}
```

### 2. Updated All Image Upload Pages

#### Files Updated:
- ✅ `src/pages/profile.tsx` - Profile photo upload
- ✅ `src/pages/VenueManagement.tsx` - Venue gallery upload  
- ✅ `src/pages/Communities.tsx` - Community logo upload
- ✅ `src/pages/CommunityChat.tsx` - Community settings logo upload

All pages now use:
- `uploadSingleImage(file)` for single file uploads
- `uploadImages(files)` for multiple file uploads

### 3. Improved Image Picker
Enhanced `src/lib/imagePicker.ts`:
- Better base64 to Blob conversion
- Proper MIME type detection
- Cleaner File object creation

## How It Works Now

### Flow:
1. **User clicks "Choose Photo"** → Capacitor Camera API opens native Android gallery
2. **User selects image** → Image returned as base64 string
3. **Convert to File** → Base64 converted to proper File object with Blob
4. **Upload with fetch** → Native fetch sends FormData as multipart/form-data
5. **Backend receives** → Multer processes the file correctly
6. **Success** → Cloudinary URL returned and saved

### Key Differences:

**Before (Broken):**
```
axios.post(url, formData) 
  → CapacitorHttp intercepts 
  → Converts to JSON: {"data":[{"key":"images","value":"base64..."}]}
  → Backend receives JSON ❌
```

**After (Fixed):**
```
fetch(url, { body: formData })
  → Direct fetch API
  → Sends as multipart/form-data with boundary
  → Backend receives proper file upload ✅
```

## Testing Instructions

1. **Rebuild and sync:**
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

2. **Test in Android Studio:**
   - Build and run on device/emulator
   - Navigate to Profile page
   - Click "Choose Photo"
   - Select an image from gallery
   - Image should upload automatically
   - Success message should appear

3. **Verify in Logcat:**
   - Should see successful upload logs
   - No "No images uploaded" errors
   - Response should contain Cloudinary URLs

## Why This Works

1. **Native Fetch**: Bypasses Capacitor's HTTP interception
2. **Proper Content-Type**: Browser automatically sets `multipart/form-data` with correct boundary
3. **Real File Objects**: Properly constructed File objects with Blob data
4. **Multer Compatible**: Backend receives request in expected format

## Additional Benefits

- Works seamlessly on both web and Android
- No changes needed to backend API
- Proper error handling with specific error messages
- Maintains authentication with Bearer tokens
- Supports both single and multiple file uploads

## Files Created/Modified

### Created:
- `src/lib/uploadHelper.ts` - Upload utility using native fetch

### Modified:
- `src/lib/imagePicker.ts` - Enhanced base64 to File conversion
- `src/pages/profile.tsx` - Uses new upload helper
- `src/pages/VenueManagement.tsx` - Uses new upload helper
- `src/pages/Communities.tsx` - Uses new upload helper
- `src/pages/CommunityChat.tsx` - Uses new upload helper

## Troubleshooting

If uploads still fail:
1. Check network connectivity
2. Verify authentication token is valid
3. Check backend API is running and accessible
4. Review logcat for specific error messages
5. Ensure storage permissions are granted

## Next Steps

Consider:
1. Adding image compression before upload to reduce bandwidth
2. Adding progress indicators for large uploads
3. Implementing image cropping for profile photos
4. Adding upload retry logic for failed uploads
