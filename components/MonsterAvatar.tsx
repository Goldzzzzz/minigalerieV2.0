import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';
import { getMonsterImage, hasMonsterImage } from '@/constants/MonsterAssets';

export type MonsterColor = 'violet' | 'rose' | 'mint' | 'coral' | 'yellow' | 'sky';
export type MonsterPose = 'neutral' | 'action' | 'celebration';

interface MonsterAvatarProps {
  color: MonsterColor;
  pose?: MonsterPose;
  size?: number;
  animated?: boolean;
  style?: ViewStyle;
  showCamera?: boolean;
}

const MONSTER_COLORS: Record<MonsterColor, string> = {
  violet: Theme.colors.primary.main,
  rose: Theme.colors.secondary.main,
  mint: Theme.colors.accent.mint,
  coral: Theme.colors.accent.coral,
  yellow: Theme.colors.accent.yellow,
  sky: Theme.colors.accent.sky,
};

export default function MonsterAvatar({
  color,
  pose = 'neutral',
  size = 80,
  animated = false,
  style,
  showCamera = true,
}: MonsterAvatarProps) {
  const monsterImage = getMonsterImage(color);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: MONSTER_COLORS[color] + '20',
        },
        style,
      ]}>
      <Image
        source={monsterImage}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
