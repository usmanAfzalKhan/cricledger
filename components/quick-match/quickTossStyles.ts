import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 50,
    gap: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    backgroundColor: "rgba(12,18,24,0.65)",
  },

  backText: {
    color: "#EDEFE6",
    fontWeight: "800",
  },

  title: {
    color: "#EDEFE6",
    fontSize: 28,
    fontWeight: "900",
  },

  spacer: {
    width: 70,
  },

  card: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "rgba(12,18,24,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  sectionTitle: {
    color: "#EDEFE6",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  choice: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  choiceActive: {
    backgroundColor: "#68B984",
    borderColor: "#68B984",
  },

  choiceText: {
    color: "#EDEFE6",
    fontSize: 16,
    fontWeight: "800",
  },

  choiceTextActive: {
    color: "#0B1220",
  },

  note: {
    color: "rgba(237,239,230,0.75)",
    marginTop: 10,
    fontSize: 14,
  },

  coinCard: {
    alignItems: "center",
    padding: 22,
    borderRadius: 18,
    backgroundColor: "rgba(12,18,24,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  coin: {
    width: 190,
    height: 190,
    borderRadius: 95,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D9C06C",
    borderWidth: 8,
    borderColor: "#F3DE94",
  },

  coinText: {
    color: "#4E421D",
    fontSize: 28,
    fontWeight: "900",
  },

  hint: {
    marginTop: 14,
    color: "rgba(237,239,230,0.72)",
  },

  tossBtn: {
    marginTop: 16,
    width: "100%",
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#68B984",
  },

  tossBtnDisabled: {
    opacity: 0.4,
  },

  tossText: {
    color: "#0B1220",
    fontSize: 17,
    fontWeight: "900",
  },

  result: {
    marginTop: 16,
    color: "#EDEFE6",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },

  startBtn: {
    marginTop: 16,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#E53935",
  },

  startText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
});