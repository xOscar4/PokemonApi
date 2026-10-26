export const GlassColors = {
  background: '#070B1A',
  backgroundMid: '#1A1642',
  backgroundEnd: '#082338',
  text: '#F7F5FF',
  textMuted: '#A7AECB',
  textSoft: '#D6D9EC',
  accent: '#8B5CF6',
  accentDark: '#5B21B6',
  accentLight: '#C4B5FD',
  blue: '#38BDF8',
  border: 'rgba(255, 255, 255, 0.16)',
  borderStrong: 'rgba(196, 181, 253, 0.42)',
  card: 'rgba(255, 255, 255, 0.08)',
  cardStrong: 'rgba(255, 255, 255, 0.13)',
  input: 'rgba(4, 8, 24, 0.38)',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#FB7185',
  info: '#7DD3FC',
} as const;

export const GlassRadius = {
  small: 12,
  medium: 18,
  large: 26,
  pill: 999,
} as const;

export const GlassShadow = {
  shadowColor: '#020617',
  shadowOpacity: 0.35,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6,
} as const;
