import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

type StarRatingProps = {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
};

export function StarRating({ rating, size = 20, interactive = false, onRatingChange }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const handlePress = (star: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <View style={styles.container}>
      {stars.map((star) => {
        const isFilled = star <= rating;
        const StarComponent = interactive ? TouchableOpacity : View;

        return (
          <StarComponent
            key={star}
            onPress={() => handlePress(star)}
            style={styles.star}
            disabled={!interactive}
          >
            <Star
              size={size}
              color={Colors.rating}
              fill={isFilled ? Colors.rating : 'transparent'}
            />
          </StarComponent>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 4,
  },
});
