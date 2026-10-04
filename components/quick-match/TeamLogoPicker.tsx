import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  uri: string;
  onChange: (uri: string) => void;
};

export default function TeamLogoPicker({
  label,
  uri,
  onChange,
}: Props) {
  async function pickLogo() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        <View style={styles.logo}>
          {uri ? (
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.noLogo}>no logo</Text>
          )}
        </View>

        <Pressable style={styles.button} onPress={pickLogo}>
          <Text style={styles.buttonText}>
            {uri ? "Change Logo" : "Add Logo"}
          </Text>
        </Pressable>

        {uri ? (
          <Pressable
            style={styles.removeButton}
            onPress={() => onChange("")}
          >
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#EDEFE6",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  noLogo: {
    color: "rgba(237,239,230,0.55)",
    fontSize: 10,
  },

  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  buttonText: {
    color: "#EDEFE6",
    fontWeight: "800",
  },

  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E53935",
    backgroundColor: "rgba(229,57,53,0.16)",
  },

  removeText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});