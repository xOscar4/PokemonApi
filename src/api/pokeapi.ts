import { HttpError, requestJson } from '@/api/http';
import type {
  PokemonDetail,
  PokemonDetailResponse,
  PokemonListItem,
  PokemonListResponse,
} from '@/types/pokemon';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const OFFICIAL_ARTWORK_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
const SPRITE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

function getPokemonIdFromUrl(url: string) {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function artworkUrl(id: number) {
  return `${OFFICIAL_ARTWORK_URL}/${id}.png`;
}

function spriteUrl(id: number) {
  return `${SPRITE_URL}/${id}.png`;
}

/**
 * PokéAPI no tiene búsqueda por texto: se descarga una sola vez el índice
 * nacional (nombre + número) y la pantalla filtra y pagina sobre esos datos.
 */
export async function fetchPokemonIndex(): Promise<PokemonListItem[]> {
  const data = await requestJson<PokemonListResponse>(
    `${POKEAPI_BASE_URL}/pokemon?limit=2000`
  );

  if (!data || !Array.isArray(data.results)) {
    throw new HttpError('PokéAPI devolvió una lista con un formato inesperado.');
  }

  return data.results
    .map((item) => {
      const id = getPokemonIdFromUrl(item.url);
      if (!id || !item.name) return null;

      return {
        id,
        name: item.name,
        imageUrl: artworkUrl(id),
        fallbackImageUrl: spriteUrl(id),
      } satisfies PokemonListItem;
    })
    .filter((item): item is PokemonListItem => item !== null)
    .sort((a, b) => a.id - b.id);
}

export async function fetchPokemonDetail(idOrName: string | number): Promise<PokemonDetail> {
  const identifier = String(idOrName).trim().toLowerCase();
  const data = await requestJson<PokemonDetailResponse>(
    `${POKEAPI_BASE_URL}/pokemon/${encodeURIComponent(identifier)}`
  );

  if (!data || typeof data.id !== 'number' || !data.name) {
    throw new HttpError('PokéAPI devolvió un Pokémon con un formato inesperado.');
  }

  const officialArtwork = data.sprites?.other?.['official-artwork']?.front_default;
  const defaultSprite = data.sprites?.front_default;
  const imageUrl = officialArtwork ?? defaultSprite ?? artworkUrl(data.id);

  const types = Array.isArray(data.types)
    ? data.types
        .filter((slot) => typeof slot?.type?.name === 'string')
        .sort((a, b) => a.slot - b.slot)
        .map((slot) => slot.type.name)
    : [];

  const stats = Array.isArray(data.stats)
    ? data.stats
        .filter((stat) => typeof stat?.stat?.name === 'string')
        .map((stat) => ({
          name: stat.stat.name,
          value: Number(stat.base_stat) || 0,
        }))
    : [];

  return {
    id: data.id,
    name: data.name,
    height: Number(data.height) || 0,
    weight: Number(data.weight) || 0,
    imageUrl,
    fallbackImageUrl: defaultSprite ?? spriteUrl(data.id),
    types,
    stats,
  };
}
