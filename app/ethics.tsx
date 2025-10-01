// app/ethics.tsx
import { router } from "expo-router";
import { ImageBackground, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../assets/bg/stadium.png";
import { styles as home, THEME } from "./styles/home";

export default function Ethics() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0B0E11" }}>
      <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <SafeAreaView style={home.safe}>
          <View style={{ paddingHorizontal: 16, paddingTop: 8, marginBottom: 8 }}>
            <Text style={{ color: THEME.TEXT, fontSize: 18, fontWeight: "900", letterSpacing: 0.3 }}>
              Spirit of Cricket — Etiquette
            </Text>
            <Text style={{ color: THEME.TEXT_MUTED, marginTop: 4, fontSize: 12 }}>
              Scoring logic: no-balls (1 + runs, free-hit), wides (1), byes/leg-byes are legal balls, and wickets/overs are handled automatically.
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
            <View
              style={{
                padding: 14,
                backgroundColor: "rgba(12,18,24,0.65)",
                borderWidth: 1,
                borderColor: THEME.BORDER,
                borderRadius: 16,
              }}
            >
              <Text style={{ color: THEME.TEXT, fontWeight: "800", marginBottom: 10, fontSize: 16 }}>
                On-field Etiquette
              </Text>

              {[
                "Stay silent during the bowler’s run-up and delivery — no yelling or clapping to distract.",
                "Respect the umpires; accept decisions and move on.",
                "No abusive language or personal sledging — compete hard, stay respectful.",
                "Don’t run on the pitch (especially down the middle) — protect the surface.",
                "Fielders stay still and quiet until the ball is played; keepers/slips avoid fake calls.",
                "Call loudly & clearly when running: “Yes”, “No”, or “Wait”; avoid collisions.",
                "Return the ball politely via the bounce to the bowler/keeper; no throwing at bodies.",
                "Celebrate wickets and boundaries respectfully — no in-the-face taunts.",
                "Prioritize safety: helmets/pads where needed; stop play immediately for injuries or hazards.",
                "Keep the game moving — be ready between balls, avoid time-wasting.",
                "Look after the ground: no littering, glass, or damage to sightscreens/facilities.",
              ].map((line, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <Text style={{ color: THEME.TEXT, opacity: 0.8 }}>•</Text>
                  <Text style={{ color: THEME.TEXT, flex: 1, lineHeight: 18 }}>{line}</Text>
                </View>
              ))}

              <Pressable
                onPress={() => router.back()}
                style={{
                  marginTop: 6,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  backgroundColor: THEME.ACCENT,
                  borderWidth: 1,
                  borderColor: THEME.ACCENT,
                }}
              >
                <Text style={{ color: "#0B0F14", fontWeight: "800" }}>Back</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
