import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/api/http';
import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { GlassCard } from '@/components/glass-card';
import { PokemonImage } from '@/components/pokemon-image';
import { ScreenBackground } from '@/components/screen-background';
import { StatBar } from '@/components/stat-bar';
import {
  ErrorState,
  LoadingState,
  Notice,
} from '@/components/status-views';
import { TypeChip } from '@/components/type-chip';
import { GlassColors, GlassRadius } from '@/constants/glass';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { usePendingSavedPokemonChanges } from '@/hooks/use-pending-mutations';
import { usePokemonDetail } from '@/hooks/use-pokemon';
import { useCreateSavedPokemon, useSavedPokemons } from '@/hooks/use-saved-pokemon';
import { logDebug } from '@/lib/debug-log';
import {
  formatHeight,
  formatPokemonId,
  formatPokemonName,
  formatWeight,
} from '@/utils/format';

export default function PokemonDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const numericId = rawId && /^\d+$/.test(rawId) ? Number(rawId) : undefined;

  const query = usePokemonDetail(numericId ?? rawId);
  const collection = useSavedPokemons();
  const pending = usePendingSavedPokemonChanges();
  const createMutation = useCreateSavedPokemon();
  const isOnline = useOnlineStatus();

  const pokemon = query.data;
  // La mutación confirmada evita ofrecer "Guardar" otra vez durante el breve
  // intervalo en que la colección se está refrescando.
  const confirmedSaved =
    numericId && createMutation.data?.pokemonId === numericId
      ? createMutation.data
      : undefined;
  const savedRecord =
    (numericId
      ? collection.data?.find((item) => item.pokemonId === numericId)
      : undefined) ?? confirmedSaved;
  const pendingCreate = numericId
    ? pending.creates.find((item) => item.variables.pokemonId === numericId)
    : undefined;
  const collectionUnavailableOffline =
    !savedRecord && !pendingCreate && !collection.data && !isOnline;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const savePokemon = () => {
    if (!pokemon) return;
    logDebug('MUTATION', `Creación de registro propio solicitada (Pokémon #${pokemon.id})`);
    createMutation.reset();
    createMutation.mutate({
      pokemonId: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.imageUrl,
      note: '',
      isFavorite: false,
    });
  };

  const collectionMustBeVerified =
    !savedRecord &&
    !pendingCreate &&
    !collectionUnavailableOffline &&
    collection.isLoading &&
    !collection.data;
  const collectionVerificationFailed =
    !savedRecord &&
    !pendingCreate &&
    !collectionUnavailableOffline &&
    collection.isError &&
    !collection.data;

  return (
    <ScreenBackground>
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.inner}>
            <View style={styles.navRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Volver"
                onPress={goBack}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                <AppText variant="title" color={GlassColors.text}>
                  ‹
                </AppText>
              </Pressable>
              <AppText variant="label" color={GlassColors.textMuted}>
                DETALLE DEL POKÉMON
              </AppText>
              <View style={styles.navSpacer} />
            </View>

            {query.isLoading && !pokemon ? (
              <LoadingState message="Consultando la ficha del Pokémon..." />
            ) : query.isError && !pokemon ? (
              <ErrorState
                message={getErrorMessage(query.error, 'No se pudo cargar este Pokémon.')}
                onRetry={() => {
                  void query.refetch();
                }}
              />
            ) : pokemon ? (
              <>
                {query.isError ? (
                  <Notice
                    tone="error"
                    title="No se pudo actualizar la ficha"
                    message={getErrorMessage(query.error, 'Se muestran los datos guardados.')}
                    actionLabel="Reintentar"
                    onAction={() => {
                      void query.refetch();
                    }}
                  />
                ) : null}

                <GlassCard style={styles.heroCard}>
                  <View style={styles.heroGlow} pointerEvents="none" />
                  <View style={styles.heroHeader}>
                    <AppText variant="label" color={GlassColors.accentLight}>
                      {formatPokemonId(pokemon.id)}
                    </AppText>
                    {!isOnline ? (
                      <View style={styles.offlineBadge}>
                        <AppText variant="caption" color={GlassColors.warning}>
                          Sin conexión
                        </AppText>
                      </View>
                    ) : null}
                  </View>

                  <PokemonImage
                    uri={pokemon.imageUrl}
                    fallbackUri={pokemon.fallbackImageUrl}
                    size={220}
                    style={styles.heroImage}
                  />

                  <AppText variant="display" style={styles.heroName}>
                    {formatPokemonName(pokemon.name)}
                  </AppText>

                  <View style={styles.typesRow}>
                    {pokemon.types.length > 0 ? (
                      pokemon.types.map((type) => <TypeChip key={type} type={type} />)
                    ) : (
                      <AppText variant="caption" color={GlassColors.textMuted}>
                        Tipos no disponibles
                      </AppText>
                    )}
                  </View>

                  <View style={styles.measuresRow}>
                    <View style={styles.measureCard}>
                      <AppText variant="caption" color={GlassColors.textMuted}>
                        Altura
                      </AppText>
                      <AppText variant="subtitle">{formatHeight(pokemon.height)}</AppText>
                    </View>
                    <View style={styles.measureCard}>
                      <AppText variant="caption" color={GlassColors.textMuted}>
                        Peso
                      </AppText>
                      <AppText variant="subtitle">{formatWeight(pokemon.weight)}</AppText>
                    </View>
                  </View>
                </GlassCard>

                <GlassCard style={styles.sectionCard}>
                  <AppText variant="subtitle">Estadísticas base</AppText>
                  {pokemon.stats.length > 0 ? (
                    <View style={styles.statsList}>
                      {pokemon.stats.map((stat) => (
                        <StatBar key={stat.name} name={stat.name} value={stat.value} />
                      ))}
                    </View>
                  ) : (
                    <AppText variant="body" color={GlassColors.textMuted}>
                      PokéAPI no devolvió estadísticas para este Pokémon.
                    </AppText>
                  )}
                </GlassCard>

                <GlassCard style={styles.sectionCard}>
                  <AppText variant="subtitle">Tu colección</AppText>

                  {savedRecord ? (
                    <>
                      <Notice
                        tone="success"
                        title="Ya está en tu colección"
                        message="Puedes editar su nota y marcarlo como favorito desde la colección personal."
                      />
                      <AppButton
                        label="Ver mi colección"
                        variant="secondary"
                        onPress={() => router.navigate('/collection')}
                      />
                    </>
                  ) : pendingCreate ? (
                    <Notice
                      tone={pendingCreate.isPaused ? 'warning' : 'info'}
                      title={
                        pendingCreate.isPaused
                          ? 'Guardado pendiente de sincronizar'
                          : 'Guardando en tu colección'
                      }
                      message={
                        pendingCreate.isPaused
                          ? 'La operación está en cola y se enviará a MockAPI cuando vuelva la conexión.'
                          : 'Esperando la confirmación de MockAPI...'
                      }
                    />
                  ) : collectionUnavailableOffline ? (
                    <Notice
                      tone="warning"
                      title="No se puede verificar la colección sin conexión"
                      message="No hay una copia guardada en este dispositivo. Conéctate para comprobar que el Pokémon no esté duplicado antes de guardarlo."
                      actionLabel="Reintentar"
                      onAction={() => {
                        void collection.refetch();
                      }}
                    />
                  ) : collectionVerificationFailed ? (
                    <Notice
                      tone="error"
                      title="No se pudo verificar tu colección"
                      message="Para evitar duplicados no permitiremos guardar hasta comprobar si este Pokémon ya existe."
                      actionLabel="Reintentar"
                      onAction={() => {
                        void collection.refetch();
                      }}
                    />
                  ) : (
                    <>
                      <AppText variant="body" color={GlassColors.textMuted}>
                        Se guardará con una nota vacía y sin favorito. Podrás editarlo después.
                      </AppText>
                      <AppButton
                        label={
                          isOnline ? 'Guardar en mi colección' : 'Guardar (pendiente de conexión)'
                        }
                        onPress={savePokemon}
                        loading={createMutation.isPending || collectionMustBeVerified}
                        disabled={
                          collectionMustBeVerified ||
                          createMutation.isPending ||
                          Boolean(pendingCreate)
                        }
                      />
                      {!isOnline ? (
                        <AppText variant="caption" color={GlassColors.warning}>
                          Sin conexión: la operación quedará pausada y se reanudará al reconectar.
                        </AppText>
                      ) : null}
                    </>
                  )}

                  {collection.isError && collection.data ? (
                    <Notice
                      tone="warning"
                      title="Usando una copia guardada"
                      message="No se pudo actualizar tu colección desde MockAPI. La comprobación de duplicados usa los datos en caché."
                    />
                  ) : null}

                  {createMutation.isError ? (
                    <Notice
                      tone="error"
                      title="No se pudo guardar"
                      message={getErrorMessage(
                        createMutation.error,
                        'MockAPI rechazó la operación. Inténtalo de nuevo.'
                      )}
                    />
                  ) : null}

                  {createMutation.isSuccess && !savedRecord ? (
                    <Notice
                      tone="success"
                      title="Guardado confirmado"
                      message="MockAPI confirmó el registro. La colección se está actualizando."
                    />
                  ) : null}
                </GlassCard>
              </>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 36,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 760,
    gap: 14,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GlassColors.card,
    borderWidth: 1,
    borderColor: GlassColors.border,
  },
  navSpacer: {
    width: 44,
  },
  pressed: {
    opacity: 0.7,
  },
  heroCard: {
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    paddingTop: 18,
  },
  heroGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -70,
    backgroundColor: 'rgba(139, 92, 246, 0.20)',
  },
  heroHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: GlassRadius.pill,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  heroName: {
    textAlign: 'center',
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  measuresRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  measureCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 12,
    borderRadius: GlassRadius.medium,
    backgroundColor: 'rgba(4, 8, 24, 0.28)',
    borderWidth: 1,
    borderColor: GlassColors.border,
  },
  sectionCard: {
    gap: 14,
  },
  statsList: {
    gap: 12,
  },
});
