import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { ArrowLeft, Instagram, Facebook, MessageCircle, Link as LinkIcon } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function SocialLinksScreen() {
  const { profile } = useAuth();
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('technician_profiles')
        .select('whatsapp, instagram, facebook')
        .eq('id', profile!.id)
        .single();

      if (error) throw error;

      if (data) {
        setWhatsapp(data.whatsapp || '');
        setInstagram(data.instagram || '');
        setFacebook(data.facebook || '');
      }
    } catch (error: any) {
      console.error('Error loading social links:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('technician_profiles')
        .update({
          whatsapp: whatsapp.trim() || null,
          instagram: instagram.trim() || null,
          facebook: facebook.trim() || null,
        })
        .eq('id', profile!.id);

      if (error) throw error;

      Alert.alert('Enlaces Guardados', 'Tus redes sociales han sido actualizadas', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron guardar los enlaces');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redes Sociales</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <LinkIcon size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Vincula tus redes sociales para que los clientes puedan contactarte fácilmente
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.inputWithIcon}>
            <MessageCircle size={20} color="#25D366" />
            <View style={styles.inputContainer}>
              <Input
                label="WhatsApp"
                placeholder="+54 11 1234-5678"
                value={whatsapp}
                onChangeText={setWhatsapp}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputWithIcon}>
            <Instagram size={20} color="#E4405F" />
            <View style={styles.inputContainer}>
              <Input
                label="Instagram"
                placeholder="@usuario"
                value={instagram}
                onChangeText={setInstagram}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputWithIcon}>
            <Facebook size={20} color="#1877F2" />
            <View style={styles.inputContainer}>
              <Input
                label="Facebook"
                placeholder="Nombre de perfil o URL"
                value={facebook}
                onChangeText={setFacebook}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <View style={styles.helperBox}>
          <Text style={styles.helperTitle}>Consejos:</Text>
          <Text style={styles.helperText}>• WhatsApp: Incluye código de país (+54)</Text>
          <Text style={styles.helperText}>• Instagram: Solo el nombre de usuario (@ejemplo)</Text>
          <Text style={styles.helperText}>• Facebook: Puedes poner tu nombre o el link completo</Text>
        </View>

        <Button
          title="Guardar Enlaces"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  section: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
    paddingTop: 8,
  },
  inputContainer: {
    flex: 1,
  },
  helperBox: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  helperTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  saveButton: {
    marginTop: 8,
  },
});
