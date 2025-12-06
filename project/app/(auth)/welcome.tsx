import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/Colors';
import { Wrench } from 'lucide-react-native';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Wrench size={100} color={Colors.primary} strokeWidth={2.5} />
          <Text style={styles.logo}>OficiosYa</Text>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.welcomeTitle}>¡Bienvenido a Oficios Ya!</Text>
          <Text style={styles.welcomeText}>
            Encontrá en minutos al profesional ideal para lo que necesitás: Albañilería,
            Electricidad, Plomería y mucho más.
          </Text>
          <Text style={styles.welcomeSubtext}>
            Rápido, seguro y pensado para hacerte la vida más fácil.
          </Text>
          <Text style={styles.callToAction}>Empezá tu búsqueda y resolvé tus tareas hoy.</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Crear Perfil"
            onPress={() => router.push('/(auth)/register')}
            size="large"
            style={styles.button}
          />
          <Button
            title="Buscar Servicios"
            onPress={() => router.push('/(tabs)/search')}
            variant="outline"
            size="large"
            style={styles.button}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>¿Ya tenés tu perfil? Iniciá sesión</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 16,
    letterSpacing: 1,
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  welcomeSubtext: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  callToAction: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    gap: 14,
    paddingBottom: 20,
  },
  button: {
    width: '100%',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginLinkText: {
    fontSize: 15,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
