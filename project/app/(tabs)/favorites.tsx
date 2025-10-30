import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { Favorite } from '@/types/database';
import { MapPin, Heart } from 'lucide-react-native';
import { StarRating } from '@/components/StarRating';

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select(`
          *,
          technician:technician_profiles(
            *,
            profile:profiles(*),
            category:categories(*)
          )
        `)
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false });

      if (data) setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      await supabase.from('favorites').delete().eq('id', favoriteId);
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const renderFavorite = ({ item }: { item: Favorite }) => {
    const technician = item.technician;
    if (!technician) return null;

    return (
      <View style={styles.favoriteCard}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => router.push(`/technician/${technician.id}`)}
        >
          <Image
            source={{
              uri: technician.profile?.avatar_url || 'https://via.placeholder.com/80',
            }}
            style={styles.technicianImage}
          />
          <View style={styles.technicianInfo}>
            <Text style={styles.technicianName} numberOfLines={1}>
              {technician.profile?.full_name}
            </Text>
            <Text style={styles.technicianCategory} numberOfLines={1}>
              {technician.category?.name}
            </Text>
            <View style={styles.technicianLocation}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {technician.location || 'Sin ubicación'}
              </Text>
            </View>
            <View style={styles.rating}>
              <StarRating rating={technician.average_rating || 0} size={16} />
              <Text style={styles.ratingText}>
                {technician.average_rating?.toFixed(1) || '0.0'} ({technician.total_reviews || 0})
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFavorite(item.id)}
        >
          <Heart size={24} color={Colors.error} fill={Colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Favoritos</Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No tienes favoritos</Text>
            <Text style={styles.emptyText}>
              Guarda técnicos para acceder a ellos rápidamente
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  list: {
    padding: 16,
  },
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
  },
  technicianImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.backgroundGray,
  },
  technicianInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  technicianName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  technicianCategory: {
    fontSize: 14,
    color: Colors.primary,
  },
  technicianLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
