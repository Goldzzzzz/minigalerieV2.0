import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Theme } from '@/constants/Theme';
import MonsterAvatar from './MonsterAvatar';
import { getMonsterColorFromEmoji, getMonsterColorFromHex } from '@/constants/MonsterMapping';

interface AlbumCardProps {
  name: string;
  icon: string;
  color: string;
  onPress: () => void;
  isSelected?: boolean;
  photoCount?: number;
}

export default function AlbumCard({
  name,
  icon,
  color,
  onPress,
  isSelected = false,
  photoCount = 0,
}: AlbumCardProps) {
  const monsterColor = getMonsterColorFromEmoji(icon) || getMonsterColorFromHex(color);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        { backgroundColor: color },
        isSelected && styles.selected,
        Theme.shadows.md,
      ]}>
      <View style={styles.iconContainer}>
        <MonsterAvatar
          color={monsterColor}
          size={56}
          animated={isSelected}
          showCamera={true}
        />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      {photoCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{photoCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 120,
    marginRight: Theme.spacing.md,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderWidth: 4,
    borderColor: Theme.colors.neutral.white,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.white,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.text.primary,
  },
});
