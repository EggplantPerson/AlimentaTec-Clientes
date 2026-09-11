import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
    formatOrderDate,
    formatOrderNumber,
    useOrdersStore,
} from "../store/orderStore";

export default function OrderConfirmedScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = useOrdersStore((state) =>
    state.orders.find((o) => o.id === orderId),
  );

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.title}>Pedido no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Ionicons
        name="checkmark-circle"
        size={72}
        color="#ffffff"
        style={styles.icon}
      />

      <Text style={styles.title}>¡Orden Confirmada!</Text>

      <Text style={styles.orderNumber}>
        N. de orden {formatOrderNumber(order.orderNumber)}
      </Text>

      <Text style={styles.date}>
        Enviada el {formatOrderDate(order.createdAt)}
      </Text>

      <Pressable
        style={styles.followButton}
        onPress={() => router.replace("/notifications")}
      >
        <Text style={styles.followButtonText}>Seguir mi orden</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15803d",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
  },
  date: {
    fontSize: 14,
    color: "#dcfce7",
    marginBottom: 32,
  },
  followButton: {
    paddingVertical: 4,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    textDecorationLine: "underline",
  },
});
