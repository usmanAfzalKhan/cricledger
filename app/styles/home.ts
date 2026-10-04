// app/styles/home.ts

import { Platform, StatusBar, StyleSheet } from "react-native";

export const THEME = {
  BG: "#0B1220",
  TEXT: "#EDEFE6",
  TEXT_MUTED: "rgba(237,239,230,0.8)",
  ACCENT: "#68B984",
  CARD: "rgba(12,18,24,0.55)",
  BORDER: "rgba(255,255,255,0.12)",
};

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "transparent",
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0,
  },

  bgGlow: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: "#143121",
    opacity: 0.35,
  },

  bgCorner: {
    position: "absolute",
    right: -60,
    bottom: -60,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "#0e1a28",
    opacity: 0.45,
  },

  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11,18,32,0.28)",
  },

  centerWrap: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  brandCol: {
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },

  title: {
    color: THEME.TEXT,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0.3,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  startBtn: {
    width: 280,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: THEME.ACCENT,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.ACCENT,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  startIcon: {
    color: THEME.BG,
    fontSize: 16,
  },

  startText: {
    color: THEME.BG,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  quickBtn: {
    width: 280,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(12,18,24,0.78)",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.ACCENT,
  },

  quickIcon: {
    fontSize: 16,
  },

  quickText: {
    color: THEME.TEXT,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: THEME.CARD,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.BORDER,
    backdropFilter: "blur(6px)" as any,
  },

  settingsIcon: {
    color: THEME.TEXT_MUTED,
    fontSize: 14,
  },

  settingsText: {
    color: THEME.TEXT_MUTED,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  footer: {
    alignItems: "center",
    paddingBottom: 16,
    paddingTop: 8,
  },

  footerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: THEME.BORDER,
  },

  footerText: {
    color: "rgba(237,239,230,0.88)",
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});

export default function __IGNORE_STYLES_ROUTE__() {
  return null;
}