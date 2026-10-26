const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** PokéAPI cambia muy poco: 5 minutos es suficiente. */
export const POKEAPI_STALE_TIME = 5 * MINUTE;

/** MockAPI puede cambiar desde otro dispositivo: se refresca más seguido. */
export const MOCKAPI_STALE_TIME = 30 * 1000;

/** Tiempo que una consulta inactiva permanece en memoria. */
export const QUERY_GC_TIME = 24 * HOUR;

/** Antigüedad máxima de la caché guardada en AsyncStorage. */
export const PERSIST_MAX_AGE = 24 * HOUR;
