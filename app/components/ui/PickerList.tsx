import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PickerList({
  items, selectedKey, onSelect, disabledKeys = [],
}: {
  items: { key: string; label: string }[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  disabledKeys?: string[];
}) {
  return (
    <View style={styles.wrap}>
      {items.map((it) => {
        const active = selectedKey === it.key;
        const disabled = disabledKeys.includes(it.key);
        return (
          <Pressable
            key={it.key}
            onPress={() => !disabled && onSelect(it.key)}
            disabled={disabled}
            style={[styles.item, active && styles.on, disabled && { opacity: 0.35 }]}
            android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
          >
            <Text style={styles.text}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  item: {
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 999, borderWidth: 1, borderColor: '#283445', backgroundColor: '#1b2430',
  },
  on:   { borderColor: '#2A73D6', backgroundColor: 'rgba(42,115,214,0.18)' },
  text: { color: '#EAF2F8', fontWeight: '800' },
});
