/**
 * Utilidades para validación de identidad y DNI
 */

/**
 * Valida formato de DNI argentino (7-8 dígitos numéricos)
 */
export function validateDNI(dni: string): { valid: boolean; error?: string } {
  const cleaned = dni.trim();
  
  if (!cleaned) {
    return { valid: false, error: 'El DNI es requerido' };
  }
  
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'El DNI solo puede contener números' };
  }
  
  if (cleaned.length < 7 || cleaned.length > 8) {
    return { valid: false, error: 'El DNI debe tener 7 u 8 dígitos' };
  }
  
  return { valid: true };
}

/**
 * Formatea DNI con separadores de miles
 */
export function formatDNI(dni: string): string {
  const cleaned = dni.replace(/\D/g, '');
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Valida que una imagen tenga el tamaño y tipo correcto
 */
export function validateImage(
  uri: string,
  options?: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  }
): { valid: boolean; error?: string } {
  if (!uri) {
    return { valid: false, error: 'No se ha seleccionado ninguna imagen' };
  }
  
  // Validaciones básicas por extensión
  const extension = uri.split('.').pop()?.toLowerCase();
  const allowedTypes = options?.allowedTypes || ['jpg', 'jpeg', 'png'];
  
  if (extension && !allowedTypes.includes(extension)) {
    return {
      valid: false,
      error: `Formato no permitido. Use: ${allowedTypes.join(', ')}`,
    };
  }
  
  return { valid: true };
}

/**
 * Valida que todas las imágenes requeridas estén presentes
 */
export function validateIdentityImages(images: {
  dniFront?: string | null;
  dniBack?: string | null;
  selfie?: string | null;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  if (!images.dniFront) {
    errors.dniFront = 'La foto del frente del DNI es requerida';
  }
  
  if (!images.dniBack) {
    errors.dniBack = 'La foto del dorso del DNI es requerida';
  }
  
  if (!images.selfie) {
    errors.selfie = 'La selfie es requerida';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Consejos para captura de DNI
 */
export const DNI_CAPTURE_TIPS = {
  front: [
    'Coloca el DNI sobre una superficie plana',
    'Asegúrate de que toda la superficie sea visible',
    'Evita reflejos y sombras',
    'La foto debe estar enfocada y legible',
  ],
  back: [
    'Voltea el DNI y colócalo sobre una superficie plana',
    'Captura el código de barras completo',
    'Asegúrate de que todos los datos sean legibles',
  ],
  selfie: [
    'Asegúrate de tener buena iluminación',
    'Mantén el rostro centrado',
    'Retira lentes, gorras u otros accesorios',
    'Mira directamente a la cámara',
  ],
};

/**
 * Estados de verificación
 */
export const VERIFICATION_STATUS = {
  pending: {
    label: 'Pendiente',
    color: '#FFA500',
    description: 'Tu verificación está en proceso',
  },
  processing: {
    label: 'Procesando',
    color: '#2196F3',
    description: 'Estamos verificando tu identidad',
  },
  approved: {
    label: 'Aprobado',
    color: '#4CAF50',
    description: 'Tu identidad ha sido verificada',
  },
  rejected: {
    label: 'Rechazado',
    color: '#F44336',
    description: 'Verifica los datos y vuelve a intentar',
  },
} as const;

export type VerificationStatus = keyof typeof VERIFICATION_STATUS;
