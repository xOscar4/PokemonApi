import { useQuery } from '@tanstack/react-query';

import { fetchPokemonDetail, fetchPokemonIndex } from '@/api/pokeapi';
import { HttpError } from '@/api/http';
import { POKEAPI_STALE_TIME } from '@/constants/cache';
import { queryKeys } from '@/constants/queryKeys';

function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof HttpError && error.status === 404) return false;
  return failureCount < 2;
}

export function usePokemonIndex() {
  return useQuery({
    queryKey: queryKeys.pokeapi.list(),
    queryFn: fetchPokemonIndex,
    staleTime: POKEAPI_STALE_TIME,
    retry: shouldRetry,
  });
}

export function usePokemonDetail(idOrName: string | number | undefined) {
  return useQuery({
    queryKey: queryKeys.pokeapi.detail(idOrName ?? 'unknown'),
    queryFn: () => fetchPokemonDetail(idOrName as string | number),
    enabled: idOrName !== undefined && String(idOrName).length > 0,
    staleTime: POKEAPI_STALE_TIME,
    retry: shouldRetry,
  });
}
