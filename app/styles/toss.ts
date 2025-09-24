// app/styles/toss.ts
import { StyleSheet } from "react-native";
import { THEME } from "../styles/home";

export const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    minHeight: "100%",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backLink: {
    color: THEME.TEXT_MUTED,
    fontSize: 14,
    fontWeight: "800",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  title: { color: THEME.TEXT, fontSize: 18, fontWeight: "900", letterSpacing: 0.3 },
  headerSpacer: { width: 56 },

  // Cards & sections
  card: {
    padding: 14,
    backgroundColor: "rgba(12,18,24,0.65)",
    borderWidth: 1,
    borderColor: THEME.BORDER,
    borderRadius: 16,
    marginTop: 12,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },

  // Pills (caller + call)
  pillsRow: { flexDirection: "row", gap: 10 },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  pillActive: { backgroundColor: THEME.ACCENT, borderColor: THEME.ACCENT },
  pillText: { color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "700", letterSpacing: 1 },
  pillTextActive: { color: "#0b0f14" },

  // Coin card
  coinCard: {
    marginTop: 12,
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: "rgba(12,18,24,0.65)",
    borderWidth: 1,
    borderColor: THEME.BORDER,
    borderRadius: 16,
    alignItems: "center",
  },
  coinPress: { borderRadius: 999, padding: 8 },
  coinPressPressed: { opacity: 0.9 },
  coinWrap: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  face: {
    position: "absolute",
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    // 🔧 Remove backfaceVisibility to avoid Android hiding the TAILS face
    // backfaceVisibility: "hidden",
  },
  // rotateY so the backside text reads correctly during rotateY animation
  faceBack: { transform: [{ rotateY: "180deg" }] },

  hint: { marginTop: 10, color: "rgba(255,255,255,0.75)", fontSize: 12 },

  // Buttons
  tossBtn: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: THEME.ACCENT,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  tossBtnDisabled: { opacity: 0.6 },
  tossBtnText: { color: "#0b0f14", fontSize: 16, fontWeight: "800" },

  // Result chip
  resultChip: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  resultText: { color: "white", fontSize: 14, fontWeight: "700" },

  // Winner actions
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  actionBtnPrimary: { backgroundColor: THEME.ACCENT, borderColor: THEME.ACCENT },
  actionBtnGhost: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.14)" },
  actionTextPrimary: { color: "#0b0f14", fontWeight: "900" },
  actionTextGhost: { color: "rgba(255,255,255,0.95)", fontWeight: "900" },

  smallNote: { marginTop: 8, color: "rgba(255,255,255,0.7)", fontSize: 12 },

  bottomSpace: { height: 28 },
});

export { styles as s };
export default function __IGNORE_STYLES_ROUTE__() {
  return null;
}
