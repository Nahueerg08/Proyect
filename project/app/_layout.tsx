import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Manejar deep links para confirmación de email
    const handleDeepLink = async (url: string) => {
      if (url) {
        console.log('Deep link recibido:', url);
        
        // Extraer los parámetros de la URL de manera más robusta
        let params: Record<string, string> = {};
        
        try {
          // Para web, usar URLSearchParams
          if (typeof window !== 'undefined' && url.includes('?')) {
            const urlObj = new URL(url);
            urlObj.searchParams.forEach((value, key) => {
              params[key] = value;
            });
          } else {
            // Para móvil, usar Linking.parse
            const parsedUrl = Linking.parse(url);
            params = parsedUrl.queryParams as Record<string, string>;
          }
          
          console.log('Parámetros extraídos:', params);

          // Verificar si tenemos los tokens necesarios
          if (params.access_token && params.refresh_token) {
            console.log('Tokens encontrados, estableciendo sesión...');
            const { error } = await supabase.auth.setSession({
              access_token: params.access_token,
              refresh_token: params.refresh_token,
            });
            
            if (error) {
              console.error('Error al confirmar el email:', error);
            } else {
              console.log('✅ Email confirmado exitosamente');
            }
          } else {
            console.log('No se encontraron tokens en la URL');
          }
        } catch (e) {
          console.error('Error parseando URL:', e);
        }
      }
    };

    // Listener para nuevos deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Verificar si la app se abrió con un deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
