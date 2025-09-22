import { Platform, StyleSheet } from "react-native";
import { THEME } from "./home";

export const styles = StyleSheet.create({
  formWrap: {
    padding: 20,
    paddingBottom: 32,
    minHeight: "100%",
    justifyContent: "flex-start",
    gap: 16,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: THEME.CARD,
    borderWidth: 1,
    borderColor: THEME.BORDER,
    borderRadius: 10,
  },
  backIcon: { color: THEME.TEXT_MUTED, fontSize: 16 },
  backText: { color: THEME.TEXT_MUTED, fontSize: 13, fontWeight: "700" },

  title: {
    color: THEME.TEXT,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // Card
  card: {
    backgroundColor: "rgba(12,18,24,0.65)",
    borderWidth: 1,
    borderColor: THEME.BORDER,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },

  label: {
    color: THEME.TEXT,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 6,
    opacity: 0.95,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },
  grow: { flex: 1 },
  playersBox: {
    width: 84,
  },

  input: {
    color: THEME.TEXT,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 10,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },

  // Next button
  nextBtn: {
    marginTop: 14,
    backgroundColor: THEME.ACCENT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.ACCENT,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  nextDisabled: {
    backgroundColor: "rgba(104,185,132,0.45)",
    borderColor: "rgba(104,185,132,0.45)",
  },
  nextIcon: { color: "#0B1220", fontSize: 16 },
  nextText: { color: "#0B1220", fontSize: 16, fontWeight: "800", letterSpacing: 0.2 },
});

/**
 * No-op default export so Expo Router won't complain
 * if this file sits under /app. It renders nothing.
 */
export default function __IGNORE_STYLES_ROUTE__() {
  return null;
}
