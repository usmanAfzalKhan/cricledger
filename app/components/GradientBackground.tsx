import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0b0f14' }}>
      {/* base depth */}
      <LinearGradient
        colors={['#0b0f14', '#0c1730', '#091124']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* cool cyan sweep */}
      <LinearGradient
        colors={['rgba(40,170,255,0.18)', 'transparent']}
        start={{ x: 0.05, y: 0.05 }}
        end={{ x: 0.6, y: 0.7 }}
        style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-10deg' }], opacity: 0.9 }]}
        pointerEvents="none"
      />
      {/* mint accent */}
      <LinearGradient
        colors={['rgba(99,230,190,0.22)', 'transparent']}
        start={{ x: 0.95, y: 0.1 }}
        end={{ x: 0.35, y: 0.85 }}
        style={[StyleSheet.absoluteFill, { transform: [{ rotate: '7deg' }], opacity: 0.85 }]}
        pointerEvents="none"
      />
      {/* subtle top glow */}
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.25 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}
