import { StyleSheet, View, type ViewProps } from 'react-native';

import { GlassColors, GlassRadius, GlassShadow } from '@/constants/glass';

export function GlassCard({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GlassColors.card,
    borderColor: GlassColors.border,
    borderWidth: 1,
    borderRadius: GlassRadius.large,
    padding: 16,
    ...GlassShadow,
  },
});
