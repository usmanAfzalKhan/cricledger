import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function Home() {
  // pulsing glow like old-school title screens
  const glow = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0.6, duration: 1400, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const shadow = glow.interpolate({ inputRange: [0.6, 1], outputRange: [8, 18] });

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0f14' }}>
      {/* stadium sky gradient */}
      <LinearGradient
        colors={['#0b0f14', '#0c1730', '#091124']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* faint flood-light beams */}
      <LinearGradient
        colors={['rgba(42,115,214,0.25)', 'transparent']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.6, y: 0.7 }}
        style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-8deg' }] }]}
      />
      <LinearGradient
        colors={['rgba(99,230,190,0.22)', 'transparent']}
        start={{ x: 0.9, y: 0 }}
        end={{ x: 0.4, y: 0.7 }}
        style={[StyleSheet.absoluteFill, { transform: [{ rotate: '8deg' }] }]}
      />

      {/* header with logo + title */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Animated.Text
          style={[
            styles.title,
            {
              textShadowRadius: shadow as any,
              textShadowColor: 'rgba(42,115,214,0.85)',
            },
          ]}
        >
          CricLedger
        </Animated.Text>
        <Text style={styles.subtitle}>Ultimate Scoring</Text>
      </View>

      {/* menu panel */}
      <View style={styles.panel}>
        <MenuButton label="START MATCH" primary onPress={() => console.log('Start Match')} />
        <MenuButton label="LOAD MATCH" onPress={() => console.log('Load (coming soon)')} />
        <MenuButton label="SETTINGS" onPress={() => console.log('Settings')} />
        <MenuButton label="ABOUT" onPress={() => console.log('About')} />

        <Text style={styles.hint}>
          Tip: Long-press buttons for a subtle rumble (Android ripple included).
        </Text>
      </View>

      {/* footer strip like old HUD bars */}
      <View style={styles.footerHud}>
        <View style={styles.hudDot} />
        <Text style={styles.footerText}>Cric Blue</Text>
        <View style={[styles.hudDot, { backgroundColor: '#63E6BE' }]} />
        <Text style={styles.footerText}>Mint</Text>
      </View>
    </View>
  );
}

function MenuButton({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: false }}
      style={({ pressed }) => [
        styles.btn,
        primary ? styles.btnPrimary : styles.btnSecondary,
        pressed && { transform: [{ translateY: 1 }], opacity: 0.95 },
      ]}
    >
      <Text style={styles.btnText}>{label}</Text>
      {/* faux bevel / highlight line */}
      <View style={styles.highlight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    color: '#EAF2F8',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    color: '#9bb4c9',
    marginTop: 6,
    fontSize: 12,
    letterSpacing: 1,
  },
  panel: {
    marginTop: 22,
    marginHorizontal: 18,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.75)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    ...Platform.select({ android: { elevation: 6 } }),
  },
  btn: {
    overflow: 'hidden',
    marginVertical: 8,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnPrimary: {
    backgroundColor: '#2A73D6',
    borderColor: '#2A73D6',
  },
  btnSecondary: {
    backgroundColor: '#1b2430',
    borderColor: '#283445',
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1,
  },
  highlight: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 6,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 2,
  },
  hint: {
    color: '#7e92a7',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
  },
  footerHud: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    right: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e2a3a',
    backgroundColor: 'rgba(14,19,27,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  footerText: { color: '#9bb4c9', fontSize: 12 },
  hudDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2A73D6',
  },
});
