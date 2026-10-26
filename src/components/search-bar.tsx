import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { GlassColors, GlassRadius } from '@/constants/glass';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Buscar Pokémon' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        tintColor={GlassColors.textMuted}
        size={18}
      />
      <TextInput
        accessibilityLabel="Buscar Pokémon por nombre"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={GlassColors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda"
          hitSlop={10}
          onPress={() => onChangeText('')}
          style={styles.clearButton}>
          <AppText variant="label" color={GlassColors.textSoft}>
            ×
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: GlassColors.input,
    borderWidth: 1,
    borderColor: GlassColors.border,
    borderRadius: GlassRadius.medium,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  input: {
    flex: 1,
    color: GlassColors.text,
    fontSize: 15,
    paddingVertical: 12,
  },
  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
});
