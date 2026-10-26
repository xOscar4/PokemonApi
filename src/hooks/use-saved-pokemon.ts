import { useMutation, useQuery } from '@tanstack/react-query';

import { fetchSavedPokemons } from '@/api/mockapi';
import { MOCKAPI_STALE_TIME } from '@/constants/cache';
import { mutationKeys, queryKeys } from '@/constants/queryKeys';
import type {
  CreateSavedPokemonInput,
  SavedPokemon,
  UpdateSavedPokemonInput,
} from '@/types/saved-pokemon';

export function useSavedPokemons() {
  return useQuery({
    queryKey: queryKeys.mockapi.collectionList(),
    queryFn: fetchSavedPokemons,
    staleTime: MOCKAPI_STALE_TIME,
  });
}

export function useCreateSavedPokemon() {
  return useMutation<SavedPokemon, Error, CreateSavedPokemonInput>({
    mutationKey: mutationKeys.createSavedPokemon,
    // mutationFn y onSuccess están registrados en queryClient mediante
    // setMutationDefaults para que también funcionen al reanudar.
  });
}

export function useUpdateSavedPokemon() {
  return useMutation<SavedPokemon, Error, UpdateSavedPokemonInput>({
    mutationKey: mutationKeys.updateSavedPokemon,
  });
}
