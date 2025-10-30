# 📱 Cómo Usar OficiosYa en tu Dispositivo

## Opción 1: Usar en el Navegador Web (Más Fácil) 🌐

Si el servidor está corriendo, simplemente:

1. Abre tu navegador
2. Ve a: `http://localhost:8081`
3. La app se abrirá en tu navegador

Para ver en modo móvil:
- Chrome/Edge: Presiona `F12` → Click en el ícono de dispositivo móvil
- Firefox: Presiona `F12` → Click en "Diseño Adaptable"

## Opción 2: En tu Teléfono con Expo Go 📱

### Paso 1: Instala Expo Go
- **iPhone**: [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Play Store - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Paso 2: Inicia el Servidor
En la terminal, ejecuta:
```bash
npm run dev
```

### Paso 3: Conecta tu Dispositivo

**Método A: Presiona 'w' en la terminal**
- Se abrirá una página web con el QR code
- Escanea el QR con Expo Go

**Método B: Conexión Manual**
1. Asegúrate que tu teléfono y computadora estén en la misma red WiFi
2. En la terminal busca la línea que dice algo como:
   ```
   exp://192.168.x.x:8081
   ```
3. Abre Expo Go en tu teléfono
4. Toca "Enter URL manually"
5. Ingresa la URL `exp://` que viste en la terminal

**Método C: Usando Túnel (Si los anteriores no funcionan)**
1. Detén el servidor (Ctrl+C)
2. Ejecuta:
   ```bash
   npx expo start --tunnel
   ```
3. Espera a que genere la URL y el QR
4. Escanea el QR con Expo Go

## Opción 3: En un Emulador/Simulador 🖥️

### Android Emulator:
1. Instala Android Studio
2. Configura un dispositivo virtual (AVD)
3. Con el servidor corriendo, presiona `a` en la terminal

### iOS Simulator (Solo Mac):
1. Instala Xcode
2. Con el servidor corriendo, presiona `i` en la terminal

## 🔧 Solución de Problemas

### "No puedo ver el QR"
- Presiona `w` en la terminal para abrir el QR en el navegador
- O usa conexión manual con la URL `exp://`

### "No se puede conectar"
1. Verifica que ambos dispositivos estén en la misma red WiFi
2. Desactiva temporalmente firewall/antivirus
3. Usa el modo `--tunnel`: `npx expo start --tunnel`

### "Errores de versión de paquetes"
Ejecuta:
```bash
npx expo install --fix
```

## 🎯 Primeros Pasos en la App

1. **Crear Cuenta**:
   - Abre la app
   - Toca "Registrarse"
   - Elige si eres "Cliente" o "Técnico"
   - Completa el formulario

2. **Como Cliente**:
   - Explora categorías en la pantalla de inicio
   - Busca técnicos
   - Ve perfiles y reseñas
   - Guarda favoritos

3. **Como Técnico**:
   - Ve a tu perfil
   - Toca "Crear Perfil de Técnico"
   - Completa tu información profesional
   - Empieza a recibir contactos

## 📞 Soporte

Si tienes problemas, verifica:
- ✅ Node.js está instalado
- ✅ Las dependencias están instaladas (`npm install`)
- ✅ El servidor está corriendo (`npm run dev`)
- ✅ Tu dispositivo y PC están en la misma red WiFi

---

**¡Disfruta usando OficiosYa!** 🔧🏠
