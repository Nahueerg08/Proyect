# Configuración de Verificación de Email

## Cambios Realizados

### 1. Archivo `lib/supabase.ts`
- ✅ Cambiado `detectSessionInUrl: true` para permitir la detección de tokens en URLs

### 2. Archivo `app/_layout.tsx`
- ✅ Agregado manejo de deep links para procesar tokens de confirmación de email
- ✅ Usa `Linking.addEventListener` para capturar URLs cuando la app ya está abierta
- ✅ Usa `Linking.getInitialURL` para capturar URLs cuando la app se abre desde el link

### 3. Migración de Base de Datos
- ✅ Agregada columna `email` a la tabla `profiles` (migración `20251116170000_add_email_to_profiles.sql`)

## Configuración Requerida en Supabase Dashboard

Para que la verificación de email funcione correctamente, debes configurar las URLs de redirección en tu proyecto de Supabase:

### Pasos:

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto: **teelxokttmwlhumdiqwf**
3. Ve a **Authentication** → **URL Configuration**
4. En la sección **Redirect URLs**, agrega las siguientes URLs:

   **Para desarrollo local:**
   ```
   http://localhost:8081
   exp://localhost:8081
   ```

   **Para la app móvil (deep linking):**
   ```
   oficiosya://
   ```

   **Para producción web (si aplica):**
   ```
   https://tu-dominio.com
   ```

5. Guarda los cambios

### Plantilla de Email (Opcional)

Si deseas personalizar el email de verificación:

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Confirm signup**
3. Personaliza el mensaje y asegúrate de que el botón apunte a: `{{ .ConfirmationURL }}`

## Cómo Probar

### Desde el script de prueba:
```powershell
$env:DOMAIN='gmail.com'; node scripts/test-signup.mjs
```

### Desde la app:
1. Inicia el servidor de desarrollo: `npm run dev`
2. Ve a la pantalla de registro
3. Completa el formulario y regístrate
4. Revisa tu email
5. Haz clic en el link de confirmación
6. La app debería detectar el token y confirmar automáticamente tu cuenta
7. Podrás iniciar sesión

## Troubleshooting

### El link no funciona
- Verifica que las Redirect URLs estén configuradas en Supabase Dashboard
- Asegúrate de que el scheme `oficiosya://` esté en la lista
- Revisa los logs de la consola para ver si hay errores

### El email no llega
- Revisa la carpeta de spam
- Verifica que el email sea válido (no usar `example.com`)
- Usa un dominio real como `gmail.com`, `outlook.com`, etc.

### La sesión no se crea después de confirmar
- Verifica que `detectSessionInUrl: true` esté en `lib/supabase.ts`
- Asegúrate de que el deep link handler esté funcionando (revisa los logs)
- Prueba cerrando y volviendo a abrir la app después de hacer clic en el link

## Notas Adicionales

- La confirmación por email solo se requiere en producción
- En desarrollo local, Supabase puede estar configurado para autoconfirmar usuarios
- Puedes desactivar la confirmación por email en **Authentication** → **Settings** → **Email Auth** → desmarcar "Enable email confirmations"
