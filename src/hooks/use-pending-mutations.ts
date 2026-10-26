import { useMutationState } from '@tanstack/react-query';

import { isMutationKey, mutationKeys } from '@/constants/queryKeys';
import type {
  CreateSavedPokemonInput,
  UpdateSavedPokemonInput,
} from '@/types/saved-pokemon';

type PendingMutationInfo = {
  key: readonly unknown[] | undefined;
  variables: unknown;
  isPaused: boolean;
};

export type PendingCreate = {
  variables: CreateSavedPokemonInput;
  isPaused: boolean;
};

export type PendingUpdate = {
  variables: UpdateSavedPokemonInput;
  isPaused: boolean;
};

export function usePendingMutations() {
  return useMutationState<PendingMutationInfo>({
    filters: { status: 'pending' },
    select: (mutation) => ({
      key: mutation.options.mutationKey,
      variables: mutation.state.variables,
      isPaused: mutation.state.isPaused,
    }),
  });
}

export function usePendingSavedPokemonChanges() {
  const pending = usePendingMutations();

  const creates: PendingCreate[] = [];
  const updates: PendingUpdate[] = [];

  for (const mutation of pending) {
    if (isMutationKey(mutation.key, mutationKeys.createSavedPokemon)) {
      creates.push({
        variables: mutation.variables as CreateSavedPokemonInput,
        isPaused: mutation.isPaused,
      });
    }

    if (isMutationKey(mutation.key, mutationKeys.updateSavedPokemon)) {
      updates.push({
        variables: mutation.variables as UpdateSavedPokemonInput,
        isPaused: mutation.isPaused,
      });
    }
  }

  return {
    creates,
    updates,
    total: creates.length + updates.length,
    pausedCount:
      creates.filter((item) => item.isPaused).length +
      updates.filter((item) => item.isPaused).length,
  };
}
