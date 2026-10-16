import * as ImagePicker from "expo-image-picker";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Props = {
  label: string;

  teamName: string;
  onTeamNameChange: (value: string) => void;

  logoUri: string;
  onLogoChange: (uri: string) => void;

  playerCount?: string;
  onPlayerCountChange?: (value: string) => void;

  showPlayerCount?: boolean;
};

export default function TeamEntry({
  label,
  teamName,
  onTeamNameChange,
  logoUri,
  onLogoChange,
  playerCount = "",
  onPlayerCountChange,
  showPlayerCount = false,
}: Props) {
  async function pickLogo() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      onLogoChange(result.assets[0].uri);
    }
  }

  return (
    <View style={s.section}>
      <View style={s.labelRow}>
        <Text style={s.eyebrow}>{label}</Text>

        <Text style={s.optional}>Logo optional</Text>
      </View>

      <View style={s.row}>
        <Pressable onPress={pickLogo} style={s.logoButton}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={s.logo} />
          ) : (
            <>
              <Text style={s.logoIcon}>+</Text>

              <Text style={s.logoText}>LOGO</Text>
            </>
          )}
        </Pressable>

        <View style={s.fields}>
          <Text style={s.fieldLabel}>Team name</Text>

          <TextInput
            value={teamName}
            onChangeText={onTeamNameChange}
            placeholder="Enter team name"
            placeholderTextColor="rgba(255,255,255,0.28)"
            autoCapitalize="words"
            style={s.input}
          />

          {showPlayerCount ? (
            <>
              <Text style={[s.fieldLabel, { marginTop: 14 }]}>Players</Text>

              <TextInput
                value={playerCount}
                onChangeText={(value) =>
                  onPlayerCountChange?.(value.replace(/[^0-9]/g, ""))
                }
                placeholder="11"
                placeholderTextColor="rgba(255,255,255,0.28)"
                keyboardType="number-pad"
                style={s.input}
              />
            </>
          ) : null}
        </View>
      </View>

      {logoUri ? (
        <Pressable onPress={() => onLogoChange("")} style={s.remove}>
          <Text style={s.removeText}>Remove logo</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  section: {
    paddingVertical: 18,

    borderBottomWidth: 1,

    borderBottomColor: "rgba(255,255,255,0.07)",
  },

  labelRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 15,
  },

  eyebrow: {
    color: "#79D99C",

    fontSize: 10,

    fontWeight: "900",

    letterSpacing: 1.6,
  },

  optional: {
    color: "rgba(255,255,255,0.31)",

    fontSize: 9,

    fontWeight: "700",
  },

  row: {
    flexDirection: "row",

    alignItems: "flex-start",
  },

  logoButton: {
    width: 74,
    height: 74,

    borderRadius: 37,

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",

    marginRight: 16,

    backgroundColor: "rgba(255,255,255,0.045)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.12)",
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  logoIcon: {
    color: "#79D99C",

    fontSize: 22,

    fontWeight: "400",

    lineHeight: 23,
  },

  logoText: {
    color: "rgba(255,255,255,0.34)",

    fontSize: 7,

    fontWeight: "900",

    letterSpacing: 0.8,

    marginTop: 3,
  },

  fields: {
    flex: 1,
  },

  fieldLabel: {
    color: "rgba(255,255,255,0.43)",

    fontSize: 9,

    fontWeight: "900",

    letterSpacing: 1.1,

    marginBottom: 6,
  },

  input: {
    minHeight: 48,

    color: "#FFFFFF",

    fontSize: 17,

    fontWeight: "800",

    paddingVertical: 8,

    paddingHorizontal: 0,

    borderBottomWidth: 1,

    borderBottomColor: "rgba(255,255,255,0.16)",
  },

  remove: {
    alignSelf: "flex-start",

    marginTop: 10,

    marginLeft: 90,
  },

  removeText: {
    color: "rgba(255,125,125,0.72)",

    fontSize: 10,

    fontWeight: "800",
  },
});
