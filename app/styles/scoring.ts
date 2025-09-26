import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  strip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#0F1317" },
  stripLine: { color: "#EAF2F8", fontSize: 16, fontWeight: "600" },
  stripSub: { color: "#A8B3BD", marginTop: 4, fontSize: 13 },

  stripRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: "#263140" },
  chipText: { color: "#EAF2F8", fontSize: 12, fontWeight: "600" },

  name: { color: "#EAF2F8", fontWeight: "700" },
  sep: { color: "#6A7786" },

  // Over card
  overCard: { margin: 16, padding: 12, borderRadius: 16, backgroundColor: "#141A20" },
  overTitle: { color: "#D6DEE6", fontWeight: "700", marginBottom: 8 },
  ballsRow: { flexDirection: "row", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  ballPip: {
    minWidth: 36, height: 36, borderRadius: 8, backgroundColor: "#1E2631",
    alignItems: "center", justifyContent: "center", paddingHorizontal: 8,
  },
  ballWicket: { backgroundColor: "#3A1F25" },
  ballText: { color: "#EAF2F8", fontWeight: "700" },
  overSubtle: { color: "#8EA0B3", fontSize: 12 },

  // Pad
  padCard: { margin: 16, padding: 12, borderRadius: 16, backgroundColor: "#141A20" },
  padRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginBottom: 10 },
  padBtn: { flexGrow: 1, minWidth: 64, paddingVertical: 14, borderRadius: 12, backgroundColor: "#2A73D6", alignItems: "center" },
  padBtnText: { color: "white", fontSize: 16, fontWeight: "800" },
  btn: { backgroundColor: "#2A73D6" },
  btnDanger: { backgroundColor: "#B2102F" },
  btnGhost: { backgroundColor: "#1E2631" },
  btnDisabled: { opacity: 0.5 },

  // Toast
  toast: {
    position: "absolute", top: 80, left: 16, right: 16,
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: "#101820EE",
  },
  toastText: { color: "#FFE174", textAlign: "center", fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: "#000A", alignItems: "center", justifyContent: "center", padding: 16 },
  modalCard: { width: "100%", maxWidth: 420, backgroundColor: "#0F1317", borderRadius: 16, padding: 16 },
  modalTitle: { color: "#EAF2F8", fontWeight: "800", fontSize: 18, marginBottom: 12 },
  modalOption: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#1B232C", marginBottom: 8 },
  modalOptionText: { color: "#EAF2F8", fontWeight: "700" },
  btnText: { color: "#fff", fontWeight: "800" },

  // Team sheets overlay
  sheetBackdrop: { position: "absolute", inset: 0, backgroundColor: "#000C" },
  sheetCard: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "#0F1317", paddingTop: 12 },
  sheetHeader: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { color: "#EAF2F8", fontSize: 18, fontWeight: "800" },
  sheetTabs: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  sheetTab: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#1E2631" },
  sheetTabActive: { backgroundColor: "#2A73D6" },
  sheetTabText: { color: "#EAF2F8", fontWeight: "700", fontSize: 12 },

  sheetBody: { flex: 1, padding: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  colH: { color: "#8EA0B3", fontWeight: "800" },
  col: { color: "#D6DEE6" },

  // Utility
  flexRow: { flexDirection: "row", alignItems: "center" },
  mr8: { marginRight: 8 },
});
