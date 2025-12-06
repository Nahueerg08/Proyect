## Propósito

Estas instrucciones ayudan a un agente de codificación a ser productivo rápidamente en el repositorio "OficiosYa" (Expo + React Native + Supabase).

## Big picture (arquitectura)
- Frontend: React Native + Expo con enrutamiento por archivos (expo-router). Rutas principales bajo `app/` — p. ej. `app/(auth)/`, `app/(tabs)/`, `app/technician/[id].tsx`.
- Estado/Autenticación: `contexts/AuthContext.tsx` usa `supabase` para auth y carga de `profiles`.
- API/BD: Supabase (cliente en `lib/supabase.ts`). Las migraciones están en `supabase/migrations/`.

## Convenciones y patrones específicos
- Alias de importación: Se usa `@/` (ver `tsconfig.json` -> `paths`). Preferir `@/` en nuevos imports.
- Enrutamiento: archivo -> ruta. `app/_layout.tsx` monta `AuthProvider` y `Stack`.
- Autenticación: usar `useAuth()` (de `contexts/AuthContext.tsx`) para acceder a `session`, `user`, `profile`, `loading`, `signIn`, `signUp`, `signOut`, `refreshProfile`.
- Supabase client: `lib/supabase.ts` obtiene las claves desde `Constants.expoConfig.extra` o `process.env`. El cliente persiste sesiones con `AsyncStorage`.
- Componentes: patrón de props consistente (ej. `components/Button.tsx` usa `variant`, `size`, `loading`, `disabled`). Seguir el mismo enfoque para nuevos componentes.

## Flujo típico a seguir para cambios que tocan auth/DB
1. Revisar `lib/supabase.ts` y `contexts/AuthContext.tsx` para entender cómo se obtiene la sesión y se carga `profiles`.
2. Si añades/alteras tablas, actualizar `supabase/migrations/*.sql` y documentar las políticas RLS.
3. Probar localmente con `npm run dev` y las variables de entorno: `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` (definir en `app.json` -> `extra` o `.env` y `Constants.expoConfig.extra`).

## Comandos útiles (desde la raíz del proyecto)
- Desarrollo: `npm run dev` (lanza Expo).  
- Lint: `npm run lint`  
- Typecheck: `npm run typecheck`  
- Build web (expo): `npm run build:web`  
- EAS builds (si procede): `eas build --platform android|ios` (README menciona EAS).

## Archivos clave para revisar (rápido)
- `app/_layout.tsx` — montaje del layout y `AuthProvider`.
- `app/index.tsx` — lógica de redirección basada en `useAuth()`.
- `contexts/AuthContext.tsx` — todo lo relacionado a sesión, signup/signin y carga de `profiles`.
- `lib/supabase.ts` — donde se crea el cliente Supabase y cómo se leen las variables de entorno.
- `types/database.ts` — tipos generados usados en `AuthContext` y en consultas.
- `supabase/migrations/` — migraciones SQL necesarias para cambios de esquema.

## Qué evitar / notas
- No asumir que las claves de Supabase están en `.env`; el código también lee `Constants.expoConfig.extra` (revisar `app.json` si existe).  
- Cambios a RLS o a funciones SQL requieren migraciones y revisión de políticas.

## Ejemplo rápido (cómo autenticar y refrescar perfil)
Usar `useAuth()` en una pantalla: el patrón esperado es el que ya existe en `app/index.tsx` — comprobar `loading` y redirigir según `session`.

## Preguntas que hacer al mantener el proyecto
- ¿Dónde deben almacenarse nuevas claves/envs — `app.json` `extra` o `.env`?  
- ¿Hay reglas RLS nuevas al modificar tablas? Documentarlas en la migración.

---
Si quieres, integro aquí ejemplos de PRs o plantillas (commits recomendados) y adapto el archivo según cómo prefieras documentar policies/entornos.
