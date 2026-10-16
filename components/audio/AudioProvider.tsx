import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { setAudioModeAsync, useAudioPlayer } from "expo-audio";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    AppState,
    AppStateStatus,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const MUSIC_KEY = "cricledger_music_enabled_v2";

const SFX_KEY = "cricledger_sfx_enabled_v2";

type AudioContextValue = {
  musicEnabled: boolean;
  sfxEnabled: boolean;

  toggleMusic: () => void;
  toggleSfx: () => void;

  playBoundary: () => void;
  playWicket: () => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function useCricAudio() {
  const value = useContext(AudioContext);

  if (!value) {
    throw new Error("useCricAudio must be used inside AudioProvider");
  }

  return value;
}

export default function AudioProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  const music = useAudioPlayer(
    require("../../assets/audio/but-i-feel-good.mp3"),
  );

  const boundary = useAudioPlayer(require("../../assets/audio/boundary.mp3"), {
    keepAudioSessionActive: true,
  });

  const wicket = useAudioPlayer(require("../../assets/audio/wicket.mp3"), {
    keepAudioSessionActive: true,
  });

  const [musicEnabled, setMusicEnabled] = useState(true);

  const [sfxEnabled, setSfxEnabled] = useState(true);

  const [ready, setReady] = useState(false);

  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );

  const musicEnabledRef = useRef(true);

  const sfxEnabledRef = useRef(true);

  useEffect(() => {
    musicEnabledRef.current = musicEnabled;
  }, [musicEnabled]);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
  }, [sfxEnabled]);

  /*
   * Let calls / alarms / system audio
   * take priority.
   *
   * We do NOT keep CricLedger audio
   * alive in the background.
   */
  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: false,

      shouldPlayInBackground: false,

      interruptionMode: "doNotMix",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      music.loop = true;
      music.volume = 0.34;

      boundary.volume = 0.9;
      wicket.volume = 0.95;
    } catch {}
  }, [music, boundary, wicket]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [musicValue, sfxValue] = await Promise.all([
          AsyncStorage.getItem(MUSIC_KEY),

          AsyncStorage.getItem(SFX_KEY),
        ]);

        if (cancelled) return;

        const nextMusic = musicValue !== "0";

        const nextSfx = sfxValue !== "0";

        musicEnabledRef.current = nextMusic;

        sfxEnabledRef.current = nextSfx;

        setMusicEnabled(nextMusic);

        setSfxEnabled(nextSfx);
      } catch {
        // Audio settings should
        // never break scoring.
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Music follows the app state.
   *
   * Call/background:
   * pause.
   *
   * Return to CricLedger:
   * resume only if user left
   * music enabled.
   */
  useEffect(() => {
    if (!ready) return;

    try {
      if (musicEnabled && appState === "active") {
        music.play();
      } else {
        music.pause();
      }
    } catch {}
  }, [musicEnabled, appState, ready, music]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      setAppState(next);

      if (next !== "active") {
        try {
          music.pause();
        } catch {}
      }
    });

    return () => {
      subscription.remove();
    };
  }, [music]);

  const toggleMusic = useCallback(() => {
    setMusicEnabled((current) => {
      const next = !current;

      musicEnabledRef.current = next;

      void AsyncStorage.setItem(MUSIC_KEY, next ? "1" : "0").catch(() => {});

      try {
        if (next && AppState.currentState === "active") {
          music.play();
        } else {
          music.pause();
        }
      } catch {}

      return next;
    });
  }, [music]);

  const toggleSfx = useCallback(() => {
    setSfxEnabled((current) => {
      const next = !current;

      sfxEnabledRef.current = next;

      void AsyncStorage.setItem(SFX_KEY, next ? "1" : "0").catch(() => {});

      return next;
    });
  }, []);

  const playBoundary = useCallback(() => {
    if (!sfxEnabledRef.current) {
      return;
    }

    void (async () => {
      try {
        await boundary.seekTo(0);

        boundary.play();
      } catch {}
    })();
  }, [boundary]);

  const playWicket = useCallback(() => {
    if (!sfxEnabledRef.current) {
      return;
    }

    void (async () => {
      try {
        await wicket.seekTo(0);

        wicket.play();
      } catch {}
    })();
  }, [wicket]);

  return (
    <AudioContext.Provider
      value={{
        musicEnabled,
        sfxEnabled,

        toggleMusic,
        toggleSfx,

        playBoundary,
        playWicket,
      }}
    >
      {children}

      {ready ? (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <Pressable
            accessibilityLabel={musicEnabled ? "Pause music" : "Play music"}
            onPress={toggleMusic}
            style={({ pressed }) => [
              s.musicButton,

              {
                top: insets.top + 8,
              },

              pressed && s.pressed,
            ]}
          >
            <View style={[s.dot, musicEnabled && s.dotOn]} />

            <Ionicons
              name={musicEnabled ? "pause" : "play"}
              size={14}
              color="#FFFFFF"
            />

            <Ionicons
              name="musical-notes-outline"
              size={14}
              color={musicEnabled ? "#79D99C" : "rgba(255,255,255,0.45)"}
            />
          </Pressable>
        </View>
      ) : null}
    </AudioContext.Provider>
  );
}

const s = StyleSheet.create({
  musicButton: {
    position: "absolute",

    right: 12,

    zIndex: 10000,

    elevation: 30,

    height: 38,

    minWidth: 58,

    paddingHorizontal: 10,

    borderRadius: 20,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 6,

    backgroundColor: "rgba(5,17,24,0.94)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.11)",
  },

  pressed: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  dot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "rgba(255,255,255,0.25)",
  },

  dotOn: {
    backgroundColor: "#79D99C",
  },
});
