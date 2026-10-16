import { ReactNode } from "react";
import {
    ImageBackground,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  background: ImageSourcePropType;
  children: ReactNode;
  scroll?: boolean;
};

export default function GameScreen({
  background,
  children,
  scroll = true,
}: Props) {
  const content = (
    <>
      <View style={s.scrim} />
      <View style={s.topShade} />
      <View style={s.bottomShade} />
      <View style={s.greenGlow} />

      <SafeAreaView style={s.safe}>
        {scroll ? (
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={s.content}>{children}</View>
        )}
      </SafeAreaView>
    </>
  );

  return (
    <ImageBackground source={background} resizeMode="cover" style={s.screen}>
      {content}
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#061117",
  },

  safe: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  content: {
    width: "100%",
    maxWidth: 470,

    alignSelf: "center",

    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,

    flexGrow: 1,
  },

  scrim: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(3,10,14,0.55)",
  },

  topShade: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,

    height: 200,

    backgroundColor: "rgba(3,10,14,0.30)",
  },

  bottomShade: {
    position: "absolute",

    bottom: 0,
    left: 0,
    right: 0,

    height: 280,

    backgroundColor: "rgba(2,8,12,0.40)",
  },

  greenGlow: {
    position: "absolute",

    top: 70,
    right: -120,

    width: 270,
    height: 270,

    borderRadius: 135,

    backgroundColor: "rgba(96,210,145,0.09)",
  },
});
