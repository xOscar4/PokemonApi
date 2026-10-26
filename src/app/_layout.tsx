import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { onlineManager } from '@tanstack/react-query';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { GlassColors } from '@/constants/glass';
import { setupConnectivity } from '@/lib/connectivity';
import { persistOptions, queryClient } from '@/lib/queryClient';

SplashScreen.preventAutoHideAsync().catch(() => {
  // En web o si la pantalla de inicio ya se ocultó, no hay nada que hacer.
});

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  const finishStartup = useCallback(() => {
    setReady(true);
  }, []);

  const restoreFinished = useCallback(async () => {
    try {
      // Espera a conocer el estado real de la red antes de reanudar.
      await setupConnectivity();
      await queryClient.resumePausedMutations();
    } catch (error) {
      console.warn('No se pudieron reanudar las mutaciones pendientes', error);
    } finally {
      finishStartup();
    }
  }, [finishStartup]);

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    // Al volver la conexión, las mutaciones restauradas desde AsyncStorage
    // necesitan un empujón explícito además del reintento automático.
    return onlineManager.subscribe((online) => {
      if (online) {
        queryClient.resumePausedMutations().catch((error) => {
          console.warn('No se pudieron reanudar las mutaciones al reconectar', error);
        });
      }
    });
  }, []);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
        onSuccess={restoreFinished}
        onError={finishStartup}>
        <ThemeProvider value={DarkTheme}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: GlassColors.background },
            }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="pokemon/[id]"
              options={{ animation: 'slide_from_right', gestureEnabled: true }}
            />
          </Stack>

          {!ready ? (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingBadge}>
                <ActivityIndicator size="large" color={GlassColors.accentLight} />
              </View>
              <AppText variant="subtitle">Preparando tu Pokédex...</AppText>
              <AppText variant="caption" color={GlassColors.textMuted}>
                Restaurando los datos guardados en el dispositivo
              </AppText>
            </View>
          ) : null}
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: GlassColors.background,
    experimental_backgroundImage:
      'linear-gradient(155deg, #070B1A 0%, #191340 46%, #0A263D 100%)',
  },
  loadingBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: GlassColors.borderStrong,
    marginBottom: 6,
  },
});
