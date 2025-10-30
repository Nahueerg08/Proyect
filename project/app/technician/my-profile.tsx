import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { TechnicianProfile } from '@/types/database';
import { ArrowLeft, Edit, Eye } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { StarRating } from '@/components/StarRating';

export default function MyTechnicianProfileScreen() {
  const { user, profile } = useAuth();
  const [techProfile, setTechProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('technician_profiles')
        .select('*, profile:profiles(*), category:categories(*)')
        .eq('id', user!.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setTechProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!techProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil Profesional</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No tienes un perfil profesional</Text>
          <Text style={styles.emptyText}>
            Crea tu perfil para que los clientes puedan encontrarte
          </Text>
          <Button
            title="Crear Perfil"
            onPress={() => router.push('/technician/create')}
            style={styles.createButton}
          />
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
        <Text style={styles.headerTitle}>Mi Perfil Profesional</Text>
        <TouchableOpacity
          onPress={() => router.push('/technician/edit')}
          style={styles.editButton}
        >
          <Edit size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{techProfile.average_rating?.toFixed(1) || '0.0'}</Text>
            <StarRating rating={techProfile.average_rating || 0} size={20} />
            <Text style={styles.statLabel}>Calificación</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{techProfile.total_reviews || 0}</Text>
            <Text style={styles.statLabel}>Reseñas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Categoría:</Text>
            <Text style={styles.infoValue}>{techProfile.category?.name || 'No especificada'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ubicación:</Text>
            <Text style={styles.infoValue}>{techProfile.location || 'No especificada'}</Text>
          </View>
          {techProfile.price_range && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Precio:</Text>
              <Text style={styles.infoValue}>{techProfile.price_range}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {techProfile.description || 'Sin descripción'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          {techProfile.whatsapp && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>WhatsApp:</Text>
              <Text style={styles.infoValue}>{techProfile.whatsapp}</Text>
            </View>
          )}
          {techProfile.instagram && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Instagram:</Text>
              <Text style={styles.infoValue}>{techProfile.instagram}</Text>
            </View>
          )}
          {techProfile.facebook && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Facebook:</Text>
              <Text style={styles.infoValue}>{techProfile.facebook}</Text>
            </View>
          )}
        </View>

        <Button
          title="Ver Perfil Público"
          onPress={() => router.push(`/technician/${techProfile.id}`)}
          variant="outline"
          style={styles.viewButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  editButton: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 24,
    margin: 16,
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  section: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  viewButton: {
    margin: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    minWidth: 200,
  },
});
