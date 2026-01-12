import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getMonsterImage } from '@/constants/MonsterAssets';
import { MonsterColor } from './MonsterAvatar';

interface MonsterIconProps {
  colors: MonsterColor[];
  size?: number;
}

export default function MonsterIcon({ colors, size = 48 }: MonsterIconProps) {
  if (colors.length === 1) {
    return (
      <Image
        source={getMonsterImage(colors[0])}
        style={[styles.icon, { width: size, height: size }]}
        resizeMode="contain"
      />
    );
  }

  const iconSize = size * 0.7;
  const overlap = iconSize * 0.3;

  return (
    <View style={[styles.iconGroup, { width: size + overlap, height: size }]}>
      {colors.map((color, index) => (
        <Image
          key={color}
          source={getMonsterImage(color)}
          style={[
            styles.groupedIcon,
            {
              width: iconSize,
              height: iconSize,
              left: index * overlap,
              zIndex: colors.length - index,
            },
          ]}
          resizeMode="contain"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
  },
  iconGroup: {
    position: 'relative',
    alignSelf: 'center',
  },
  groupedIcon: {
    position: 'absolute',
    top: 0,
  },
});
