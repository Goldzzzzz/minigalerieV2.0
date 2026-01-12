import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View, Text } from 'react-native';
import { Trash2, Star } from 'lucide-react-native';
import { Theme } from '@/constants/Theme';

interface PhotoCardProps {
  uri: string;
  onDelete: () => void;
  onRate?: () => void;
  rating?: { rating: number; rating_scale: number };
  showRating?: boolean;
}

export default function PhotoCard({
  uri,
  onDelete,
  onRate,
  rating,
  showRating = false,
}: PhotoCardProps) {
  return (
    <View style={[styles.container, Theme.shadows.sm]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.imageContainer}>
        <Image source={{ uri }} style={styles.image} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Trash2 size={16} color={Theme.colors.neutral.white} />
      </TouchableOpacity>

      {showRating && onRate && (
        <TouchableOpacity style={styles.ratingButton} onPress={onRate}>
          <Star
            size={16}
            color={Theme.colors.neutral.white}
            fill={rating ? Theme.colors.accent.yellow : 'transparent'}
          />
        </TouchableOpacity>
      )}

      {rating && (
        <View style={styles.ratingBadge}>
          <Star size={12} color={Theme.colors.accent.yellow} fill={Theme.colors.accent.yellow} />
          <Text style={styles.ratingText}>
            {rating.rating}/{rating.rating_scale}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Theme.colors.neutral.surface,
    marginBottom: Theme.spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Theme.colors.error,
    borderRadius: Theme.borderRadius.sm,
    padding: 8,
  },
  ratingButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Theme.colors.primary.main,
    borderRadius: Theme.borderRadius.sm,
    padding: 8,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.sm,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.text.primary,
  },
});
