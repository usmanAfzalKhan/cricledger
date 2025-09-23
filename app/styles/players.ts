import { Platform, StyleSheet } from "react-native";
import { THEME } from "../styles/home"; // adjust if you later move THEME

export const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 28, minHeight: "100%", gap: 16 },

  // Header
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
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

  title: { color: THEME.TEXT, fontSize: 18, fontWeight: "800", letterSpacing: 0.3 },
  skipBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: THEME.BORDER,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  skipText: { color: THEME.TEXT_MUTED, fontWeight: "700" },

  // Team card
  teamCard: {
    backgroundColor: "rgba(12,18,24,0.65)",
    borderWidth: 1,
    borderColor: THEME.BORDER,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  teamHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  teamNameWrap: { flexDirection: "column", gap: 2 },
  teamName: { color: THEME.TEXT, fontSize: 20, fontWeight: "900", letterSpacing: 0.2 },
  teamMeta: { color: THEME.TEXT_MUTED, fontSize: 12 },

  // Inputs / list
  inputRow: { flexDirection: "row", gap: 8 },
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
  grow: { flex: 1 },

  list: { gap: 8 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  nameAndBadge: { flexDirection: "row", alignItems: "center", flex: 1 },
  itemText: { color: THEME.TEXT, fontSize: 16, flexShrink: 1 },
  itemActions: { flexDirection: "row", gap: 8, marginLeft: 12 },

  // Small buttons
  smallBtn: {
    backgroundColor: THEME.ACCENT,
    borderColor: THEME.ACCENT,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnGhost: {
    backgroundColor: "transparent",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  smallIconText: { color: "#0B1220", fontSize: 13, fontWeight: "900" },
  smallGhostIconText: { color: THEME.TEXT, fontSize: 14, fontWeight: "900" },

  // Captain "C" badge
  captainBadge: {
    marginLeft: 10,
    color: THEME.TEXT,
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.BORDER,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },

  // Continue
  nextBtn: {
    marginTop: 4,
    backgroundColor: THEME.ACCENT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.ACCENT,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    opacity: 1,
  },
  nextBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  nextIcon: { color: "#0B1220", fontSize: 16 },
  nextText: { color: "#0B1220", fontSize: 16, fontWeight: "800", letterSpacing: 0.2 },
});
