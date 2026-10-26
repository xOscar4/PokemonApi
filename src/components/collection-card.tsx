import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/app-text';
import { AppButton } from '@/components/app-button';
import { GlassCard } from '@/components/glass-card';
import { PokemonImage } from '@/components/pokemon-image';
import { Notice } from '@/components/status-views';
import { getErrorMessage } from '@/api/http';
import { GlassColors, GlassRadius } from '@/constants/glass';
import { useUpdateSavedPokemon } from '@/hooks/use-saved-pokemon';
import type { PendingUpdate } from '@/hooks/use-pending-mutations';
import type { SavedPokemon } from '@/types/saved-pokemon';
import { formatPokemonId, formatPokemonName } from '@/utils/format';

type CollectionCardProps = {
  item: SavedPokemon;
  pendingUpdate?: PendingUpdate;
};

export function CollectionCard({ item, pendingUpdate }: CollectionCardProps) {
  const updateMutation = useUpdateSavedPokemon();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.note);

  const hasPending = Boolean(pendingUpdate) || updateMutation.isPending;
  const pendingNote =
    pendingUpdate?.variables.note !== undefined ? pendingUpdate.variables.note : undefined;

  const toggleFavorite = () => {
    if (hasPending) return;
    updateMutation.reset();
    updateMutation.mutate({ id: item.id, isFavorite: !item.isFavorite });
  };

  const startEditing = () => {
    setDraft(item.note);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(item.note);
    setEditing(false);
  };

  const saveNote = () => {
    const nextNote = draft.trim();
    setEditing(false);

    if (nextNote === item.note) return;

    updateMutation.reset();
    updateMutation.mutate({ id: item.id, note: nextNote });
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.imageWrapper}>
          <PokemonImage uri={item.imageUrl} size={56} />
        </View>

        <View style={styles.titleArea}>
          <AppText variant="caption" color={GlassColors.accentLight}>
            {formatPokemonId(item.pokemonId)}
          </AppText>
          <AppText variant="subtitle" numberOfLines={1}>
            {formatPokemonName(item.name)}
          </AppText>
          <View style={styles.badges}>
            {item.isFavorite ? (
              <View style={[styles.badge, styles.favoriteBadge]}>
                <AppText variant="caption" color={GlassColors.warning}>
                  ★ Favorito
                </AppText>
              </View>
            ) : null}
            {hasPending ? (
              <View style={[styles.badge, styles.pendingBadge]}>
                <ActivityIndicator
                  size="small"
                  color={pendingUpdate?.isPaused ? GlassColors.warning : GlassColors.info}
                />
                <AppText
                  variant="caption"
                  color={pendingUpdate?.isPaused ? GlassColors.warning : GlassColors.info}>
                  {pendingUpdate?.isPaused ? 'Pendiente de sincronizar' : 'Guardando...'}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            item.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'
          }
          accessibilityState={{ disabled: hasPending, selected: item.isFavorite }}
          disabled={hasPending}
          hitSlop={8}
          onPress={toggleFavorite}
          style={({ pressed }) => [
            styles.starButton,
            pressed && styles.pressed,
            hasPending && styles.disabled,
          ]}>
          <AppText variant="title" color={GlassColors.warning}>
            {item.isFavorite ? '★' : '☆'}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.noteBox}>
        {editing ? (
          <>
            <TextInput
              accessibilityLabel="Nota personal"
              value={draft}
              onChangeText={setDraft}
              placeholder="Escribe una nota sobre este Pokémon"
              placeholderTextColor={GlassColors.textMuted}
              multiline
              maxLength={240}
              autoFocus
              style={styles.noteInput}
            />
            <View style={styles.noteActions}>
              <AppButton
                label="Cancelar"
                variant="secondary"
                size="sm"
                onPress={cancelEditing}
                style={styles.noteButton}
              />
              <AppButton
                label="Guardar nota"
                size="sm"
                onPress={saveNote}
                disabled={hasPending}
                style={styles.noteButton}
              />
            </View>
          </>
        ) : (
          <View style={styles.noteView}>
            <View style={styles.noteTextArea}>
              <AppText variant="label" color={GlassColors.textMuted}>
                Nota personal
              </AppText>
              <AppText
                variant="body"
                color={item.note ? GlassColors.textSoft : GlassColors.textMuted}>
                {item.note || 'Todavía no hay una nota para este Pokémon.'}
              </AppText>
            </View>
            <AppButton
              label="Editar"
              variant="secondary"
              size="sm"
              onPress={startEditing}
              disabled={hasPending}
            />
          </View>
        )}
      </View>

      {pendingNote !== undefined && pendingNote !== item.note ? (
        <Notice
          tone="warning"
          message={`Nota pendiente de sincronizar: “${pendingNote}”`}
        />
      ) : null}

      {updateMutation.isError ? (
        <Notice
          tone="error"
          title="No se pudo actualizar"
          message={getErrorMessage(updateMutation.error, 'Inténtalo de nuevo.')}
        />
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: GlassColors.border,
  },
  titleArea: {
    flex: 1,
    gap: 2,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: GlassRadius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  favoriteBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(125, 211, 252, 0.10)',
    borderColor: 'rgba(125, 211, 252, 0.30)',
  },
  starButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.20)',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.45,
  },
  noteBox: {
    backgroundColor: 'rgba(4, 8, 24, 0.28)',
    borderWidth: 1,
    borderColor: GlassColors.border,
    borderRadius: GlassRadius.medium,
    padding: 12,
    gap: 10,
  },
  noteView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noteTextArea: {
    flex: 1,
    gap: 3,
  },
  noteInput: {
    minHeight: 76,
    color: GlassColors.text,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: 'top',
    padding: 0,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  noteButton: {
    flexGrow: 0,
  },
});
