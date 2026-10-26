import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, type Mutation, type Query } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

import { createSavedPokemon, updateSavedPokemon } from '@/api/mockapi';
import {
  MOCKAPI_STALE_TIME,
  PERSIST_MAX_AGE,
  QUERY_GC_TIME,
} from '@/constants/cache';
import { isMutationKey, mutationKeys, queryKeys } from '@/constants/queryKeys';
import { describeLogError, logDebug } from '@/lib/debug-log';
import type {
  CreateSavedPokemonInput,
  UpdateSavedPokemonInput,
} from '@/types/saved-pokemon';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: QUERY_GC_TIME,
      staleTime: MOCKAPI_STALE_TIME,
      retry: 2,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // No se reintenta automáticamente un POST/PATCH: si la respuesta se
      // pierde después de que el servidor la procesó, un reintento podría
      // duplicar el registro. Las mutaciones sin conexión quedan pausadas.
      retry: 0,
      networkMode: 'online',
    },
  },
});

queryClient.setMutationDefaults(mutationKeys.createSavedPokemon, {
  mutationFn: async (input: CreateSavedPokemonInput) => {
    const saved = await createSavedPokemon(input);
    // Solo se invalida la colección propia. PokéAPI no se toca.
    void queryClient.invalidateQueries({ queryKey: queryKeys.mockapi.collectionList() });
    return saved;
  },
  networkMode: 'online',
  retry: 0,
});

queryClient.setMutationDefaults(mutationKeys.updateSavedPokemon, {
  mutationFn: async ({ id, ...changes }: UpdateSavedPokemonInput) => {
    const updated = await updateSavedPokemon({ id, ...changes });
    // Lista y detalle propio del registro; las claves públicas quedan intactas.
    void queryClient.invalidateQueries({ queryKey: queryKeys.mockapi.collectionList() });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.mockapi.collectionDetail(id),
    });
    return updated;
  },
  networkMode: 'online',
  retry: 0,
});

const PERSIST_KEY = 'pokemonapi-query-cache';
let lastPausedMutationsSignature: string | null = null;

type PersistedMutationSnapshot = {
  mutationKey?: unknown;
  state?: {
    isPaused?: boolean;
    submittedAt?: number;
  };
};

function getPausedMutationsSummary(serialized: string) {
  // Evita analizar el JSON completo en cada escritura si no hay mutaciones.
  if (!serialized.includes('"isPaused":true')) return null;

  try {
    const parsed = JSON.parse(serialized) as {
      clientState?: { mutations?: PersistedMutationSnapshot[] };
    };
    const paused = (parsed.clientState?.mutations ?? []).filter(
      (mutation) => mutation.state?.isPaused === true
    );

    if (paused.length === 0) return null;

    return {
      count: paused.length,
      signature: JSON.stringify(
        paused.map((mutation) => [mutation.mutationKey, mutation.state?.submittedAt ?? 0])
      ),
    };
  } catch {
    return null;
  }
}

/**
 * Envuelve AsyncStorage solo para registrar cuándo la escritura terminó de
 * verdad. La persistencia sigue siendo la misma que configura TanStack Query.
 */
const loggingStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      logDebug('PERSIST', `Error al guardar la caché persistida: ${describeLogError(error)}`);
      throw error;
    }

    if (key !== PERSIST_KEY) return;

    const summary = getPausedMutationsSummary(value);
    if (!summary) {
      lastPausedMutationsSignature = null;
      return;
    }

    if (summary.signature === lastPausedMutationsSignature) return;
    lastPausedMutationsSignature = summary.signature;

    logDebug(
      'PERSIST',
      summary.count === 1
        ? 'Mutación pendiente guardada en AsyncStorage'
        : `${summary.count} mutaciones pendientes guardadas en AsyncStorage`
    );
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
    if (key === PERSIST_KEY) {
      lastPausedMutationsSignature = null;
      logDebug('CACHE', 'Caché persistida eliminada de AsyncStorage');
    }
  },
};

const basePersister = createAsyncStoragePersister({
  storage: loggingStorage,
  key: PERSIST_KEY,
  throttleTime: 1000,
});

export const asyncStoragePersister = {
  ...basePersister,
  restoreClient: async () => {
    const persisted = await basePersister.restoreClient();

    if (!persisted) {
      logDebug('CACHE', 'No hay caché persistida en este dispositivo');
      return persisted;
    }

    const queries = persisted.clientState?.queries?.length ?? 0;
    const mutations = persisted.clientState?.mutations?.length ?? 0;
    const queriesLabel = queries === 1 ? 'consulta' : 'consultas';
    const mutationsLabel = mutations === 1 ? 'mutación pendiente' : 'mutaciones pendientes';
    logDebug(
      'CACHE',
      `Caché persistida leída desde AsyncStorage (${queries} ${queriesLabel}, ${mutations} ${mutationsLabel})`
    );
    return persisted;
  },
};

export const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: PERSIST_MAX_AGE,
  buster: 'pokemonapi-cache-v1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query: Query) => {
      const root = query.queryKey[0];
      return (
        query.state.status === 'success' && (root === 'pokeapi' || root === 'mockapi')
      );
    },
    shouldDehydrateMutation: (mutation: Mutation) => mutation.state.isPaused,
  },
};

/**
 * Observa el ciclo de vida de las mutaciones propias para registrar cuándo
 * TanStack Query las pausa o las reanuda. No modifica su comportamiento.
 */
const pausedMutations = new WeakSet<Mutation>();

queryClient.getMutationCache().subscribe((event) => {
  const { mutation } = event;
  if (!mutation) return;

  const mutationKey = mutation.options.mutationKey;
  const isTrackedMutation =
    isMutationKey(mutationKey, mutationKeys.createSavedPokemon) ||
    isMutationKey(mutationKey, mutationKeys.updateSavedPokemon);

  if (!isTrackedMutation) return;

  if (mutation.state.status !== 'pending') {
    pausedMutations.delete(mutation);
    return;
  }

  if (mutation.state.isPaused) {
    if (pausedMutations.has(mutation)) return;
    pausedMutations.add(mutation);
    logDebug('MUTATION', 'Mutación pausada por falta de conexión');
    return;
  }

  if (pausedMutations.has(mutation)) {
    pausedMutations.delete(mutation);
    logDebug('MUTATION', 'Reanudando mutación pendiente');
  }
});
