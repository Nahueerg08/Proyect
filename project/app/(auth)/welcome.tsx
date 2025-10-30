import { View, Text, StyleSheet, Image } from 'react-native';
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
          <Wrench size={80} color={Colors.primary} />
          <Text style={styles.logo}>OficiosYa</Text>
          <Text style={styles.tagline}>
            Conecta con profesionales de confianza
          </Text>
        </View>

        <View style={styles.features}>
          <Text style={styles.featureText}>✓ Encuentra técnicos cerca de ti</Text>
          <Text style={styles.featureText}>✓ Lee reseñas de otros usuarios</Text>
          <Text style={styles.featureText}>✓ Contacta directamente por WhatsApp</Text>
          <Text style={styles.featureText}>✓ Compara precios y servicios</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Iniciar Sesión"
            onPress={() => router.push('/(auth)/login')}
            size="large"
            style={styles.button}
          />
          <Button
            title="Registrarse"
            onPress={() => router.push('/(auth)/register')}
            variant="outline"
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 16,
  },
  tagline: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  features: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
