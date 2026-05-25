/**
 * GradientButton.js — Redesigned
 * Rich amber-gold gradient, deep shadow, spring press animation.
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from './PressableScale';

export default function GradientButton({ label, onPress, style, disabled }) {
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[styles.wrap, disabled && styles.wrapDisabled, style]}
      pressedScale={0.97}
    >
      <LinearGradient
        colors={disabled ? ['#3A4560', '#2A3450'] : ['#F0B740', '#D4851E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.btn}
      >
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    shadowColor: '#E2A84B',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    marginTop: 4,
  },
  wrapDisabled: {
    shadowOpacity: 0.1,
  },
  btn: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    color: '#0C1220',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  labelDisabled: {
    color: '#4A5878',
  },
});