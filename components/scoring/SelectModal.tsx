import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { styles as s } from "../../app/styles/scoring";

type Option = { label: string; value: string | number; disabled?: boolean };

export function SelectModal({
  open,
  title,
  options,
  onClose,
  onSelect,
  requireChoice = false, // ✅ when true, hide Close and disable backdrop/back button
}: {
  open: boolean;
  title: string;
  options: Option[];
  onClose: () => void;
  onSelect: (v: string | number) => void;
  requireChoice?: boolean;
}) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => { if (!requireChoice) onClose(); }}
    >
      <View style={s.modalBackdrop}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(o, idx) => `${o?.value ?? o?.label ?? "opt"}-${idx}`}
            renderItem={({ item }) => (
              <Pressable
                style={[s.modalOption, item.disabled && s.btnDisabled]}
                onPress={() => { if (!item.disabled) onSelect(item.value); }}
              >
                <Text style={s.modalOptionText}>{item.label}</Text>
              </Pressable>
            )}
          />
          {!requireChoice && (
            <Pressable style={[s.btn, s.btnGhost]} onPress={onClose}>
              <Text style={s.btnText}>Close</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
