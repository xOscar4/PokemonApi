import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { AppButton } from '@/components/app-button';
import { GlassColors, GlassRadius } from '@/constants/glass';

type Tone = 'info' | 'success' | 'warning' | 'error';

const toneColors: Record<Tone, string> = {
  info: GlassColors.info,
  success: GlassColors.success,
  warning: GlassColors.warning,
  error: GlassColors.danger,
};

type NoticeProps = {
  tone?: Tone;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function Notice({ tone = 'info', title, message, actionLabel, onAction }: NoticeProps) {
  const color = toneColors[tone];

  return (
    <View
      style={[
        styles.notice,
        { backgroundColor: `${color}18`, borderColor: `${color}55` },
      ]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.noticeText}>
        {title ? (
          <AppText variant="bodyStrong" color={color}>
            {title}
          </AppText>
        ) : null}
        <AppText variant="caption" color={GlassColors.textSoft}>
          {message}
        </AppText>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <AppText variant="label" color={color}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Cargando información...' }: LoadingStateProps) {
  return (
    <View style={styles.stateContainer}>
      <ActivityIndicator size="large" color={GlassColors.accentLight} />
      <AppText style={styles.centerText} color={GlassColors.textMuted}>
        {message}
      </AppText>
    </View>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.stateContainer}>
      <View style={styles.errorIcon}>
        <AppText variant="title" color={GlassColors.danger}>
          !
        </AppText>
      </View>
      <AppText variant="subtitle" style={styles.centerText}>
        No pudimos cargar los datos
      </AppText>
      <AppText style={styles.centerText} color={GlassColors.textMuted}>
        {message}
      </AppText>
      {onRetry ? (
        <AppButton label="Reintentar" onPress={onRetry} style={styles.retryButton} />
      ) : null}
    </View>
  );
}

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.stateContainer}>
      <View style={styles.emptyIcon}>
        <AppText variant="title">◓</AppText>
      </View>
      <AppText variant="subtitle" style={styles.centerText}>
        {title}
      </AppText>
      <AppText style={styles.centerText} color={GlassColors.textMuted}>
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} style={styles.retryButton} />
      ) : null}
    </View>
  );
}

type PendingSyncBannerProps = {
  total: number;
  pausedCount: number;
};

export function PendingSyncBanner({ total, pausedCount }: PendingSyncBannerProps) {
  if (total === 0) return null;

  if (pausedCount > 0) {
    return (
      <Notice
        tone="warning"
        title="Sincronización pendiente"
        message={`${pausedCount} ${
          pausedCount === 1 ? 'operación espera' : 'operaciones esperan'
        } a que vuelva la conexión. Se enviarán automáticamente.`}
      />
    );
  }

  return (
    <Notice
      tone="info"
      title="Guardando cambios"
      message={`${total} ${total === 1 ? 'operación está en curso' : 'operaciones están en curso'}.`}
    />
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: GlassRadius.medium,
    padding: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  noticeText: {
    flex: 1,
    gap: 2,
  },
  action: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  pressed: {
    opacity: 0.7,
  },
  stateContainer: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  centerText: {
    textAlign: 'center',
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 113, 133, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.35)',
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: GlassColors.borderStrong,
  },
  retryButton: {
    marginTop: 8,
    minWidth: 160,
  },
});
