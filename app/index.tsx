// app/index.tsx
import { Link } from "expo-router";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../assets/bg/stadium.png"; // ✅ PNG only
import LogoMark from "../components/LogoMark";
import { styles } from "./styles/home"; // ✅ correct relative path

export default function Home() {
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
        <View style={styles.scrim} />
        <View style={styles.bgGlow} />
        <View style={styles.bgCorner} />

        <SafeAreaView style={styles.safe}>
          <View style={styles.centerWrap}>
            <View style={styles.brandCol}>
              <LogoMark size={92} />
              <Text style={styles.title}>CricLedger</Text>
            </View>

            <Link href="/match/setup" asChild>
              <Pressable style={styles.startBtn}>
                <Text style={styles.startIcon}>🏏</Text>
                <Text style={styles.startText}>Start Match</Text>
              </Pressable>
            </Link>

            {/* Replaces Settings → Cricket Etiquette */}
            <Link href="/ethics" asChild>
              <Pressable style={styles.settingsBtn}>
                <Text style={styles.settingsIcon}>🤝</Text>
                <Text style={styles.settingsText}>Cricket Etiquette</Text>
              </Pressable>
            </Link>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
