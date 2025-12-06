/**
 * Servicio para gestión de verificación de identidad con Supabase
 */

import { supabase } from './supabase';
import { imageUriToBlob, generateUniqueFilename } from './imageHelpers';

export interface IdentityVerificationData {
  userId: string;
  dniNumber: string;
  dniFrontUri: string;
  dniBackUri: string;
  selfieUri: string;
}

export interface UploadProgress {
  step: 'dni-front' | 'dni-back' | 'selfie' | 'complete';
  progress: number;
}

/**
 * Sube una imagen al bucket de identidad
 */
async function uploadIdentityImage(
  uri: string,
  filename: string,
  bucket: string = 'identity-documents'
): Promise<string> {
  const blob = await imageUriToBlob(uri);
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir imagen: ${error.message}`);
  }

  // Obtener URL pública (nota: el bucket es privado, esta URL solo funciona con políticas correctas)
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

/**
 * Crea registro de verificación de identidad completo
 */
export async function submitIdentityVerification(
  data: IdentityVerificationData,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; verificationId?: string; error?: string }> {
  try {
    // 1. Subir DNI frente
    onProgress?.({ step: 'dni-front', progress: 0.25 });
    const dniFrontFilename = generateUniqueFilename(data.userId, 'dni-front');
    const dniFrontUrl = await uploadIdentityImage(data.dniFrontUri, dniFrontFilename);

    // 2. Subir DNI dorso
    onProgress?.({ step: 'dni-back', progress: 0.5 });
    const dniBackFilename = generateUniqueFilename(data.userId, 'dni-back');
    const dniBackUrl = await uploadIdentityImage(data.dniBackUri, dniBackFilename);

    // 3. Subir selfie
    onProgress?.({ step: 'selfie', progress: 0.75 });
    const selfieFilename = generateUniqueFilename(data.userId, 'selfie');
    const selfieUrl = await uploadIdentityImage(data.selfieUri, selfieFilename);

    // 4. Crear registro en technician_verifications
    onProgress?.({ step: 'complete', progress: 0.9 });
    const { data: verification, error: verificationError } = await supabase
      .from('technician_verifications')
      .insert({
        technician_id: data.userId,
        dni_number: data.dniNumber,
        dni_front_url: dniFrontUrl,
        dni_back_url: dniBackUrl,
        selfie_url: selfieUrl,
        verification_status: 'pending',
        processing_status: 'pending',
      })
      .select('id')
      .single();

    if (verificationError) {
      throw new Error(`Error al crear verificación: ${verificationError.message}`);
    }

    onProgress?.({ step: 'complete', progress: 1.0 });

    return {
      success: true,
      verificationId: verification.id,
    };
  } catch (error: any) {
    console.error('Error en submitIdentityVerification:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al procesar verificación',
    };
  }
}

/**
 * Obtiene el estado de verificación de un técnico
 */
export async function getVerificationStatus(
  userId: string
): Promise<{
  hasVerification: boolean;
  status?: string;
  processingStatus?: string;
  verifiedAt?: string;
  failureReason?: string;
}> {
  const { data, error } = await supabase
    .from('technician_verifications')
    .select('verification_status, processing_status, verified_at, failure_reason')
    .eq('technician_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { hasVerification: false };
  }

  return {
    hasVerification: true,
    status: data.verification_status,
    processingStatus: data.processing_status,
    verifiedAt: data.verified_at,
    failureReason: data.failure_reason,
  };
}

/**
 * Verifica si un usuario ya tiene una verificación pendiente o aprobada
 */
export async function hasActiveVerification(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('technician_verifications')
    .select('id')
    .eq('technician_id', userId)
    .in('verification_status', ['pending', 'approved'])
    .limit(1)
    .maybeSingle();

  return !!data;
}
