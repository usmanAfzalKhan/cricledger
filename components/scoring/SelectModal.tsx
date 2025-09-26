import { FlatList, GestureResponderEvent, Modal, Pressable, Text, View } from "react-native";
import { styles as s } from "../../app/styles/scoring";

type Option = { label: string; value: string | number; disabled?: boolean };

export function SelectModal({
  open,
  title,
  options,
  onClose,
  onSelect,
}: {
  open: boolean;
  title: string;
  options: Option[];
  onClose: () => void;
  onSelect: (v: string | number) => void;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalBackdrop}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(o) => `${o.value}`}
            renderItem={({ item }) => (
              <Pressable
                style={[s.modalOption, item.disabled && s.btnDisabled]}
                onPress={(e: GestureResponderEvent) => {
                  if (item.disabled) return;
                  onSelect(item.value);
                }}
              >
                <Text style={s.modalOptionText}>{item.label}</Text>
              </Pressable>
            )}
          />
          <Pressable style={[s.btn, s.btnGhost]} onPress={onClose}>
            <Text style={s.btnText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
