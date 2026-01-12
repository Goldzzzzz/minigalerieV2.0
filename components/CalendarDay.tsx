import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { Theme } from '@/constants/Theme';

interface CalendarDayProps {
  day: number | null;
  rating?: number;
  isToday?: boolean;
  isFuture?: boolean;
  onPress?: () => void;
}

export default function CalendarDay({ day, rating, isToday, isFuture, onPress }: CalendarDayProps) {
  if (day === null) {
    return <View style={styles.emptyDay} />;
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 5:
        return '#4ECDC4';
      case 4:
        return '#95E1D3';
      case 3:
        return '#FFD93D';
      case 2:
        return '#FFB347';
      case 1:
        return '#FF6B6B';
      default:
        return Theme.colors.neutral.border;
    }
  };

  const containerStyle = [
    styles.day,
    isToday && styles.today,
    isFuture && styles.futureDay,
    rating && { borderColor: getRatingColor(rating), borderWidth: 3 },
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isFuture}
      activeOpacity={0.7}>
      <Text style={[styles.dayNumber, isToday && styles.todayText, isFuture && styles.futureText]}>
        {day}
      </Text>
      {rating && (
        <View style={styles.ratingContainer}>
          {[...Array(rating)].map((_, index) => (
            <Star
              key={index}
              size={8}
              color={getRatingColor(rating)}
              fill={getRatingColor(rating)}
              strokeWidth={0}
            />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  day: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0.5%',
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.neutral.white,
    borderWidth: 1,
    borderColor: Theme.colors.neutral.border,
    ...Theme.shadows.sm,
  },
  emptyDay: {
    width: '13%',
    aspectRatio: 1,
    margin: '0.5%',
  },
  today: {
    backgroundColor: Theme.colors.primary.pastel,
    borderColor: Theme.colors.primary.main,
    borderWidth: 2,
  },
  futureDay: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    color: Theme.colors.neutral.text.primary,
  },
  todayText: {
    color: Theme.colors.primary.main,
    fontWeight: Theme.typography.fontWeights.bold as any,
  },
  futureText: {
    color: Theme.colors.neutral.text.secondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
});
