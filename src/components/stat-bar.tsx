import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { GlassColors } from '@/constants/glass';
import { STAT_BAR_MAX, STAT_LABELS } from '@/constants/pokemon';

type StatBarProps = {
  name: string;
  value: number;
};

export function StatBar({ name, value }: StatBarProps) {
  const label = STAT_LABELS[name] ?? name;
  const percent = Math.max(4, Math.min(100, Math.round((value / STAT_BAR_MAX) * 100)));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText variant="caption" color={GlassColors.textSoft}>
          {label}
        </AppText>
        <AppText variant="caption" color={GlassColors.text}>
          {value}
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: GlassColors.accentLight,
    experimental_backgroundImage: 'linear-gradient(90deg, #38BDF8 0%, #A78BFA 100%)',
  },
});
