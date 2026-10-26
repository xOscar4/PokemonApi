/**
 * Claves jerárquicas de TanStack Query.
 *
 * PokéAPI y MockAPI se guardan bajo raíces distintas para que una mutación de
 * la colección personal nunca invalide las consultas públicas de Pokémon.
 */
export const queryKeys = {
  pokeapi: {
    all: ['pokeapi'] as const,
    lists: () => [...queryKeys.pokeapi.all, 'list'] as const,
    list: () => [...queryKeys.pokeapi.lists(), 'index'] as const,
    details: () => [...queryKeys.pokeapi.all, 'detail'] as const,
    detail: (idOrName: string | number) =>
      [...queryKeys.pokeapi.details(), String(idOrName).toLowerCase()] as const,
  },
  mockapi: {
    all: ['mockapi'] as const,
    collectionRoot: () => [...queryKeys.mockapi.all, 'collection'] as const,
    collectionList: () => [...queryKeys.mockapi.collectionRoot(), 'list'] as const,
    collectionDetail: (id: string) =>
      [...queryKeys.mockapi.collectionRoot(), 'detail', id] as const,
  },
} as const;

export const mutationKeys = {
  createSavedPokemon: ['mockapi', 'mutation', 'create-saved-pokemon'] as const,
  updateSavedPokemon: ['mockapi', 'mutation', 'update-saved-pokemon'] as const,
} as const;

export function isMutationKey(
  key: readonly unknown[] | undefined,
  expected: readonly unknown[]
) {
  if (!key || key.length < expected.length) return false;
  return expected.every((part, index) => key[index] === part);
}
