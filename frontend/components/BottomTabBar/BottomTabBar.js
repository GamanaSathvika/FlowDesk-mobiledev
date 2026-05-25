import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { key: 'tasks', label: 'Tasks', icon: 'checkmark-circle-outline', iconActive: 'checkmark-circle' },
  { key: 'focus', label: 'Focus', icon: 'timer-outline', iconActive: 'timer' },
  { key: 'analytics', label: 'Analytics', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
];

function TabItem({ tab, isActive, onPress, styles, theme }) {
  const progress = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: isActive ? 1 : 0,
      friction: 8,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [isActive, progress]);

  const bgScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });

  const handlePress = useCallback(() => onPress(tab.key), [onPress, tab.key]);

  return (
    <Pressable
      onPress={handlePress}
      style={styles.tabItem}
      hitSlop={6}
      android_ripple={{ color: 'rgba(59,130,246,0.08)', borderless: true, radius: 36 }}
    >
      <View style={styles.tabHighlight}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tabHighlightBg,
            {
              opacity: progress,
              transform: [{ scale: bgScale }],
            },
          ]}
        />
        <Ionicons
          name={isActive ? tab.iconActive : tab.icon}
          size={23}
          color={isActive ? theme.primary : theme.textTertiary}
        />
        <Text style={[styles.label, isActive && styles.labelActive]}>
          {tab.label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function BottomTabBar({ activeTab, onTabPress }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createTabStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.topBorder} />
      <View style={styles.row}>
        {TABS.map((tab) => (
          <TabItem
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onPress={onTabPress}
            styles={styles}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

function createTabStyles(t) {
  const isDark = t.mode === 'dark';

  return StyleSheet.create({
    container: {
      backgroundColor: t.tabBarBackground,
      shadowColor: t.shadow,
      shadowOpacity: t.cardShadowOpacity,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: -4 },
      elevation: t.cardElevation,
      paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    },
    topBorder: { height: 1, backgroundColor: t.borderSubtle },
    row: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingHorizontal: 6 },
    tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    tabHighlight: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      minWidth: 72,
      gap: 3,
      overflow: 'visible',
    },
    tabHighlightBg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: t.primarySoft,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.primarySoftBorder,
      shadowColor: isDark ? t.primary : t.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: isDark ? 10 : 6,
      shadowOpacity: isDark ? 0.15 : 0.06,
      elevation: isDark ? 4 : 2,
    },
    label: { fontSize: 11, fontWeight: '500', color: t.textTertiary, letterSpacing: 0.1 },
    labelActive: { color: t.primary, fontWeight: '700' },
  });
}
