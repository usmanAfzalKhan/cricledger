import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screenContent: {
    padding: 16,
    paddingBottom: 42,
    gap: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#EDEFE6",
    fontSize: 20,
    fontWeight: "900",
  },

  inningText: {
    color: "rgba(237,239,230,0.7)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(12,18,24,0.7)",
  },

  backText: {
    color: "#EDEFE6",
    fontWeight: "800",
  },

  headerSpacer: {
    width: 66,
  },

  scoreCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: "rgba(12,18,24,0.84)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  teamName: {
    color: "#EDEFE6",
    fontSize: 20,
    fontWeight: "900",
    flex: 1,
  },

  battingLabel: {
    color: "#68B984",
    fontSize: 12,
    fontWeight: "900",
  },

  scoreMain: {
    color: "#FFFFFF",
    fontSize: 54,
    lineHeight: 62,
    fontWeight: "900",
    marginTop: 14,
  },

  scoreMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },

  metaBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 11,
  },

  metaLabel: {
    color: "rgba(237,239,230,0.6)",
    fontSize: 11,
    fontWeight: "700",
  },

  metaValue: {
    color: "#EDEFE6",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },

  chaseBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(104,185,132,0.12)",
    borderWidth: 1,
    borderColor: "rgba(104,185,132,0.4)",
  },

  chaseText: {
    color: "#EDEFE6",
    fontWeight: "800",
    textAlign: "center",
  },

  statusBox: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(255,193,7,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.45)",
  },

  statusText: {
    color: "#FFE082",
    textAlign: "center",
    fontWeight: "900",
  },

  overCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(12,18,24,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  sectionTitle: {
    color: "#EDEFE6",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },

  muted: {
    color: "rgba(237,239,230,0.58)",
  },

  pipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  pip: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  wicketPip: {
    backgroundColor: "rgba(229,57,53,0.28)",
    borderColor: "#E53935",
  },

  extraPip: {
    backgroundColor: "rgba(104,185,132,0.18)",
    borderColor: "#68B984",
  },

  pipText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  padCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(12,18,24,0.84)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 10,
  },

  wicketButton: {
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53935",
  },

  wicketButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  runGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  runButton: {
    width: "22.5%",
    minWidth: 65,
    height: 52,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  runButtonText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  extraRow: {
    flexDirection: "row",
    gap: 8,
  },

  extraButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#68B984",
    backgroundColor: "rgba(104,185,132,0.08)",
  },

  extraButtonActive: {
    backgroundColor: "rgba(104,185,132,0.28)",
  },

  extraButtonText: {
    color: "#EDEFE6",
    fontWeight: "900",
  },

  extraPicker: {
    padding: 12,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  extraPickerTitle: {
    color: "#EDEFE6",
    fontWeight: "800",
    marginBottom: 10,
  },

  extraPickerRow: {
    flexDirection: "row",
    gap: 7,
  },

  extraAmountButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#68B984",
  },

  extraAmountText: {
    color: "#0B1220",
    fontWeight: "900",
  },

  cancelExtra: {
    alignSelf: "center",
    padding: 8,
    marginTop: 5,
  },

  cancelExtraText: {
    color: "rgba(237,239,230,0.7)",
    fontWeight: "700",
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
  },

  undoButton: {
    flex: 1,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(229,57,53,0.22)",
    borderWidth: 1,
    borderColor: "#E53935",
  },

  endButton: {
    flex: 1.4,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#68B984",
  },

  actionText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.35,
  },

  breakCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(12,18,24,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  bigTarget: {
    color: "#68B984",
    fontSize: 48,
    fontWeight: "900",
    textAlign: "center",
  },

  centeredText: {
    color: "#EDEFE6",
    textAlign: "center",
    fontSize: 16,
  },

  inputLabel: {
    color: "#EDEFE6",
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 8,
  },

  input: {
    color: "#FFFFFF",
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.07)",
    fontSize: 18,
    fontWeight: "800",
  },

  primaryButton: {
    height: 54,
    marginTop: 18,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#68B984",
  },

  primaryButtonText: {
    color: "#0B1220",
    fontSize: 16,
    fontWeight: "900",
  },

  resultTitle: {
    color: "#68B984",
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
  },

  resultScore: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
});