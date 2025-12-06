/**
 * Utilidades para manejo y optimización de imágenes
 */

import * as ImagePicker from 'expo-image-picker';

export interface ImageCompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Solicita permisos de cámara
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Solicita permisos de galería
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Captura una foto con la cámara
 */
export async function capturePhoto(
  options?: ImageCompressionOptions
): Promise<string | null> {
  const hasPermission = await requestCameraPermission();
  
  if (!hasPermission) {
    throw new Error('Se requiere permiso de cámara');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: options?.quality || 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Selecciona una imagen de la galería
 */
export async function pickImageFromLibrary(
  options?: ImageCompressionOptions
): Promise<string | null> {
  const hasPermission = await requestMediaLibraryPermission();
  
  if (!hasPermission) {
    throw new Error('Se requiere permiso de acceso a la galería');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: options?.quality || 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Convierte URI de imagen a Blob para subir a Supabase
 */
export async function imageUriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}

/**
 * Obtiene información básica de una imagen
 */
export function getImageInfo(uri: string): {
  extension: string;
  filename: string;
} {
  const parts = uri.split('/');
  const filename = parts[parts.length - 1];
  const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
  
  return { extension, filename };
}

/**
 * Genera nombre de archivo único para upload
 */
export function generateUniqueFilename(
  userId: string,
  prefix: string,
  extension: string = 'jpg'
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${prefix}-${timestamp}-${random}.${extension}`;
}
