import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { GlassColors } from '@/constants/glass';

export function ScreenBackground({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.gradient]} />
      <View pointerEvents="none" style={[styles.orb, styles.orbPurple]} />
      <View pointerEvents="none" style={[styles.orb, styles.orbBlue]} />
      <View pointerEvents="none" style={[styles.orb, styles.orbPink]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GlassColors.background,
  },
  gradient: {
    experimental_backgroundImage:
      'linear-gradient(155deg, #070B1A 0%, #191340 46%, #0A263D 100%)',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPurple: {
    width: 260,
    height: 260,
    top: -80,
    right: -90,
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
  },
  orbBlue: {
    width: 220,
    height: 220,
    top: '38%',
    left: -110,
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
  },
  orbPink: {
    width: 190,
    height: 190,
    bottom: -70,
    right: -50,
    backgroundColor: 'rgba(236, 72, 153, 0.10)',
  },
});
