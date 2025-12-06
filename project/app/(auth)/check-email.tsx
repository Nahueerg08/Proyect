import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';

export default function CheckEmailScreen() {
  const params = useLocalSearchParams();
  const initialEmail = typeof params.email === 'string' ? params.email : '';
  const [email, setEmail] = useState(initialEmail);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const canResend = email.trim().length > 3 && /\S+@\S+\.\S+/.test(email.trim());

  const handleResend = async () => {
    if (!canResend) return;
    setResendLoading(true);
    setResendError(null);
    setResendSuccess(false);
    try {
      // Supabase v2: resend confirmation email
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
      if (error) {
        setResendError(error.message || 'No se pudo reenviar el correo.');
      } else {
        setResendSuccess(true);
      }
    } catch (e: any) {
      setResendError(e.message || 'Error inesperado reenviando correo.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Confirma tu correo</Text>
        <Text style={styles.paragraph}>
          Te enviamos un correo de verificación. Abre el email y toca el enlace para activar tu cuenta.
          Una vez confirmada podrás iniciar sesión.
        </Text>
        <Text style={styles.paragraphSmall}>Ingresa tu correo si deseas reenviar el enlace de verificación.</Text>

        <Input
          label="Email"
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {resendError && <Text style={styles.error}>{resendError}</Text>}
        {resendSuccess && <Text style={styles.success}>Correo reenviado. Revisa tu bandeja.</Text>}
        <Button
          title={resendLoading ? 'Enviando…' : 'Reenviar correo'}
          onPress={handleResend}
          disabled={!canResend || resendLoading}
          style={styles.button}
        />
        <Button
          title="Ir a Iniciar Sesión"
          onPress={() => router.replace('/(auth)/login')}
          style={styles.button}
        />
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 22,
  },
  paragraphSmall: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
  },
  error: {
    marginTop: 8,
    color: Colors.error,
    fontSize: 14,
  },
  success: {
    marginTop: 8,
    color: Colors.success,
    fontSize: 14,
  },
});
