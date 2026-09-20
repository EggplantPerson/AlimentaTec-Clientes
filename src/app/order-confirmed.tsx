import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatOrderDate, useOrdersStore } from "../store/orderStore";

// Pantalla de éxito tras realizar un pedido exitosamente
export default function OrderConfirmedScreen() {
  // Obtención del ID del pedido desde los parámetros de la URL
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  // Búsqueda del pedido correspondiente en la store de pedidos
  const order = useOrdersStore((state) =>
    state.orders.find((o) => o.id === orderId),
  );

  // Manejo de estado de en caso de no encontrar la orden
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
      {/* Ocultar la barra de navegación superior en esta pantalla de éxito */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Icono de confirmación exitosa */}
      <Ionicons
        name="checkmark-circle"
        size={72}
        color="#ffffff"
        style={styles.icon}
      />

      {/* Título de confirmación */}
      <Text style={styles.title}>¡Orden Confirmada!</Text>

      {/* Número asignado a la orden */}
      <Text style={styles.orderNumber}>N. de orden #{order.orderNumber}</Text>

      {/* Fecha y hora formateadas del momento de emisión */}
      <Text style={styles.date}>
        Enviada el {formatOrderDate(order.createdAt)}
      </Text>

      {/* Botón de redirección hacia el panel de seguimiento de notificaciones */}
      <Pressable
        style={styles.followButton}
        onPress={() => router.replace("/notifications")}
      >
        <Text style={styles.followButtonText}>Seguir mi orden</Text>
      </Pressable>
    </View>
  );
}

// Declaración de estilos para la vista de éxito
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
