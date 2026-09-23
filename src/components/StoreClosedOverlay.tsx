import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
    Keyboard,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useStoreStateStore } from "../store/storeStateStore";

export default function StoreClosedOverlay() {
  const isOpen = useStoreStateStore((s) => s.isOpen);
  const loading = useStoreStateStore((s) => s.loading);
  const loadStoreState = useStoreStateStore((s) => s.loadStoreState);

  // Si el teclado del buscador estaba abierto, lo cerramos
  useEffect(() => {
    if (!isOpen) Keyboard.dismiss();
  }, [isOpen]);

  if (isOpen) return null;

  return (
    <View style={styles.overlay}>
      <Ionicons name="storefront-outline" size={72} color="#15803d" />
      <Text style={styles.title}>La tienda está cerrada</Text>
      <Text style={styles.subtitle}>
        Por el momento no estamos recibiendo pedidos. Vuelve más tarde.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 100,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#14532d" },
  subtitle: { fontSize: 14, color: "#4d7c62", textAlign: "center" },
  button: {
    marginTop: 8,
    minWidth: 140,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#15803d",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
