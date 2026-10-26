import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/app-text';
import { GlassColors, GlassRadius } from '@/constants/glass';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  accessibilityLabel,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? GlassColors.accentLight : '#FFFFFF'} />
      ) : (
        <View style={styles.content}>
          {icon}
          <AppText
            variant="button"
            color={variant === 'secondary' ? GlassColors.accentLight : '#FFFFFF'}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: GlassRadius.medium,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  md: {
    minHeight: 52,
  },
  sm: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: GlassRadius.small,
  },
  primary: {
    backgroundColor: '#6D28D9',
    borderColor: GlassColors.borderStrong,
    experimental_backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: GlassColors.border,
  },
  danger: {
    backgroundColor: 'rgba(251, 113, 133, 0.18)',
    borderColor: 'rgba(251, 113, 133, 0.45)',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.48,
  },
});
