import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { GlassCard } from '@/components/glass-card';
import { PokemonImage } from '@/components/pokemon-image';
import { GlassColors } from '@/constants/glass';
import type { PokemonListItem } from '@/types/pokemon';
import { formatPokemonId, formatPokemonName } from '@/utils/format';

type PokemonCardProps = {
  pokemon: PokemonListItem;
  onPress: () => void;
};

export function PokemonCard({ pokemon, onPress }: PokemonCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${formatPokemonName(pokemon.name)}`}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}>
      <GlassCard style={styles.card}>
        <View style={styles.imageWrapper}>
          <PokemonImage
            uri={pokemon.imageUrl}
            fallbackUri={pokemon.fallbackImageUrl}
            size={64}
          />
        </View>
        <View style={styles.info}>
          <AppText variant="caption" color={GlassColors.accentLight}>
            {formatPokemonId(pokemon.id)}
          </AppText>
          <AppText variant="subtitle" numberOfLines={1}>
            {formatPokemonName(pokemon.name)}
          </AppText>
          <AppText variant="caption" color={GlassColors.textMuted}>
            Ver tipos y estadísticas
          </AppText>
        </View>
        <AppText variant="title" color={GlassColors.textMuted}>
          ›
        </AppText>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.82,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  imageWrapper: {
    width: 78,
    height: 78,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: GlassColors.border,
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
