import { StyleSheet, Text, type TextProps } from 'react-native';

import { GlassColors } from '@/constants/glass';

type TextVariant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'button';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
};

export function AppText({
  variant = 'body',
  color = GlassColors.text,
  style,
  ...rest
}: AppTextProps) {
  return <Text {...rest} style={[styles[variant], { color }, style]} />;
}

const styles = StyleSheet.create({
  display: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
