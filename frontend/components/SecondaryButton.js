/**
 * SecondaryButton.js — Redesigned
 * Dark ghost button with subtle border, works on deep navy backgrounds.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PressableScale from './PressableScale';

export default function SecondaryButton({ label, onPress, iconName = 'chrome', style }) {
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.btn, style]}
      pressedScale={0.97}
    >
      <View style={styles.row}>
        <Feather name={iconName} size={16} color="#8A9EC0" />
        <Text style={styles.label}>{label}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1E2D47',
    backgroundColor: '#0D1525',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    color: '#8A9EC0',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});