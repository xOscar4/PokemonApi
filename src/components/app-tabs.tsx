import { NativeTabs } from 'expo-router/native-tabs';

import { GlassColors } from '@/constants/glass';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="rgba(8, 13, 32, 0.96)"
      tintColor={GlassColors.accentLight}
      iconColor={{ default: GlassColors.textMuted, selected: GlassColors.accentLight }}
      labelStyle={{
        default: { color: GlassColors.textMuted },
        selected: { color: GlassColors.text },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Pokédex</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          md="grid_view"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="collection">
        <NativeTabs.Trigger.Label>Colección</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'star', selected: 'star.fill' }}
          md="star"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
