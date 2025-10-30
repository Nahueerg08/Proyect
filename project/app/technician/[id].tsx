import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { TechnicianProfile, Review } from '@/types/database';
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Heart,
  Star,
} from 'lucide-react-native';
import { StarRating } from '@/components/StarRating';
import { Button } from '@/components/Button';

export default function TechnicianDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [technician, setTechnician] = useState<TechnicianProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadTechnicianData();
  }, [id]);

  const loadTechnicianData = async () => {
    try {
      const [techResult, reviewsResult, favoriteResult] = await Promise.all([
        supabase
          .from('technician_profiles')
          .select('*, profile:profiles(*), category:categories(*)')
          .eq('id', id)
          .single(),
        supabase
          .from('reviews')
          .select('*, client:profiles(*)')
          .eq('technician_id', id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false }),
        user
          ? supabase
              .from('favorites')
              .select('id')
              .eq('client_id', user.id)
              .eq('technician_id', id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (techResult.data) setTechnician(techResult.data);
      if (reviewsResult.data) setReviews(reviewsResult.data);
      setIsFavorite(!!favoriteResult.data);
    } catch (error) {
      console.error('Error loading technician:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para guardar favoritos');
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('client_id', user.id)
          .eq('technician_id', id);
        setIsFavorite(false);
      } else {
        await supabase.from('favorites').insert({
          client_id: user.id,
          technician_id: id,
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleContact = async (type: string, value: string) => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para contactar técnicos');
      return;
    }

    await supabase.from('contact_logs').insert({
      client_id: user.id,
      technician_id: id as string,
      contact_type: type,
    });

    let url = '';
    switch (type) {
      case 'whatsapp':
        url = `whatsapp://send?phone=${value}&text=Hola, vi tu perfil en OficiosYa`;
        break;
      case 'phone':
        url = `tel:${value}`;
        break;
      case 'instagram':
        url = `instagram://user?username=${value}`;
        break;
      case 'facebook':
        url = `fb://profile/${value}`;
        break;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Error', 'No se pudo abrir la aplicación');
    }
  };

  const submitReview = async () => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para dejar una reseña');
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        technician_id: id,
        client_id: user.id,
        rating,
        comment,
      });

      if (error) throw error;

      Alert.alert('Reseña enviada', 'Tu reseña ha sido publicada');
      setShowReviewModal(false);
      setComment('');
      setRating(5);
      loadTechnicianData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar la reseña');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!technician) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Técnico no encontrado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          <Heart
            size={24}
            color={isFavorite ? Colors.error : Colors.text}
            fill={isFavorite ? Colors.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: technician.profile?.avatar_url || 'https://via.placeholder.com/120',
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{technician.profile?.full_name}</Text>
          <Text style={styles.category}>{technician.category?.name}</Text>
          <View style={styles.ratingContainer}>
            <StarRating rating={technician.average_rating || 0} size={24} />
            <Text style={styles.ratingText}>
              {technician.average_rating?.toFixed(1) || '0.0'} ({technician.total_reviews || 0}{' '}
              reseñas)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.description}>
            {technician.description || 'Sin descripción'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <View style={styles.locationRow}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.locationText}>{technician.location || 'Sin ubicación'}</Text>
          </View>
        </View>

        {technician.price_range && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rango de Precios</Text>
            <Text style={styles.priceText}>{technician.price_range}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          <View style={styles.contactButtons}>
            {technician.whatsapp && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('whatsapp', technician.whatsapp!)}
              >
                <MessageCircle size={24} color={Colors.white} />
                <Text style={styles.contactButtonText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            {technician.profile?.phone && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('phone', technician.profile!.phone!)}
              >
                <Phone size={24} color={Colors.white} />
                <Text style={styles.contactButtonText}>Llamar</Text>
              </TouchableOpacity>
            )}
            {technician.instagram && (
              <TouchableOpacity
                style={[styles.contactButton, styles.socialButton]}
                onPress={() => handleContact('instagram', technician.instagram!)}
              >
                <Instagram size={24} color={Colors.white} />
              </TouchableOpacity>
            )}
            {technician.facebook && (
              <TouchableOpacity
                style={[styles.contactButton, styles.socialButton]}
                onPress={() => handleContact('facebook', technician.facebook!)}
              >
                <Facebook size={24} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reseñas</Text>
            <Button
              title="Dejar Reseña"
              onPress={() => setShowReviewModal(true)}
              size="small"
            />
          </View>
          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>No hay reseñas todavía</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.client?.full_name}</Text>
                  <StarRating rating={review.rating} size={16} />
                </View>
                {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                <Text style={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dejar Reseña</Text>
            <View style={styles.ratingSelector}>
              <Text style={styles.ratingLabel}>Calificación:</Text>
              <StarRating rating={rating} size={32} interactive onRatingChange={setRating} />
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Escribe tu comentario (opcional)"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => setShowReviewModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Enviar"
                onPress={submitReview}
                loading={submittingReview}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  scroll: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: Colors.white,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundGray,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.white,
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
  },
  contactButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  socialButton: {
    paddingHorizontal: 16,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noReviews: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  reviewCard: {
    backgroundColor: Colors.backgroundGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingSelector: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  ratingLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
