import { StyleSheet } from "react-native";

export const THEME = {
  BG: "#07131A",

  CARD: "rgba(8,18,25,0.88)",
  CARD_SOFT: "rgba(8,18,25,0.76)",

  PRIMARY: "#78D79A",
  PRIMARY_DARK: "#57BE7C",

  // Legacy names still used by existing screens/components
  ACCENT: "#78D79A",
  TEXT_MUTED: "rgba(255,255,255,0.68)",

  TEXT: "#F4F7F8",
  MUTED: "rgba(255,255,255,0.68)",

  BORDER: "rgba(255,255,255,0.10)",
};

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3,10,14,0.54)",
  },

  bgGlow: {
    position: "absolute",
    top: -90,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(98,227,157,0.14)",
  },

  bgGlowTwo: {
    position: "absolute",
    bottom: 130,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(116,213,154,0.10)",
  },

  bgCorner: {
    position: "absolute",
    bottom: -90,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  brandCol: {
    alignItems: "center",
  },

  title: {
    color: THEME.TEXT,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 0.2,
    textAlign: "center",
  },

  startBtn: {
    minHeight: 78,
    borderRadius: 24,
    backgroundColor: THEME.PRIMARY,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",

    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 14,
  },

  quickBtn: {
    minHeight: 78,
    borderRadius: 24,

    backgroundColor: "rgba(6,18,26,0.88)",

    borderWidth: 1.5,
    borderColor: "rgba(120,215,154,0.55)",

    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 14,
  },

  settingsBtn: {
    minHeight: 70,
    borderRadius: 22,

    backgroundColor: "rgba(6,18,26,0.88)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",
  },

  buttonIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,

    backgroundColor: "rgba(0,0,0,0.12)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 14,
  },

  buttonIconWrapDark: {
    width: 46,
    height: 46,
    borderRadius: 15,

    backgroundColor: "rgba(120,215,154,0.10)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 14,
  },

  smallIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,

    backgroundColor: "rgba(255,255,255,0.06)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  buttonTextWrap: {
    flex: 1,
    justifyContent: "center",
  },

  startIcon: {
    fontSize: 22,
  },

  quickIcon: {
    fontSize: 22,
  },

  settingsIcon: {
    fontSize: 19,
  },

  startText: {
    color: "#07131A",
    fontSize: 26,
    fontWeight: "900",
  },

  quickText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },

  settingsText: {
    color: "#F6F8FA",
    fontSize: 18,
    fontWeight: "800",
  },

  buttonSubText: {
    marginTop: 2,

    color: "rgba(11,24,32,0.72)",

    fontSize: 12,
    fontWeight: "700",
  },

  buttonSubTextMuted: {
    marginTop: 2,

    color: "rgba(255,255,255,0.56)",

    fontSize: 12,
    fontWeight: "700",
  },

  buttonArrow: {
    color: "#07131A",
    fontSize: 30,
    fontWeight: "900",
    marginLeft: 10,
  },

  buttonArrowMuted: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 30,
    fontWeight: "900",
    marginLeft: 10,
  },

  footer: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    paddingTop: 4,
  },

  footerBtn: {
    alignSelf: "center",

    paddingHorizontal: 18,
    paddingVertical: 12,

    borderRadius: 999,

    backgroundColor: "rgba(10,22,30,0.82)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  footerText: {
    color: "rgba(255,255,255,0.84)",

    fontSize: 14,
    fontWeight: "800",

    textAlign: "center",
  },
});


export default function __IGNORE_STYLES_ROUTE__() { return null; }
