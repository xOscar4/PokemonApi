import { onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

import { describeLogError, logDebug } from '@/lib/debug-log';

let setupStarted = false;
let connectivityReady: Promise<void> = Promise.resolve();
let lastLoggedOnline: boolean | undefined;

function applyNetworkState(state: Network.NetworkState, setOnline: (online: boolean) => void) {
  // `isInternetReachable` puede ser undefined en algunas plataformas.
  // Solo se considera offline cuando el sistema lo afirma explícitamente.
  const online = state.isConnected === true && state.isInternetReachable !== false;

  if (lastLoggedOnline !== online) {
    if (lastLoggedOnline === undefined) {
      logDebug('NETWORK', online ? 'Conexión disponible' : 'Sin conexión');
    } else {
      logDebug('NETWORK', online ? 'Conexión recuperada' : 'Sin conexión');
    }
    lastLoggedOnline = online;
  }

  setOnline(online);
}

/**
 * Conecta TanStack Query con expo-network. Se usa una sola librería de red:
 * expo-network (incluida en Expo Go y compatible con SDK 58).
 */
export function setupConnectivity() {
  if (setupStarted) return connectivityReady;
  setupStarted = true;

  // Expo Router genera HTML en Node durante `expo export`. En ese entorno no
  // existe `window`, así que no se registra ningún listener de red.
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    connectivityReady = Promise.resolve();
    return connectivityReady;
  }

  connectivityReady = new Promise<void>((resolve) => {
    onlineManager.setEventListener((setOnline) => {
      const subscription = Network.addNetworkStateListener((state) => {
        applyNetworkState(state, setOnline);
      });

      // El listener solo avisa de cambios; hace falta leer el estado inicial.
      Network.getNetworkStateAsync()
        .then((state) => applyNetworkState(state, setOnline))
        .catch((error) => {
          // Si no se puede leer el estado, se mantiene el valor por defecto
          // de TanStack Query (online) y los fetch mostrarán el error real.
          logDebug(
            'NETWORK',
            `No se pudo leer el estado inicial de la red: ${describeLogError(error)}`
          );
        })
        .finally(resolve);

      return () => subscription.remove();
    });
  });

  return connectivityReady;
}
