import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { Category, TechnicianProfile } from '@/types/database';
import { Search, MapPin, Star } from 'lucide-react-native';
import { StarRating } from '@/components/StarRating';

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredTechnicians, setFeaturedTechnicians] = useState<TechnicianProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesResult, techniciansResult] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('technician_profiles')
          .select('*, profile:profiles(*), category:categories(*)')
          .eq('is_approved', true)
          .order('average_rating', { ascending: false })
          .limit(10),
      ]);

      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (techniciansResult.data) setFeaturedTechnicians(techniciansResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/(tabs)/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/(tabs)/search?category=${item.id}`)}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>🔧</Text>
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderTechnician = ({ item }: { item: TechnicianProfile }) => (
    <TouchableOpacity
      style={styles.technicianCard}
      onPress={() => router.push(`/technician/${item.id}`)}
    >
      <Image
        source={{
          uri: item.profile?.avatar_url || 'https://via.placeholder.com/80',
        }}
        style={styles.technicianImage}
      />
      <View style={styles.technicianInfo}>
        <Text style={styles.technicianName} numberOfLines={1}>
          {item.profile?.full_name}
        </Text>
        <Text style={styles.technicianCategory} numberOfLines={1}>
          {item.category?.name}
        </Text>
        <View style={styles.technicianLocation}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location || 'Sin ubicación'}
          </Text>
        </View>
        <View style={styles.rating}>
          <StarRating rating={item.average_rating || 0} size={16} />
          <Text style={styles.ratingText}>
            {item.average_rating?.toFixed(1) || '0.0'} ({item.total_reviews || 0})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>OficiosYa</Text>
          <Text style={styles.subtitle}>Encuentra profesionales cerca de ti</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar servicios..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Destacados</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {featuredTechnicians.map((tech) => (
            <View key={tech.id}>{renderTechnician({ item: tech })}</View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scroll: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: 100,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconText: {
    fontSize: 30,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  technicianCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
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
});
