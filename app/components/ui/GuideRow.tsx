import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function GuideRow({ title, steps }: { title: string; steps: string[] }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {steps.map((s, i) => (
        <Text key={i} style={styles.step}>• {s}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.75)',
    borderRadius: 12,
    padding: 10,
  },
  title: { color: '#EAF2F8', fontWeight: '900' },
  step: { color: '#A8C0D6', marginTop: 2 },
});
