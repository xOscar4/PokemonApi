/**
 * Registro que vive en MockAPI.
 * `id` y `createdAt` los genera MockAPI, por eso no se envían al crear.
 */
export type SavedPokemon = {
  id: string;
  pokemonId: number;
  name: string;
  imageUrl: string;
  note: string;
  isFavorite: boolean;
  createdAt: string;
};

export type CreateSavedPokemonInput = {
  pokemonId: number;
  name: string;
  imageUrl: string;
  note: string;
  isFavorite: boolean;
};

export type UpdateSavedPokemonInput = {
  id: string;
  note?: string;
  isFavorite?: boolean;
};
