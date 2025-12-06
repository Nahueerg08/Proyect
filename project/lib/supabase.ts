import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Tomar variables preferentemente de app.json (expo.extra), y caer a process.env si no están.
const extra = Constants.expoConfig?.extra as
  | { EXPO_PUBLIC_SUPABASE_URL?: string; EXPO_PUBLIC_SUPABASE_ANON_KEY?: string }
  | undefined;
const urlFromExtra = extra?.EXPO_PUBLIC_SUPABASE_URL;
const keyFromExtra = extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const urlFromEnv = process.env.EXPO_PUBLIC_SUPABASE_URL;
const keyFromEnv = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = urlFromExtra || urlFromEnv;
const supabaseAnonKey = keyFromExtra || keyFromEnv;

// Validaciones adicionales para evitar usar placeholders por accidente
const isPlaceholderUrl = supabaseUrl?.includes('your-project.supabase.co');
if (isPlaceholderUrl) {
  console.warn(
    '[Supabase] Estás usando la URL placeholder (your-project.supabase.co). Reemplaza con el dominio real de tu proyecto desde https://supabase.com/dashboard.'
  );
}

// Diagnóstico: loguear fuente y host (sin exponer la key completa)
if (__DEV__) {
  const srcUrl = urlFromExtra ? 'app.json.extra' : urlFromEnv ? '.env' : 'none';
  const srcKey = keyFromExtra ? 'app.json.extra' : keyFromEnv ? '.env' : 'none';
  try {
    const host = supabaseUrl ? new URL(supabaseUrl).host : 'undefined';
    // Mostrar solo los primeros 6 caracteres de la key por seguridad
    const keyPreview = supabaseAnonKey ? `${supabaseAnonKey.slice(0, 6)}…` : 'undefined';
    console.log(
      `[Supabase] URL host: ${host} (source: ${srcUrl}), anonKey: ${keyPreview} (source: ${srcKey})`
    );
  } catch {
    console.warn('[Supabase] URL inválida o no definida');
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  // Ayuda de diagnóstico temprana en desarrollo
  console.warn(
    '[Supabase] Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY. Configúralas en app.json -> extra o en .env (prefijo EXPO_PUBLIC_).'
  );
}

if (__DEV__ && supabaseUrl && supabaseAnonKey && isPlaceholderUrl) {
  // Evitar crear cliente inválido: lanza error explícito para desarrollador
  throw new Error(
    'Supabase URL es un placeholder (your-project.supabase.co). Configura EXPO_PUBLIC_SUPABASE_URL correctamente en app.json -> extra.'
  );
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
