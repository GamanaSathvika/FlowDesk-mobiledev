import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';

export function useThemedStyles(factory) {
  const { theme } = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
