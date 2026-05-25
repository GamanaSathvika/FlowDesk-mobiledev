import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function AuthHeader({ title = 'FlowDesk', subtitle }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.icon}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.brand}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(219,234,254,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  icon: {
    width: 56,
    height: 56,
  },
  brand: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

