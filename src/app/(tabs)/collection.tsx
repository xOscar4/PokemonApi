import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/api/http';
import { AppText } from '@/components/app-text';
import { CollectionCard } from '@/components/collection-card';
import { ScreenBackground } from '@/components/screen-background';
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
import { useSavedPokemons } from '@/hooks/use-saved-pokemon';

export default function CollectionScreen() {
  const query = useSavedPokemons();
  const pending = usePendingSavedPokemonChanges();
  const isOnline = useOnlineStatus();

  const items = query.data ?? [];
  const favoritesCount = items.filter((item) => item.isFavorite).length;

  const pendingByRecord = new Map(
    pending.updates.map((update) => [update.variables.id, update] as const)
  );

  const emptyComponent =
    !isOnline && !query.data ? (
      <ErrorState
        message="No hay conexión y tu colección no está guardada todavía en este dispositivo. Conéctate y reintenta."
        onRetry={() => {
          void query.refetch();
        }}
      />
    ) : query.isLoading ? (
      <LoadingState message="Consultando tu colección en MockAPI..." />
    ) : query.isError ? (
      <ErrorState
        message={getErrorMessage(query.error, 'No se pudo consultar MockAPI.')}
        onRetry={() => {
          void query.refetch();
        }}
      />
    ) : (
      <EmptyState
        title="Tu colección está vacía"
        message="Abre un Pokémon desde la Pokédex y guárdalo para verlo aquí."
        actionLabel="Ir a la Pokédex"
        onAction={() => router.navigate('/')}
      />
    );

  return (
    <ScreenBackground>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CollectionCard item={item} pendingUpdate={pendingByRecord.get(item.id)} />
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
                  COLECCIÓN PERSONAL
                </AppText>
                {!isOnline ? (
                  <View style={styles.offlineBadge}>
                    <AppText variant="caption" color={GlassColors.warning}>
                      Sin conexión
                    </AppText>
                  </View>
                ) : null}
              </View>

              <AppText variant="display">Mi colección</AppText>
              <AppText color={GlassColors.textMuted}>
                Los Pokémon que guardaste en MockAPI, con tus notas y favoritos. Los cambios
                sin conexión quedan en cola hasta que vuelvas a estar online.
              </AppText>

              {query.data ? (
                <View style={styles.statsRow}>
                  <View style={styles.statPill}>
                    <AppText variant="caption" color={GlassColors.textMuted}>
                      Guardados
                    </AppText>
                    <AppText variant="bodyStrong">{items.length}</AppText>
                  </View>
                  <View style={styles.statPill}>
                    <AppText variant="caption" color={GlassColors.textMuted}>
                      Favoritos
                    </AppText>
                    <AppText variant="bodyStrong" color={GlassColors.warning}>
                      {favoritesCount}
                    </AppText>
                  </View>
                </View>
              ) : null}

              {!isOnline ? (
                <Notice
                  tone="warning"
                  message="Estás sin conexión. Puedes leer la colección guardada; las notas y favoritos se sincronizarán al reconectar."
                />
              ) : null}

              <PendingSyncBanner total={pending.total} pausedCount={pending.pausedCount} />

              {query.isError && query.data ? (
                <Notice
                  tone="error"
                  title="No se pudo actualizar la colección"
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
            items.length > 0 ? (
              <AppText variant="caption" color={GlassColors.textMuted} style={styles.footer}>
                Toca la estrella para cambiar un favorito. Usa “Editar” para guardar una nota
                personal.
              </AppText>
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: GlassRadius.pill,
    backgroundColor: GlassColors.card,
    borderWidth: 1,
    borderColor: GlassColors.border,
  },
  separator: {
    height: 12,
  },
  footer: {
    paddingTop: 18,
    textAlign: 'center',
  },
});
