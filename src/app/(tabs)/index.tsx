import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/api/http';
import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { PokemonCard } from '@/components/pokemon-card';
import { ScreenBackground } from '@/components/screen-background';
import { SearchBar } from '@/components/search-bar';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
  PendingSyncBanner,
} from '@/components/status-views';
import { GlassColors, GlassRadius } from '@/constants/glass';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { usePendingSavedPokemonChanges } from '@/hooks/use-pending-mutations';
import { usePokemonIndex } from '@/hooks/use-pokemon';
import type { PokemonListItem } from '@/types/pokemon';
import { formatPokemonName } from '@/utils/format';

const PAGE_SIZE = 24;

export default function PokedexScreen() {
  const query = usePokemonIndex();
  const pending = usePendingSavedPokemonChanges();
  const isOnline = useOnlineStatus();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState({ query: '', count: PAGE_SIZE });

  const normalizedSearch = search.trim().toLowerCase();

  const filteredPokemon = useMemo(() => {
    const data = query.data ?? [];
    if (!normalizedSearch) return data;

    return data.filter((pokemon) => {
      const name = pokemon.name.toLowerCase();
      const formatted = formatPokemonName(pokemon.name).toLowerCase();
      return name.includes(normalizedSearch) || formatted.includes(normalizedSearch);
    });
  }, [normalizedSearch, query.data]);

  // Al cambiar la búsqueda se vuelve a la primera página sin usar un efecto.
  const visibleCount = page.query === normalizedSearch ? page.count : PAGE_SIZE;
  const visiblePokemon = filteredPokemon.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPokemon.length;

  const loadMore = () => {
    setPage({ query: normalizedSearch, count: visibleCount + PAGE_SIZE });
  };

  const openDetail = (pokemon: PokemonListItem) => {
    router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } });
  };

  const emptyComponent =
    !isOnline && !query.data ? (
      <ErrorState
        message="No hay conexión y todavía no existe una lista guardada en este dispositivo. Conéctate a Internet y reintenta."
        onRetry={() => {
          void query.refetch();
        }}
      />
    ) : query.isLoading ? (
      <LoadingState message="Consultando la Pokédex..." />
    ) : query.isError ? (
      <ErrorState
        message={getErrorMessage(query.error, 'No se pudo consultar PokéAPI.')}
        onRetry={() => {
          void query.refetch();
        }}
      />
    ) : (
      <EmptyState
        title="Sin resultados"
        message={`No encontramos Pokémon que coincidan con “${search.trim()}”.`}
      />
    );

  return (
    <ScreenBackground>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <FlatList
          data={visiblePokemon}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PokemonCard pokemon={item} onPress={() => openDetail(item)} />
          )}
          style={styles.list}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => {
                void query.refetch();
              }}
              tintColor={GlassColors.accentLight}
              colors={[GlassColors.accent]}
              progressBackgroundColor={GlassColors.backgroundMid}
            />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.kickerRow}>
                <View style={styles.kickerDot} />
                <AppText variant="label" color={GlassColors.accentLight}>
                  POKÉDEX NACIONAL
                </AppText>
                {!isOnline ? (
                  <View style={styles.offlineBadge}>
                    <AppText variant="caption" color={GlassColors.warning}>
                      Sin conexión
                    </AppText>
                  </View>
                ) : null}
              </View>

              <AppText variant="display">Descubre Pokémon</AppText>
              <AppText color={GlassColors.textMuted}>
                Explora la Pokédex, abre cada ficha y guarda tus favoritos en una colección
                personal.
              </AppText>

              <SearchBar value={search} onChangeText={setSearch} />

              <View style={styles.countRow}>
                <AppText variant="caption" color={GlassColors.textMuted}>
                  {query.data
                    ? `${filteredPokemon.length} Pokémon${
                        normalizedSearch ? ' encontrados' : ' disponibles'
                      }`
                    : 'Consultando PokéAPI...'}
                </AppText>
                {query.isFetching && query.data ? (
                  <View style={styles.updatingRow}>
                    <ActivityIndicator size="small" color={GlassColors.accentLight} />
                    <AppText variant="caption" color={GlassColors.textMuted}>
                      Actualizando
                    </AppText>
                  </View>
                ) : null}
              </View>

              {!isOnline ? (
                <Notice
                  tone="warning"
                  message="Estás sin conexión. Se muestran los datos guardados en caché; las acciones se enviarán al reconectar."
                />
              ) : null}

              <PendingSyncBanner total={pending.total} pausedCount={pending.pausedCount} />

              {query.isError && query.data ? (
                <Notice
                  tone="error"
                  title="No se pudo actualizar la Pokédex"
                  message={getErrorMessage(query.error, 'Se muestran los datos guardados.')}
                  actionLabel="Reintentar"
                  onAction={() => {
                    void query.refetch();
                  }}
                />
              ) : null}
            </View>
          }
          ListEmptyComponent={emptyComponent}
          ListFooterComponent={
            filteredPokemon.length > 0 ? (
              <View style={styles.footer}>
                {hasMore ? (
                  <AppButton
                    label={`Ver más Pokémon (${filteredPokemon.length - visiblePokemon.length})`}
                    variant="secondary"
                    onPress={loadMore}
                  />
                ) : (
                  <AppText variant="caption" color={GlassColors.textMuted} style={styles.endText}>
                    Has visto todos los resultados de esta búsqueda.
                  </AppText>
                )}
              </View>
            ) : undefined
          }
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  list: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 36,
  },
  header: {
    gap: 14,
    marginBottom: 16,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kickerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GlassColors.accentLight,
  },
  offlineBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: GlassRadius.pill,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  updatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  separator: {
    height: 10,
  },
  footer: {
    paddingTop: 18,
    gap: 10,
  },
  endText: {
    textAlign: 'center',
  },
});
