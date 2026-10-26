export class HttpError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

type JsonRequestInit = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

function summarizeResponseBody(body: string) {
  const clean = body.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  return clean.length > 160 ? `${clean.slice(0, 160)}...` : clean;
}

/**
 * Centraliza las solicitudes para no repetir el manejo de errores HTTP,
 * errores de red y respuestas que no son JSON.
 */
export async function requestJson<T>(url: string, init: JsonRequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new HttpError(
      'No se pudo conectar con el servidor. Revisa tu conexión a Internet e inténtalo de nuevo.'
    );
  }

  const body = await response.text().catch(() => '');

  if (!response.ok) {
    const detail = summarizeResponseBody(body);
    throw new HttpError(
      `El servidor respondió con un error ${response.status}.${
        detail ? ` Detalle: ${detail}` : ''
      }`,
      response.status
    );
  }

  if (!body) {
    throw new HttpError('El servidor devolvió una respuesta vacía.', response.status);
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new HttpError('El servidor devolvió una respuesta que no es JSON válido.', response.status);
  }
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof HttpError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
