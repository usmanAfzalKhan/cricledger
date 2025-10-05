// app/about.tsx
import { Link } from "expo-router";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import bg from "../assets/bg/stadium.png";
import { styles as home, THEME } from "./styles/home";

export default function AboutScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <SafeAreaView style={[home.safe, { paddingHorizontal: 20 }]}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Link href="/" asChild>
              <Pressable
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: THEME.BORDER,
                  backgroundColor: THEME.CARD,
                }}
              >
                <Text style={{ color: THEME.TEXT }}>‹ Back</Text>
              </Pressable>
            </Link>

            <Text style={{ color: THEME.TEXT, fontWeight: "900", fontSize: 20 }}>
              About
            </Text>

            <View style={{ width: 60 }} />
          </View>

          {/* Body card */}
          <View
            style={{
              backgroundColor: THEME.CARD,
              borderColor: THEME.BORDER,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text style={{ color: THEME.TEXT, fontSize: 18, fontWeight: "900" }}>
              CricLedger
            </Text>

            <Text
              style={{
                color: THEME.TEXT_MUTED,
                marginTop: 6,
                lineHeight: 20,
              }}
            >
              Built with ❤️ by{" "}
              <Text style={{ fontWeight: "900", color: THEME.TEXT }}>
                Taha Khan
              </Text>
              .{"\n"}A lightweight, offline-friendly cricket scorer focused on
              clean UI and quick input.
            </Text>

            <View style={{ height: 10 }} />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
