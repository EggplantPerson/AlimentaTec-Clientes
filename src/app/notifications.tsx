import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { deleteOrder } from "../services/orders.service";
import { Order, OrderStatus, useOrdersStore } from "../store/orderStore";
import { useToastStore } from "../store/toastStore";

// Mapeo de colores visuales para cada estado del pedido
const STATUS_COLORS: Record<OrderStatus, { background: string; text: string }> =
  {
    Pendiente: { background: "#fef3c7", text: "#92400e" },
    "En preparación": { background: "#dbeafe", text: "#1e40af" },
    Listo: { background: "#dcfce7", text: "#166534" },
    Entregado: { background: "#e5e5e5", text: "#525252" },
  };

// Función auxiliar para dar formato a la hora de creación del pedido
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Pantalla para mostrar las notificaciones e historial de pedidos del usuario
export default function NotificationsScreen() {
  // Obtención del historial de pedidos almacenado en la store
  const orders = useOrdersStore((state) => state.orders);
  const removeOrder = useOrdersStore((state) => state.removeOrder);

  // Id del pedido que se está cancelando actualmente (para deshabilitar su botón mientras carga)
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleCancelPress = (order: Order) => {
    Alert.alert(
      "Cancelar pedido",
      `¿Seguro que quieres cancelar el pedido ${"#" + String(order.orderNumber).padStart(8, "0")}? Esta acción no se puede deshacer.`,
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: () => handleConfirmCancel(order),
        },
      ],
    );
  };

  const handleConfirmCancel = async (order: Order) => {
    setCancelingId(order.id);
    try {
      await deleteOrder(order.uid);
      removeOrder(order.id);
      useToastStore.getState().showToast("Pedido cancelado");
    } catch (e) {
      console.log("No se pudo cancelar el pedido:", e);
      Alert.alert(
        "No se pudo cancelar",
        "Ocurrió un error al cancelar el pedido. Intenta de nuevo.",
      );
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Configuración de la barra de navegación superior */}
      <Stack.Screen
        options={{
          title: "Notificaciones",
          headerStyle: { backgroundColor: "#15803d" },
          headerTitleStyle: { color: "#fafafa", fontWeight: "700" },
          headerTintColor: "#fafafa",
        }}
      />

      {/* Listado dinámico de pedidos */}
      <FlatList
        data={orders}
        keyExtractor={(order) => order.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={48} color="#a7c4b3" />
            <Text style={styles.emptyText}>No tienes pedidos todavía.</Text>
          </View>
        }
        renderItem={({ item }: { item: Order }) => {
          const colors = STATUS_COLORS[item.status];
          const canCancel = item.status === "Pendiente";
          const isCanceling = cancelingId === item.id;

          return (
            <View style={styles.card}>
              {/* Identificador abreviado del pedido y hora de realización */}
              <View style={styles.cardHeader}>
                <Text style={styles.orderTitle}>
                  Pedido #{item.orderNumber}
                </Text>
                <Text style={styles.orderTime}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>

              {/* Resumen concatenado de productos incluidos */}
              <Text style={styles.itemsSummary} numberOfLines={2}>
                {item.items
                  .map(
                    (orderItem) => `${orderItem.quantity}x ${orderItem.name}`,
                  )
                  .join(", ")}
              </Text>

              {/* Monto total e indicador dinámico de estado del pedido */}
              <View style={styles.cardFooter}>
                <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Botón de cancelar: solo visible mientras el pedido está en espera */}
              {canCancel && (
                <Pressable
                  style={[
                    styles.cancelButton,
                    isCanceling && styles.cancelButtonDisabled,
                  ]}
                  onPress={() => handleCancelPress(item)}
                  disabled={isCanceling}
                >
                  {isCanceling ? (
                    <ActivityIndicator color="#b91c1c" size="small" />
                  ) : (
                    <Text style={styles.cancelButtonText}>Cancelar pedido</Text>
                  )}
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

// Hojas de estilos del componente de notificaciones
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#4d7c62",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#14532d",
  },
  orderTime: {
    fontSize: 12,
    color: "#4d7c62",
  },
  itemsSummary: {
    fontSize: 13,
    color: "#555",
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: "#15803d",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cancelButton: {
    marginTop: 10,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: "#b91c1c",
    fontWeight: "700",
    fontSize: 13,
  },
});
