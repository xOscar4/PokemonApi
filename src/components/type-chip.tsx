import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { GlassRadius } from '@/constants/glass';
import { POKEMON_TYPE_COLORS, POKEMON_TYPE_LABELS } from '@/constants/pokemon';

type TypeChipProps = {
  type: string;
};

export function TypeChip({ type }: TypeChipProps) {
  const color = POKEMON_TYPE_COLORS[type] ?? '#64748B';
  const label = POKEMON_TYPE_LABELS[type] ?? type;

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: `${color}33`, borderColor: `${color}AA` },
      ]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="label" color="#FFFFFF">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: GlassRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
