import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export type BigBtnProps = { label: string; onPress: () => void; disabled?: boolean; danger?: boolean };

export function BigBtn({ label, onPress, disabled, danger }: BigBtnProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!!disabled}
      style={[styles.bigBtn, disabled && styles.dim, danger && styles.danger]}
      android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
    >
      <Text style={styles.bigBtnText}>{label}</Text>
    </Pressable>
  );
}

export function SmallBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.smallBtn} android_ripple={{ color: 'rgba(255,255,255,0.12)' }}>
      <Text style={styles.smallBtnText}>{label}</Text>
    </Pressable>
  );
}

/** Stub so Expo Router doesn't warn about "missing default export" for files under /app. */
export default function _ButtonsRouteStub() { return null; }

const styles = StyleSheet.create({
  bigBtn: {
    width: '23.5%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#283445',
    backgroundColor: '#1b2430',
    alignItems: 'center',
    justifyContent: 'center',
  },
  danger: { borderColor: '#8b2a2a', backgroundColor: 'rgba(139,42,42,0.18)' },
  dim: { opacity: 0.5 },
  bigBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },

  smallBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#283445',
    backgroundColor: '#1b2430',
  },
  smallBtnText: { color: '#fff', fontWeight: '800' },
});
