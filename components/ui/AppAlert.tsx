import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

type AlertOptions = {
  cancelable?: boolean;
  onDismiss?: () => void;
};

type AlertPayload = {
  title: string;
  message: string;
  buttons: AlertButton[];
  options?: AlertOptions;
};

type Listener = (payload: AlertPayload) => void;

let listener: Listener | null = null;

export const Alert = {
  alert(
    title = "",
    message = "",
    buttons?: AlertButton[],
    options?: AlertOptions,
  ) {
    listener?.({
      title,
      message,
      buttons: buttons ?? [],
      options,
    });
  },
};

export function AppAlertHost() {
  const [dialog, setDialog] = useState<AlertPayload | null>(null);

  const [toast, setToast] = useState<AlertPayload | null>(null);

  const dialogOpacity = useRef(new Animated.Value(0)).current;

  const dialogY = useRef(new Animated.Value(40)).current;

  const toastOpacity = useRef(new Animated.Value(0)).current;

  const toastY = useRef(new Animated.Value(-16)).current;

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handle: Listener = (payload) => {
      /*
       * No buttons = information only.
       * Show it like an in-game notification
       * instead of blocking the screen.
       */
      if (!payload.buttons || payload.buttons.length === 0) {
        showToast(payload);
        return;
      }

      showDialog(payload);
    };

    listener = handle;

    return () => {
      if (listener === handle) {
        listener = null;
      }

      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  function showToast(payload: AlertPayload) {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast(payload);

    toastOpacity.stopAnimation();
    toastY.stopAnimation();

    toastOpacity.setValue(0);
    toastY.setValue(-16);

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.spring(toastY, {
        toValue: 0,
        speed: 22,
        bounciness: 3,
        useNativeDriver: true,
      }),
    ]).start();

    toastTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),

        Animated.timing(toastY, {
          toValue: -10,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setToast(null));
    }, 1900);
  }

  function showDialog(payload: AlertPayload) {
    setDialog(payload);

    dialogOpacity.setValue(0);
    dialogY.setValue(40);

    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(dialogOpacity, {
          toValue: 1,
          duration: 170,
          useNativeDriver: true,
        }),

        Animated.spring(dialogY, {
          toValue: 0,
          speed: 20,
          bounciness: 3,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  function closeDialog(button?: AlertButton) {
    const current = dialog;

    Animated.parallel([
      Animated.timing(dialogOpacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),

      Animated.timing(dialogY, {
        toValue: 25,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDialog(null);

      button?.onPress?.();

      if (!button) {
        current?.options?.onDismiss?.();
      }
    });
  }

  function cancelDialog() {
    if (!dialog) return;

    if (dialog.options?.cancelable === false) {
      return;
    }

    const cancel = dialog.buttons.find((button) => button.style === "cancel");

    closeDialog(cancel);
  }

  return (
    <>
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            s.toastWrap,
            {
              opacity: toastOpacity,

              transform: [
                {
                  translateY: toastY,
                },
              ],
            },
          ]}
        >
          <View style={s.toast}>
            <View style={s.toastMarker} />

            <View style={{ flex: 1 }}>
              <Text style={s.toastTitle}>{toast.title}</Text>

              {toast.message ? (
                <Text style={s.toastMessage}>{toast.message}</Text>
              ) : null}
            </View>
          </View>
        </Animated.View>
      ) : null}

      <Modal
        transparent
        visible={!!dialog}
        animationType="none"
        statusBarTranslucent
        onRequestClose={cancelDialog}
      >
        <View style={s.modalRoot}>
          <Animated.View
            pointerEvents="none"
            style={[
              s.backdrop,
              {
                opacity: dialogOpacity,
              },
            ]}
          />

          <Pressable style={StyleSheet.absoluteFill} onPress={cancelDialog} />

          {dialog ? (
            <Animated.View
              style={[
                s.sheet,
                {
                  opacity: dialogOpacity,

                  transform: [
                    {
                      translateY: dialogY,
                    },
                  ],
                },
              ]}
            >
              <View style={s.sheetAccent} />

              <Text style={s.sheetKicker}>CRICLEDGER</Text>

              <Text style={s.sheetTitle}>{dialog.title}</Text>

              {dialog.message ? (
                <Text style={s.sheetMessage}>{dialog.message}</Text>
              ) : null}

              <View style={s.actions}>
                {dialog.buttons.map((button, index) => (
                  <Pressable
                    key={button.text ?? String(index)}
                    onPress={() => closeDialog(button)}
                    style={({ pressed }) => [
                      s.action,

                      index > 0 && s.actionBorder,

                      pressed && s.actionPressed,
                    ]}
                  >
                    <Text
                      style={[
                        s.actionText,

                        button.style === "cancel" && s.cancelText,

                        button.style === "destructive" && s.destructiveText,
                      ]}
                    >
                      {button.text ?? "OK"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  toastWrap: {
    position: "absolute",

    top: 50,
    left: 16,
    right: 16,

    zIndex: 9999,
    elevation: 9999,
  },

  toast: {
    minHeight: 66,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 15,
    paddingVertical: 12,

    borderRadius: 18,

    backgroundColor: "rgba(5,17,24,0.97)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.10)",
  },

  toastMarker: {
    width: 3,
    height: 35,

    borderRadius: 3,

    marginRight: 12,

    backgroundColor: "#79D99C",
  },

  toastTitle: {
    color: "#FFFFFF",

    fontSize: 14,

    fontWeight: "900",
  },

  toastMessage: {
    color: "rgba(255,255,255,0.52)",

    fontSize: 10,

    lineHeight: 15,

    marginTop: 3,
  },

  modalRoot: {
    flex: 1,

    justifyContent: "flex-end",

    paddingHorizontal: 14,
    paddingBottom: 18,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(0,0,0,0.72)",
  },

  sheet: {
    width: "100%",
    maxWidth: 500,

    alignSelf: "center",

    overflow: "hidden",

    borderRadius: 24,

    backgroundColor: "#07171E",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.11)",

    elevation: 20,
  },

  sheetAccent: {
    height: 3,

    backgroundColor: "#79D99C",
  },

  sheetKicker: {
    color: "#79D99C",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1.8,

    marginTop: 20,
    marginHorizontal: 20,
  },

  sheetTitle: {
    color: "#FFFFFF",

    fontSize: 23,

    fontWeight: "900",

    letterSpacing: -0.4,

    marginTop: 5,
    marginHorizontal: 20,
  },

  sheetMessage: {
    color: "rgba(255,255,255,0.53)",

    fontSize: 12,

    lineHeight: 18,

    marginTop: 7,
    marginHorizontal: 20,

    marginBottom: 12,
  },

  actions: {
    marginTop: 8,

    borderTopWidth: 1,

    borderTopColor: "rgba(255,255,255,0.07)",
  },

  action: {
    minHeight: 58,

    justifyContent: "center",

    paddingHorizontal: 20,
  },

  actionBorder: {
    borderTopWidth: 1,

    borderTopColor: "rgba(255,255,255,0.06)",
  },

  actionPressed: {
    backgroundColor: "rgba(121,217,156,0.08)",
  },

  actionText: {
    color: "#79D99C",

    fontSize: 14,

    fontWeight: "900",
  },

  cancelText: {
    color: "rgba(255,255,255,0.52)",
  },

  destructiveText: {
    color: "#FF7D84",
  },
});
