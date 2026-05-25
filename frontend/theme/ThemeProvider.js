import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, UIManager, useColorScheme } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

export const THEME_PREFERENCE_KEY = 'THEME_PREFERENCE';

const ThemeContext = createContext(null);

export function ThemeProvider({ children, followSystem = false }) {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (!mounted) return;
        if (stored === 'dark') setIsDarkMode(true);
        else if (stored === 'light') setIsDarkMode(false);
        else if (followSystem) setIsDarkMode(systemScheme === 'dark');
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => { mounted = false; };
  }, [followSystem, systemScheme]);

  const setDarkMode = useCallback((value) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDarkMode(value);
    AsyncStorage.setItem(THEME_PREFERENCE_KEY, value ? 'dark' : 'light').catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDarkMode(!isDarkMode);
  }, [isDarkMode, setDarkMode]);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ theme, isDarkMode, setDarkMode, toggleTheme, ready }),
    [theme, isDarkMode, setDarkMode, toggleTheme, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
