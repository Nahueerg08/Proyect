#!/usr/bin/env node
/**
 * Reset identity verification data.
 * Usage:
 *   node scripts/reset-identity.mjs --user <uuid>    # limpia datos de un usuario específico
 *   node scripts/reset-identity.mjs --all            # limpia TODOS los datos de verificación
 *
 * Requisitos:
 *  - Variables de entorno: EXPO_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (para --all o para borrar storage)
 *  - Para --user SIN service role key: solo se intentará borrar registros si RLS lo permite (probablemente no)
 */

import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getArgValue = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1];
};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // necesario para bypass RLS en limpieza global

if (!SUPABASE_URL) {
  console.error('ERROR: Falta EXPO_PUBLIC_SUPABASE_URL en variables de entorno.');
  process.exit(1);
}

if (!SERVICE_KEY && hasFlag('--all')) {
  console.error('ERROR: Para usar --all necesitas SUPABASE_SERVICE_ROLE_KEY en entorno.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const run = async () => {
  const userId = getArgValue('--user');
  const doAll = hasFlag('--all');

  if (!doAll && !userId) {
    console.error('Debes pasar --user <uuid> o --all');
    process.exit(1);
  }

  console.log('Iniciando limpieza identidad...');

  if (doAll) {
    console.log('> Eliminando todas las verificaciones de public.technician_verifications');
    const { error: verErr } = await supabase.from('technician_verifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (verErr) console.error('Error borrando verificaciones:', verErr.message);

    console.log('> Eliminando TODOS los objetos del bucket identity-documents');
    const { data: list, error: listErr } = await supabase.storage.from('identity-documents').list(undefined, { limit: 1000 });
    if (listErr) console.error('Error listando bucket:', listErr.message);
    else {
      for (const item of list) {
        if (item.name) {
          const { error: rmErr } = await supabase.storage.from('identity-documents').remove([item.name]);
          if (rmErr) console.error('Error eliminando objeto', item.name, rmErr.message);
        }
      }
    }
    console.log('> (Opcional) Eliminar perfiles técnicos - comentar si no se desea');
    const { error: profErr } = await supabase.from('technician_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (profErr) console.error('Error borrando perfiles técnicos:', profErr.message);
    console.log('Limpieza global completa.');
    process.exit(0);
  }

  // Limpieza por usuario
  console.log(`> Eliminando verificaciones del usuario ${userId}`);
  const { error: verErrUser } = await supabase.from('technician_verifications').delete().eq('technician_id', userId);
  if (verErrUser) console.error('Error borrando verificaciones usuario:', verErrUser.message);

  console.log(`> Eliminando perfil técnico del usuario ${userId}`);
  const { error: profErrUser } = await supabase.from('technician_profiles').delete().eq('id', userId);
  if (profErrUser) console.error('Error borrando perfil técnico usuario:', profErrUser.message);

  console.log('> Eliminando archivos del bucket bajo carpeta del usuario');
  const { data: userFiles, error: listUserErr } = await supabase.storage.from('identity-documents').list(userId, { limit: 1000 });
  if (listUserErr) console.error('Error listando carpeta usuario:', listUserErr.message);
  else if (userFiles.length) {
    const paths = userFiles.map(f => `${userId}/${f.name}`);
    const { error: rmUserErr } = await supabase.storage.from('identity-documents').remove(paths);
    if (rmUserErr) console.error('Error eliminando archivos usuario:', rmUserErr.message);
  } else {
    console.log('No había archivos de identidad para eliminar.');
  }

  console.log('Limpieza por usuario completada.');
  process.exit(0);
};

run();
