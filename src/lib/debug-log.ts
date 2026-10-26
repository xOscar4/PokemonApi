import { Platform } from 'react-native';

export type LogCategory =
  | 'APP'
  | 'QUERY'
  | 'CACHE'
  | 'NETWORK'
  | 'MUTATION'
  | 'MOCKAPI'
  | 'PERSIST';

const pad = (value: number) => String(value).padStart(2, '0');

export function formatLogTimestamp(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Log de depuración con fecha, hora y categoría.
 *
 * Se usa `console.log` a propósito: Metro lo muestra en el terminal durante el
 * desarrollo y, en el APK, React Native lo envía a Android Logcat con la
 * etiqueta `ReactNativeJS`.
 */
export function logDebug(category: LogCategory, message: string) {
  console.log(`[${formatLogTimestamp()}] [${category}] ${message}`);
}

let appStartLogged = false;

/** Registra el arranque una sola vez por instancia de JavaScript. */
export function logAppStart() {
  if (appStartLogged) return;
  // Expo Router renderiza en Node durante `expo export`; ahí no hay una app.
  if (Platform.OS === 'web' && typeof window === 'undefined') return;

  appStartLogged = true;
  logDebug('APP', 'Aplicación iniciada');
}

/** Resume un error para el log sin volcar objetos completos. */
export function describeLogError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return 'error desconocido';
}
