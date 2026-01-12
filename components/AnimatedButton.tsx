import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Theme } from '@/constants/Theme';

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  icon?: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function AnimatedButton({
  onPress,
  title,
  icon,
  backgroundColor = Theme.colors.primary.main,
  style,
  textStyle,
  disabled = false,
}: AnimatedButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor },
        Theme.shadows.md,
        style,
        disabled && styles.disabled,
      ]}>
      {icon && icon}
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
  },
  text: {
    color: Theme.colors.neutral.white,
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.bold as any,
  },
  disabled: {
    opacity: 0.5,
  },
});
