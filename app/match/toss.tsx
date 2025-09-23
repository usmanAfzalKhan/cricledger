// app/match/toss.tsx
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// same stadium background + global overlays
import bg from "../../assets/bg/stadium.png";
import { styles as home } from "../styles/home";

export default function TossScreen() {
  const p = useLocalSearchParams<{
    teamA?: string;
    teamB?: string;
    captainA?: string;
    captainB?: string;
    teamAName?: string;
    teamBName?: string;
  }>();

  const teamAName = (p.teamAName as string) || "Team A";
  const teamBName = (p.teamBName as string) || "Team B";

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <SafeAreaView style={[home.safe, { backgroundColor: "transparent", padding: 16 }]}>
          <View
            style={{
              backgroundColor: "rgba(12,18,24,0.65)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: 16,
              gap: 8,
            }}
          >
            <Text style={{ color: "#E6EDFF", fontSize: 18, fontWeight: "900" }}>Toss</Text>
            <Text style={{ color: "#9DB2D7" }}>
              You’ll build this screen next. Params received:
            </Text>
            <Text style={{ color: "#CFE3FF" }}>
              {teamAName} vs {teamBName}
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
