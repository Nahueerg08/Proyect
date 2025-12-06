# Configuración del Sistema de Verificación DNI

## Paso 1: Ejecutar la Migración

1. Ve a tu proyecto en **Supabase Dashboard**
2. Navega a **SQL Editor** en el menú lateral
3. Copia y pega el contenido del archivo:
   ```
   supabase/migrations/20251128000002_add_technician_verifications.sql
   ```
4. Haz clic en **Run** para ejecutar la migración
5. Deberías ver el mensaje: "Success. No rows returned"

**Esto creará:**
- Tabla `technician_verifications` con columnas: dni_number, dni_image_url, verification_status
- Políticas RLS para que técnicos puedan insertar/ver sus propias verificaciones
- Índices para búsquedas eficientes

---

## Paso 2: Crear el Bucket de Storage

1. En Supabase Dashboard, ve a **Storage**
2. Haz clic en **New bucket**
3. Configura:
   - **Name**: `dni-documents`
   - **Public bucket**: ✅ Marcalo (para que las URLs sean accesibles)
   - Haz clic en **Create bucket**

---

## Paso 3: Configurar Políticas del Bucket

1. Haz clic en el bucket `dni-documents` que acabas de crear
2. Ve a la pestaña **Policies**
3. Haz clic en **New policy**

### Política 1: Permitir Upload (INSERT)
- **Policy name**: Users can upload their own DNI
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **Policy definition**:
```sql
(bucket_id = 'dni-documents'::text) 
AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

### Política 2: Permitir Actualizar (UPDATE)
- **Policy name**: Users can update their own DNI
- **Allowed operation**: UPDATE
- **Target roles**: authenticated
- **Policy definition**:
```sql
(bucket_id = 'dni-documents'::text) 
AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

### Política 3: Permitir Lectura Pública (SELECT)
- **Policy name**: Public can view DNI images
- **Allowed operation**: SELECT
- **Target roles**: public
- **Policy definition**:
```sql
bucket_id = 'dni-documents'::text
```

**Nota:** Si prefieres que solo admins vean las imágenes, cambia "public" por "authenticated" y agrega condiciones adicionales.

---

## Paso 4: Verificar la Configuración

Ejecuta esta query en el **SQL Editor** para verificar:

```sql
-- Verificar tabla
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'technician_verifications';

-- Verificar políticas de la tabla
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'technician_verifications';

-- Verificar bucket
SELECT * FROM storage.buckets WHERE name = 'dni-documents';

-- Verificar políticas del bucket
SELECT * FROM storage.policies WHERE bucket_id = 'dni-documents';
```

---

## Paso 5: Probar el Flujo

1. Abre la app con `npm run dev`
2. Inicia sesión con una cuenta de usuario
3. Ve a crear perfil técnico
4. Llena el formulario:
   - Selecciona categoría
   - Completa descripción y ubicación
   - **Ingresa tu DNI** (7-8 dígitos)
   - **Toma una foto o sube imagen del DNI**
5. Presiona "Crear Perfil"

**Si todo funciona:**
- Verás el mensaje: "Tu perfil ha sido creado. Tu DNI será verificado en las próximas 24-48 horas"
- La imagen se subirá a `dni-documents/{user_id}/dni-{timestamp}.jpg`
- Se creará un registro en `technician_verifications` con status `pending`

---

## Consultas Útiles para Administración

### Ver todas las verificaciones pendientes
```sql
SELECT 
  tv.id,
  tv.dni_number,
  tv.dni_image_url,
  tv.verification_status,
  tv.submitted_at,
  p.email,
  tp.location
FROM technician_verifications tv
JOIN technician_profiles tp ON tv.technician_id = tp.id
JOIN profiles p ON tp.id = p.id
WHERE tv.verification_status = 'pending'
ORDER BY tv.submitted_at ASC;
```

### Aprobar una verificación
```sql
UPDATE technician_verifications
SET 
  verification_status = 'approved',
  verified_at = now(),
  verified_by = auth.uid()
WHERE id = '<verification_id>';

-- También actualizar el perfil del técnico
UPDATE technician_profiles
SET is_approved = true
WHERE id = (SELECT technician_id FROM technician_verifications WHERE id = '<verification_id>');
```

### Rechazar una verificación
```sql
UPDATE technician_verifications
SET 
  verification_status = 'rejected',
  verification_notes = 'Motivo del rechazo aquí',
  verified_at = now(),
  verified_by = auth.uid()
WHERE id = '<verification_id>';
```

---

## Solución de Problemas

### Error: "relation technician_verifications does not exist"
→ La migración no se ejecutó. Ve al Paso 1.

### Error: "The resource was not found" al subir imagen
→ El bucket no existe. Ve al Paso 2.

### Error: "new row violates row-level security policy"
→ Las políticas del bucket no están configuradas. Ve al Paso 3.

### La imagen no se muestra
→ Verifica que el bucket esté marcado como **Public** y que exista la política SELECT.

---

## Próximos Pasos (Futuro)

- [ ] Crear pantalla de administración para aprobar/rechazar DNIs
- [ ] Enviar notificaciones cuando el DNI sea aprobado/rechazado
- [ ] Agregar validación automática de DNI con IA/OCR
- [ ] Permitir reenviar DNI si fue rechazado
