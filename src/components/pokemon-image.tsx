import { Image, type ImageStyle } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, type StyleProp } from 'react-native';

type PokemonImageProps = {
  uri: string;
  fallbackUri?: string;
  size: number;
  style?: StyleProp<ImageStyle>;
};

export function PokemonImage({ uri, fallbackUri, size, style }: PokemonImageProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);

  const source = failedUri === uri && fallbackUri ? fallbackUri : uri;

  return (
    <Image
      source={{ uri: source }}
      style={[styles.image, { width: size, height: size }, style]}
      contentFit="contain"
      transition={180}
      cachePolicy="memory-disk"
      onError={() => {
        if (fallbackUri && source !== fallbackUri) setFailedUri(uri);
      }}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
