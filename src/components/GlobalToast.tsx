import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "../store/toastStore";

// Pop-up visual que aparece sobre cualquier pantalla cuando hay un mensaje activo
export default function GlobalToast() {
  const message = useToastStore((state) => state.message);
  const hideToast = useToastStore((state) => state.hideToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <View
      style={[styles.container, { top: insets.top + 12 }]}
      pointerEvents="none"
    >
      <View style={styles.toast}>
        <View style={styles.iconCircle}>
          <Ionicons name="notifications" size={26} color="#ffffff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.toastTitle}>Actualización de tu pedido</Text>
          <Text style={styles.toastText}>{message}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#15803d",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    maxWidth: "100%",
    width: "100%",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    color: "#dcfce7",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  toastText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
