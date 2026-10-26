import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, type Mutation, type Query } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

import { createSavedPokemon, updateSavedPokemon } from '@/api/mockapi';
import {
  MOCKAPI_STALE_TIME,
  PERSIST_MAX_AGE,
  QUERY_GC_TIME,
} from '@/constants/cache';
import { mutationKeys, queryKeys } from '@/constants/queryKeys';
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

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'pokemonapi-query-cache',
  throttleTime: 1000,
});

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
