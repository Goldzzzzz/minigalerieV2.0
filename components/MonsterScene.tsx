import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MonsterAvatar, { MonsterColor } from './MonsterAvatar';
import { Theme } from '@/constants/Theme';

interface MonsterSceneProps {
  monsters?: MonsterColor[];
  animated?: boolean;
}

const { width } = Dimensions.get('window');

export default function MonsterScene({
  monsters = ['violet', 'rose', 'mint'],
  animated = true,
}: MonsterSceneProps) {
  return (
    <View style={styles.container}>
      {monsters.map((color, index) => {
        return (
          <View
            key={`${color}-${index}`}
            style={[
              styles.monsterWrapper,
              {
                left: (width / (monsters.length + 1)) * (index + 1) - 40,
                zIndex: monsters.length - index,
              },
            ]}>
            <MonsterAvatar
              color={color}
              size={80}
              animated={false}
              showCamera={true}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    position: 'relative',
    justifyContent: 'center',
    marginVertical: Theme.spacing.lg,
  },
  monsterWrapper: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
});
