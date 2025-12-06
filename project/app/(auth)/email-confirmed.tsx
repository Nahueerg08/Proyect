import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/Button';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function EmailConfirmedScreen() {
  const { user, loading } = useAuth();
  const params = useLocalSearchParams();
  const [confirming, setConfirming] = useState(true);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    // Intentar procesar los tokens de confirmación si están en los parámetros
    const processConfirmation = async () => {
      try {
        // En web, también verificar window.location.hash (Supabase puede poner tokens ahí)
        if (typeof window !== 'undefined') {
          console.log('🔍 URL completa:', window.location.href);
          console.log('🔍 Hash:', window.location.hash);
          
          if (window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            const type = hashParams.get('type');

            console.log('🔍 Tipo de evento:', type);
            console.log('🔍 Access token presente:', !!accessToken);
            console.log('🔍 Refresh token presente:', !!refreshToken);

            if (accessToken && refreshToken) {
              console.log('✅ Tokens encontrados en hash, estableciendo sesión...');
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (error) {
                console.error('❌ Error al establecer sesión:', error);
                setConfirmError(error.message);
              } else {
                console.log('✅ Sesión establecida correctamente:', data);
              }
            } else {
              console.warn('⚠️ No se encontraron tokens en el hash');
            }
          } else {
            console.warn('⚠️ No hay hash en la URL');
          }
        }

        // También verificar query params (para deep links móviles)
        if (params.access_token && params.refresh_token) {
          console.log('✅ Tokens encontrados en params, estableciendo sesión...');
          const { data, error } = await supabase.auth.setSession({
            access_token: params.access_token as string,
            refresh_token: params.refresh_token as string,
          });

          if (error) {
            console.error('❌ Error al establecer sesión:', error);
            setConfirmError(error.message);
          } else {
            console.log('✅ Sesión establecida correctamente:', data);
          }
        } else {
          console.log('🔍 Params:', params);
        }
      } catch (e: any) {
        console.error('❌ Error procesando confirmación:', e);
        setConfirmError(e.message);
      } finally {
        setConfirming(false);
      }
    };

    processConfirmation();
  }, [params]);

  useEffect(() => {
    // Si ya hay un usuario autenticado, redirigir al home después de un momento
    if (user && !loading && !confirming) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, confirming]);

  if (confirming) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Confirmando...</Text>
          <Text style={styles.paragraph}>
            Estamos verificando tu correo electrónico...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{confirmError ? '❌' : '✅'}</Text>
        </View>
        
        <Text style={styles.title}>
          {confirmError ? 'Error al Confirmar' : '¡Email Confirmado!'}
        </Text>
        
        <Text style={styles.paragraph}>
          {confirmError 
            ? `Hubo un problema al confirmar tu email: ${confirmError}`
            : 'Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión con tu email y contraseña.'
          }
        </Text>

        {confirmError ? (
          <Button
            title="Volver a Intentar"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.button}
          />
        ) : (
          <>
            <Button
              title="Ir a Inicio"
              onPress={() => router.replace('/(tabs)/home')}
              style={styles.button}
            />
            
            <Button
              title="Iniciar Sesión"
              onPress={() => router.replace('/(auth)/login')}
              variant="outline"
              style={styles.button}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    width: '100%',
  },
});
