import {
  ref,
  uploadBytes,
  getBytes,
  deleteObject,
  Timestamp
} from 'firebase/storage';
import { storage, db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';

/**
 * Upload file to Firebase Storage with secure naming
 */
export async function uploadFile(file, postId, userId) {
  try {
    if (!file) throw new Error('No file provided');
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Max 50MB allowed');
    }

    // Create secure file path
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomStr}-${file.name}`;
    const filePath = `protected/${postId}/${userId}/${fileName}`;

    // Upload to storage
    const fileRef = ref(storage, filePath);
    const snapshot = await uploadBytes(fileRef, file);

    // Record file metadata in Firestore
    const fileMetadata = {
      postId,
      uploadedBy: userId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      storagePath: filePath,
      uploadedAt: new Date(),
      accessCount: 0
    };

    const docRef = await addDoc(collection(db, 'files'), fileMetadata);

    return {
      success: true,
      fileId: docRef.id,
      fileName: file.name,
      path: filePath,
      size: file.size
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
}

/**
 * Generate secure download URL for a file
 * In production, this would use Firebase custom claims + Cloud Functions for signed URLs
 */
export async function getSecureFileUrl(fileId, storagePath) {
  try {
    // For now, we return the file metadata ID
    // In production, this would call a Cloud Function to generate a signed URL
    // that expires after a specific time
    return {
      success: true,
      fileId,
      downloadToken: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      expiresIn: 3600 // 1 hour
    };
  } catch (error) {
    console.error('Get URL error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Download file (server-side would handle via Cloud Function)
 */
export async function downloadFile(fileId, userId, postId) {
  try {
    // In production, call backend to:
    // 1. Verify access
    // 2. Log download
    // 3. Generate stream
    
    const downloadInfo = {
      fileId,
      userId,
      postId,
      downloadedAt: new Date(),
      token: generateDownloadToken()
    };

    return {
      success: true,
      downloadInfo
    };
  } catch (error) {
    console.error('Download error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(fileId, storagePath) {
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);

    // Delete from Firestore
    const { deleteDoc, doc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'files', fileId));

    return { success: true };
  } catch (error) {
    console.error('Delete file error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate download token for rate limiting
 */
function generateDownloadToken() {
  return `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate file type
 */
export function validateFileType(file) {
  const allowedTypes = [
    'application/pdf',
    'application/zip',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel'
  ];

  return allowedTypes.includes(file.type);
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
