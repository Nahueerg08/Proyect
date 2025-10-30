import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { TechnicianProfile, Category } from '@/types/database';
import { Search as SearchIcon, MapPin, SlidersHorizontal } from 'lucide-react-native';
import { StarRating } from '@/components/StarRating';

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    (params.category as string) || null
  );

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    searchTechnicians();
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const searchTechnicians = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('technician_profiles')
        .select('*, profile:profiles(*), category:categories(*)')
        .eq('is_approved', true);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(
          `description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
        );
      }

      const { data } = await query.order('average_rating', { ascending: false });
      if (data) setTechnicians(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
        onPress={() => setSelectedCategory(isSelected ? null : item.id)}
      >
        <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTechnician = ({ item }: { item: TechnicianProfile }) => (
    <TouchableOpacity
      style={styles.technicianCard}
      onPress={() => router.push(`/technician/${item.id}`)}
    >
      <Image
        source={{
          uri: item.profile?.avatar_url || 'https://via.placeholder.com/100',
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
        {item.price_range && (
          <Text style={styles.priceRange}>{item.price_range}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <SearchIcon size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={technicians}
          renderItem={renderTechnician}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.techniciansList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron técnicos</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
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
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  techniciansList: {
    padding: 16,
  },
  technicianCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  technicianImage: {
    width: 100,
    height: 100,
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
  priceRange: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
