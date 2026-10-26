import {
  TabList,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
  Tabs,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { GlassColors, GlassRadius } from '@/constants/glass';

export default function AppTabs() {
  return (
    <Tabs style={styles.tabs}>
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>Pokédex</TabButton>
          </TabTrigger>
          <TabTrigger name="collection" href="/collection" asChild>
            <TabButton>Colección</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>

      <TabSlot style={styles.slot} />
    </Tabs>
  );
}

export function TabButton({
  children,
  isFocused,
  ref: _ref,
  ...props
}: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View style={[styles.tabButton, isFocused && styles.tabButtonActive]}>
        <AppText
          variant="label"
          color={isFocused ? GlassColors.text : GlassColors.textMuted}>
          {children}
        </AppText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>
        <AppText variant="bodyStrong" color={GlassColors.accentLight} style={styles.brandText}>
          PokéGlass
        </AppText>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
  tabListContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 760,
    padding: 6,
    borderRadius: GlassRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GlassColors.card,
    borderWidth: 1,
    borderColor: GlassColors.border,
  },
  brandText: {
    marginRight: 'auto',
    marginLeft: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: GlassRadius.pill,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.30)',
    borderWidth: 1,
    borderColor: GlassColors.borderStrong,
  },
});
