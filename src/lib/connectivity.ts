import { onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

let setupStarted = false;
let connectivityReady: Promise<void> = Promise.resolve();

function applyNetworkState(state: Network.NetworkState, setOnline: (online: boolean) => void) {
  // `isInternetReachable` puede ser undefined en algunas plataformas.
  // Solo se considera offline cuando el sistema lo afirma explícitamente.
  const online = state.isConnected === true && state.isInternetReachable !== false;
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
        .catch(() => {
          // Si no se puede leer el estado, se mantiene el valor por defecto
          // de TanStack Query (online) y los fetch mostrarán el error real.
        })
        .finally(resolve);

      return () => subscription.remove();
    });
  });

  return connectivityReady;
}
