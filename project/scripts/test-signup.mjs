#!/usr/bin/env node
/**
 * Script de prueba para crear usuarios en Supabase con emails aleatorios.
 * Usa las variables de entorno EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.
 * Ejecución:
 *   npm run signup:demo               -> crea 1 usuario
 *   COUNT=3 npm run signup:demo       -> crea 3 usuarios
 *   ROLE=technician npm run signup:demo
 *   DOMAIN=midominio.com COUNT=2 npm run signup:demo
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

let url = process.env.EXPO_PUBLIC_SUPABASE_URL;
let anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Intentar leer app.json
  try {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    const raw = fs.readFileSync(appJsonPath, 'utf8');
    const parsed = JSON.parse(raw);
    url = parsed?.expo?.extra?.EXPO_PUBLIC_SUPABASE_URL || url;
    anon = parsed?.expo?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || anon;
  } catch (_e) {
    // ignorar, se manejará si aún faltan
  }
}

if (!url || !anon) {
  console.error('Faltan variables EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY (ni en entorno ni en app.json).');
  process.exit(1);
}

const supabase = createClient(url, anon);

const COUNT = parseInt(process.env.COUNT || '1', 10);
const ROLE = (process.env.ROLE === 'technician' ? 'technician' : 'client');
const DOMAIN = process.env.DOMAIN || 'example.com';

function randomEmail() {
  const stamp = Date.now();
  const rand = Math.floor(Math.random() * 1e6);
  return `test+${stamp}-${rand}@${DOMAIN}`;
}

async function createOne(index) {
  const email = randomEmail();
  const password = 'Test1234!';
  const full_name = `Usuario Demo ${index + 1}`;
  console.log(`\n[${index + 1}/${COUNT}] Creando usuario: ${email} (role=${ROLE})`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role: ROLE },
    },
  });
  if (error) {
    console.error('❌ Error signup:', error.message);
  } else {
    console.log('✅ Signup OK. user id:', data.user?.id, 'session?', !!data.session);
    if (!data.session) {
      console.log('   (Correo de verificación enviado; requiere confirmación)');
    }
  }
}

(async () => {
  console.log('Iniciando creación de usuarios de prueba...');
  for (let i = 0; i < COUNT; i++) {
    await createOne(i);
  }
  console.log('\nFinalizado.');
})();
