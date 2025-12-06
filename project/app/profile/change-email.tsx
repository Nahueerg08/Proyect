import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function ChangeEmailScreen() {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChangeEmail = async () => {
    setError('');

    if (!newEmail.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!validateEmail(newEmail)) {
      setError('El formato del email no es válido');
      return;
    }

    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      setError('El nuevo email debe ser diferente al actual');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) throw updateError;

      Alert.alert(
        'Verificación Requerida',
        'Se han enviado emails de confirmación a tu dirección actual y a la nueva. Por favor, verifica ambos para completar el cambio.',
        [
          {
            text: 'Entendido',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      setError(error.message || 'No se pudo cambiar el email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar Email</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.currentEmailBox}>
            <Mail size={20} color={Colors.textSecondary} />
            <View style={styles.currentEmailText}>
              <Text style={styles.currentEmailLabel}>Email actual</Text>
              <Text style={styles.currentEmailValue}>{user?.email}</Text>
            </View>
          </View>

          <Input
            label="Nuevo Email"
            placeholder="nuevo@email.com"
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={error}
          />

          <View style={styles.warningBox}>
            <AlertCircle size={20} color={Colors.warning} />
            <Text style={styles.warningText}>
              Recibirás emails de confirmación en ambas direcciones. Debes confirmar ambos para
              que el cambio sea efectivo.
            </Text>
          </View>
        </View>

        <Button
          title="Cambiar Email"
          onPress={handleChangeEmail}
          loading={loading}
          style={styles.changeButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backButton: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  currentEmailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
    marginBottom: 20,
    gap: 12,
  },
  currentEmailText: {
    flex: 1,
  },
  currentEmailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  currentEmailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    marginTop: 12,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  changeButton: {
    marginTop: 8,
  },
});
