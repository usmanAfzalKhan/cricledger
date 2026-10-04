import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import { THEME } from "../../app/styles/home";

export type PickerOpt = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

type Props = {
  open: boolean;
  title: string;
  options: PickerOpt[];
  onClose: () => void;
  onSelect: (value: string | number) => void;
  requireChoice?: boolean;
};

export function PillPickerModal({
  open,
  title,
  options,
  onClose,
  onSelect,
  requireChoice = false,
}: Props) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!requireChoice) onClose();
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#000A",
          padding: 16,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(12,18,24,0.95)",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: THEME.BORDER,
            padding: 14,
            maxHeight: "80%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.92)",
                fontSize: 16,
                fontWeight: "900",
              }}
            >
              {title}
            </Text>

            {!requireChoice && (
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: pressed
                      ? "rgba(255,95,95,0.18)"
                      : "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: pressed
                      ? THEME.ACCENT
                      : "rgba(255,255,255,0.18)",
                  },
                ]}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                >
                  ✕
                </Text>
              </Pressable>
            )}
          </View>

          <ScrollView style={{ maxHeight: "70%" }}>
            <View style={{ gap: 10 }}>
              {options.map((option, index) => (
                <Pressable
                  key={`${option.value}-${index}`}
                  disabled={option.disabled}
                  onPress={() => onSelect(option.value)}
                  style={({ pressed }) => [
                    {
                      paddingVertical: 12,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: option.disabled
                        ? "rgba(255,255,255,0.04)"
                        : pressed
                        ? THEME.ACCENT
                        : "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor: option.disabled
                        ? "rgba(255,255,255,0.12)"
                        : pressed
                        ? THEME.ACCENT
                        : "rgba(255,255,255,0.14)",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: option.disabled
                        ? "rgba(255,255,255,0.45)"
                        : "#fff",
                      fontWeight: "800",
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {!requireChoice && (
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                {
                  marginTop: 12,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  backgroundColor: pressed
                    ? "rgba(255,255,255,0.16)"
                    : "rgba(255,255,255,0.09)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.16)",
                },
              ]}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "800",
                }}
              >
                Close
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}