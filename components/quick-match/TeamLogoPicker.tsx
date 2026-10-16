import * as ImagePicker from "expo-image-picker";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (
      !result.canceled &&
      result.assets?.[0]?.uri
    ) {
      onChange(result.assets[0].uri);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.card}>
        <View style={styles.logo}>
          {uri ? (
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <Text
                style={
                  styles.placeholderIcon
                }
              >
                🏏
              </Text>

              <Text
                style={
                  styles.placeholderText
                }
              >
                LOGO
              </Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title}>
            {uri
              ? "Team logo added"
              : "Add team logo"}
          </Text>

          <Text style={styles.subtitle}>
            Optional • Square images work best
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={styles.button}
              onPress={pickLogo}
            >
              <Text
                style={styles.buttonText}
              >
                {uri ? "Change" : "Choose Image"}
              </Text>
            </Pressable>

            {uri ? (
              <Pressable
                style={styles.removeButton}
                onPress={() =>
                  onChange("")
                }
              >
                <Text
                  style={styles.removeText}
                >
                  Remove
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
  },

  label: {
    color:
      "rgba(255,255,255,0.66)",

    fontSize: 11,
    fontWeight: "900",

    letterSpacing: 0.7,

    marginTop: 9,
    marginBottom: 8,
  },

  card: {
    minHeight: 84,

    flexDirection: "row",
    alignItems: "center",

    padding: 11,

    borderRadius: 17,

    backgroundColor:
      "rgba(255,255,255,0.04)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.085)",
  },

  logo: {
    width: 62,
    height: 62,

    borderRadius: 17,

    overflow: "hidden",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.11)",

    backgroundColor:
      "rgba(255,255,255,0.055)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    alignItems: "center",
  },

  placeholderIcon: {
    fontSize: 20,
  },

  placeholderText: {
    color:
      "rgba(255,255,255,0.38)",

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.8,

    marginTop: 2,
  },

  info: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 13,
    fontWeight: "900",
  },

  subtitle: {
    color:
      "rgba(255,255,255,0.42)",

    fontSize: 9,
    fontWeight: "600",

    marginTop: 2,
    marginBottom: 8,
  },

  actions: {
    flexDirection: "row",
    gap: 7,
  },

  button: {
    minHeight: 34,

    justifyContent: "center",

    paddingHorizontal: 11,

    borderRadius: 11,

    borderWidth: 1,
    borderColor:
      "rgba(120,215,154,0.30)",

    backgroundColor:
      "rgba(120,215,154,0.10)",
  },

  buttonText: {
    color: "#78D79A",

    fontSize: 10,
    fontWeight: "900",
  },

  removeButton: {
    minHeight: 34,

    justifyContent: "center",

    paddingHorizontal: 10,

    borderRadius: 11,

    borderWidth: 1,
    borderColor:
      "rgba(255,110,110,0.20)",

    backgroundColor:
      "rgba(255,80,80,0.07)",
  },

  removeText: {
    color: "#FF9C9C",

    fontSize: 10,
    fontWeight: "900",
  },
});
