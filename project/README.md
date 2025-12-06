# OficiosYa - Plataforma de Conexión con Profesionales de Servicios

OficiosYa es una aplicación móvil nativa (Android e iOS) tipo Airbnb diseñada para conectar usuarios con técnicos, profesionales y prestadores de servicios como electricistas, plomeros, albañiles, jardineros, personal de limpieza, cuidadores y más.

## 🚀 Características Principales

### Para Clientes
- **Búsqueda de Profesionales**: Encuentra técnicos por categoría, ubicación y calificación
- **Reseñas y Calificaciones**: Lee y deja reseñas con sistema de estrellas (1-5)
- **Favoritos**: Guarda técnicos para acceder rápidamente
- **Contacto Directo**: WhatsApp, llamada telefónica, Instagram, Facebook
- **Filtros Avanzados**: Por categoría, ubicación, precio y calificación
- **Geolocalización**: Encuentra técnicos cercanos a tu ubicación

### Para Técnicos
- **Perfil Profesional**: Crea y gestiona tu perfil con descripción, fotos y servicios
- **Múltiples Categorías**: Electricista, Plomero, Albañil, Gasista, Jardinero, y más
- **Información de Contacto**: WhatsApp, redes sociales y teléfono
- **Galería de Trabajos**: Muestra fotos de tus proyectos realizados
- **Estadísticas**: Visualiza tu calificación promedio y número de reseñas
- **Publicación Inmediata**: Sin necesidad de aprobación para publicar tu perfil

### Características Generales
- **Autenticación Segura**: Sistema de registro e inicio de sesión con Supabase
- **Notificaciones**: Recibe alertas cuando recibes nuevas reseñas
- **Diseño Moderno**: Interfaz intuitiva con colores profesionales (azul #1E88E5)
- **Multiplataforma**: Android e iOS desde una única base de código

## 🛠 Tecnologías Utilizadas

### Frontend
- **React Native**: Framework para aplicaciones móviles nativas
- **Expo**: Plataforma para desarrollo y despliegue
- **TypeScript**: Tipado estático para mayor seguridad
- **Expo Router**: Navegación basada en archivos
- **React Navigation**: Navegación con tabs y stacks

### Backend
- **Supabase**: Backend as a Service
- **PostgreSQL**: Base de datos relacional
- **Row Level Security**: Seguridad a nivel de fila
- **Supabase Auth**: Autenticación de usuarios

### Librerías Adicionales
- **lucide-react-native**: Iconos
- **expo-location**: Geolocalización
- **expo-image-picker**: Selección de imágenes
- **@react-native-async-storage/async-storage**: Almacenamiento local

## 📱 Estructura de la Base de Datos

### Tablas Principales

1. **profiles**: Perfiles de usuarios extendidos de auth.users
   - Información básica: nombre, email, teléfono, avatar
   - Roles: cliente, técnico, admin

2. **categories**: Categorías de servicios
   - Electricista, Plomero, Albañil, Gasista, etc.

3. **technician_profiles**: Perfiles profesionales de técnicos
   - Descripción, ubicación, precios
   - Calificación promedio y total de reseñas
   - Enlaces de contacto (WhatsApp, Instagram, Facebook)

4. **technician_images**: Galería de trabajos realizados

5. **reviews**: Reseñas y calificaciones
   - Puntuación de 1 a 5 estrellas
   - Comentarios opcionales
   - Actualización automática de calificaciones

6. **favorites**: Técnicos favoritos de cada usuario

7. **notifications**: Notificaciones del sistema

8. **contact_logs**: Registro de contactos realizados (métricas)

## 🔐 Seguridad

- **Row Level Security (RLS)**: Todas las tablas tienen políticas de seguridad
- **Políticas de Acceso**: Los usuarios solo pueden ver/editar sus propios datos
- **Validación de Datos**: Validación en frontend y backend
- **Autenticación**: JWT tokens con Supabase Auth

## 📁 Estructura del Proyecto

```
oficiosya/
├── app/                          # Rutas y pantallas
│   ├── (auth)/                   # Pantallas de autenticación
│   │   ├── welcome.tsx           # Pantalla de bienvenida
│   │   ├── login.tsx             # Inicio de sesión
│   │   └── register.tsx          # Registro
│   ├── (tabs)/                   # Navegación principal
│   │   ├── home.tsx              # Inicio con categorías
│   │   ├── search.tsx            # Búsqueda de técnicos
│   │   ├── favorites.tsx         # Favoritos del usuario
│   │   └── profile.tsx           # Perfil del usuario
│   ├── technician/               # Pantallas de técnicos
│   │   ├── [id].tsx              # Detalle del técnico
│   │   ├── my-profile.tsx        # Mi perfil profesional
│   │   ├── create.tsx            # Crear perfil profesional
│   │   └── edit.tsx              # Editar perfil profesional
│   ├── profile/                  # Gestión de perfil
│   │   ├── edit.tsx              # Editar perfil de usuario
│   │   └── settings.tsx          # Configuración
│   └── _layout.tsx               # Layout raíz
├── components/                   # Componentes reutilizables
│   ├── Button.tsx                # Botón personalizado
│   ├── Input.tsx                 # Input de texto
│   └── StarRating.tsx            # Calificación con estrellas
├── contexts/                     # Contextos de React
│   └── AuthContext.tsx           # Contexto de autenticación
├── lib/                          # Librerías y utilidades
│   └── supabase.ts               # Cliente de Supabase
├── types/                        # Tipos de TypeScript
│   └── database.ts               # Tipos de base de datos
├── constants/                    # Constantes
│   ├── Colors.ts                 # Paleta de colores
│   └── Categories.ts             # Iconos de categorías
└── .env                          # Variables de entorno
```

## 🚦 Primeros Pasos

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Expo CLI
- Cuenta de Supabase (ya configurada)

### Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Verificar variables de entorno en `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

4. Escanear el código QR con la app Expo Go (iOS/Android)

### Compilación para Producción

**Android:**
```bash
eas build --platform android
```

**iOS:**
```bash
eas build --platform ios
```

## 👥 Roles de Usuario

### Cliente
- Buscar y contactar técnicos
- Dejar reseñas y calificaciones
- Guardar favoritos
- Ver perfiles completos

### Técnico
- Crear perfil profesional
- Gestionar información de contacto
- Recibir reseñas
- Ver estadísticas

### Administrador (Futuro)
- Panel de administración web
- Gestionar técnicos y reseñas
- Enviar notificaciones
- Ver métricas del sistema

## 🎨 Diseño

### Colores Principales
- **Azul Principal**: #1E88E5
- **Azul Oscuro**: #1565C0
- **Blanco**: #FFFFFF
- **Gris Claro**: #F5F5F5
- **Texto**: #212121
- **Calificaciones**: #FFC107

### Tipografía
- Fuente del sistema (San Francisco en iOS, Roboto en Android)
- Tamaños: 12px - 32px
- Pesos: 400 (regular), 600 (semibold), 700 (bold)

## 📝 Flujo de Usuario

### Cliente
1. Registrarse como cliente
2. Buscar técnicos por categoría o ubicación
3. Ver perfil detallado con reseñas
4. Contactar por WhatsApp, teléfono o redes sociales
5. Dejar reseña después del servicio
6. Guardar técnicos favoritos

### Técnico
1. Registrarse como técnico
2. Crear perfil profesional
3. Agregar descripción, ubicación y precios
4. Configurar métodos de contacto
5. Subir fotos de trabajos (opcional)
6. Recibir contactos de clientes
7. Recibir reseñas y calificaciones

## 🔄 Próximas Funcionalidades

- [ ] Chat interno entre cliente y técnico
- [ ] Sistema de técnicos destacados (premium)
- [ ] Mapa interactivo con ubicación de técnicos
- [ ] Verificación de técnicos con documentación
- [ ] Filtros de "Disponible hoy" y "Urgencias"
- [ ] Sistema de pagos integrado
- [ ] Panel de administración web completo
- [ ] Notificaciones push en tiempo real
- [ ] Búsqueda por voz
- [ ] Modo oscuro

## � Notas de Autenticación y Perfiles

Para evitar el error `Database error saving new user` observado al registrar usuarios, se optó por **eliminar el trigger de creación automática de perfiles** y delegar la creación del perfil al código de la app mediante la función `ensureProfileForUser` en `AuthContext.tsx`.

### Razón del cambio
El trigger original intentaba insertar en `public.profiles` mientras Row Level Security estaba activo y la política de inserción requería `auth.uid() = id`. Durante la transacción de `auth.signUp`, ese contexto puede no existir (o no satisfacer la política), causando un 500 interno.

### Flujo actual
1. Usuario se registra (`auth.signUp`).
2. Si la cuenta requiere confirmación por correo, no hay sesión todavía.
3. Tras confirmar el email e iniciar sesión, el listener `onAuthStateChange` llama `ensureProfileForUser`.
4. La función intenta leer el perfil; si no existe, lo inserta con los metadatos (`full_name`, `role`).

### Migraciones involucradas
- `20251116123000_profiles_policies_and_trigger.sql`: versión original con trigger.
- `20251116140000_profiles_insert_trigger_policy.sql`: añadió una política adicional para inserción, pero el 500 persistió.
- Nueva migración (pendiente de crear/aplicar) eliminará el trigger y función para simplificar el flujo (ver carpeta `supabase/migrations`).

### Pasos para aplicar la solución
1. Ejecutar las migraciones nuevas con `supabase db push` o copiando el SQL en el editor de Supabase.
2. Verificar que ya no existe el trigger:
   ```sql
   select tgname from pg_trigger where tgname = 'on_auth_user_created';
   ```
   Debe devolver 0 filas.
3. Probar nuevamente el registro; no debería aparecer el error 500.

### Recomendaciones futuras
- Si se desea restaurar creación automática sin 500, crear una política de inserción más permisiva (ej. `WITH CHECK (true)`) y validar los datos del lado del servidor.
- Añadir test automatizado de signup (ver script `scripts/test-signup.mjs`).

## 🧪 Scripts de Prueba

Se añadió `scripts/test-signup.mjs` y el comando:
```bash
npm run signup:demo
```
Variables opcionales:
```bash
COUNT=3 ROLE=technician DOMAIN=midominio.com npm run signup:demo
```
Esto ayuda a verificar rápidamente el flujo de registro y correos de confirmación.

## �📄 Licencia

Este proyecto es privado y propiedad de OficiosYa.

## 🤝 Soporte

Para soporte técnico o consultas:
- Email: soporte@oficiosya.com
- WhatsApp: [Número de soporte]

---

**OficiosYa** - Conectando profesionales con quienes los necesitan 🔧
