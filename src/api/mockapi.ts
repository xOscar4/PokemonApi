import { getHttpStatus, HttpError, requestJson } from '@/api/http';
import { logDebug } from '@/lib/debug-log';
import type {
  CreateSavedPokemonInput,
  SavedPokemon,
  UpdateSavedPokemonInput,
} from '@/types/saved-pokemon';

const configuredBaseUrl = (process.env.EXPO_PUBLIC_MOCKAPI_BASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '');

/**
 * La URL ya incluye el recurso `/pokemons`.
 * No se debe volver a concatenar `/pokemons` ni agregar `/api/v1`.
 */
function getBaseUrl() {
  if (!configuredBaseUrl) {
    throw new HttpError(
      'Falta EXPO_PUBLIC_MOCKAPI_BASE_URL. Crea un archivo .env con la URL del recurso de MockAPI.'
    );
  }
  return configuredBaseUrl;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseSavedPokemon(value: unknown): SavedPokemon {
  if (!isRecord(value)) {
    throw new HttpError('MockAPI devolvió un registro con un formato inesperado.');
  }

  const rawId = value.id;
  const pokemonId = Number(value.pokemonId);

  if (
    (typeof rawId !== 'string' && typeof rawId !== 'number') ||
    !Number.isFinite(pokemonId) ||
    typeof value.name !== 'string' ||
    typeof value.imageUrl !== 'string'
  ) {
    throw new HttpError('MockAPI devolvió un registro incompleto o con campos inválidos.');
  }

  return {
    id: String(rawId),
    pokemonId,
    name: value.name,
    imageUrl: value.imageUrl,
    note: typeof value.note === 'string' ? value.note : '',
    isFavorite: value.isFavorite === true,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
  };
}

export async function fetchSavedPokemons(): Promise<SavedPokemon[]> {
  const data = await requestJson<unknown>(getBaseUrl());

  if (!Array.isArray(data)) {
    throw new HttpError('MockAPI devolvió una lista con un formato inesperado.');
  }

  return data.map(parseSavedPokemon);
}

export async function fetchSavedPokemonById(id: string): Promise<SavedPokemon> {
  const data = await requestJson<unknown>(`${getBaseUrl()}/${encodeURIComponent(id)}`);
  return parseSavedPokemon(data);
}

export async function createSavedPokemon(
  input: CreateSavedPokemonInput
): Promise<SavedPokemon> {
  logDebug('MOCKAPI', 'Envío de registro a MockAPI iniciado');
  let responseStatus: number | undefined;

  try {
    const data = await requestJson<unknown>(
      getBaseUrl(),
      {
        method: 'POST',
        body: JSON.stringify({
          pokemonId: input.pokemonId,
          name: input.name,
          imageUrl: input.imageUrl,
          note: input.note,
          isFavorite: input.isFavorite,
        }),
      },
      (status) => {
        responseStatus = status;
      }
    );

    const saved = parseSavedPokemon(data);
    logDebug(
      'MOCKAPI',
      `Registro enviado correctamente${responseStatus ? ` (HTTP ${responseStatus})` : ''}`
    );
    return saved;
  } catch (error) {
    const status = getHttpStatus(error) ?? responseStatus;
    logDebug('MOCKAPI', `Error al enviar el registro${status ? ` (HTTP ${status})` : ''}`);
    throw error;
  }
}

export async function updateSavedPokemon(
  input: UpdateSavedPokemonInput
): Promise<SavedPokemon> {
  logDebug('MOCKAPI', 'Actualización de registro en MockAPI iniciada');
  let responseStatus: number | undefined;

  try {
    const { id, ...changes } = input;
    const data = await requestJson<unknown>(
      `${getBaseUrl()}/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(changes),
      },
      (status) => {
        responseStatus = status;
      }
    );

    const updated = parseSavedPokemon(data);
    logDebug(
      'MOCKAPI',
      `Registro actualizado correctamente${responseStatus ? ` (HTTP ${responseStatus})` : ''}`
    );
    return updated;
  } catch (error) {
    const status = getHttpStatus(error) ?? responseStatus;
    logDebug('MOCKAPI', `Error al actualizar el registro${status ? ` (HTTP ${status})` : ''}`);
    throw error;
  }
}
