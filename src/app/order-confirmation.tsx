import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { submitOrder } from "../services/orders.service";
import { useCartStore, useCartTotal } from "../store/cartStore";
import { useCanPlaceOrder, useOrdersStore } from "../store/orderStore";

// Pantalla de confirmación y revisión final de la orden antes del procesamiento
export default function OrderConfirmationScreen() {
  // Estado del carrito y total a pagar
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const orderNote = useCartStore((state) => state.orderNote);
  const total = useCartTotal();
  const addOrder = useOrdersStore((state) => state.addOrder);
  const { canOrder, pendingOrder } = useCanPlaceOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Proceso asíncrono para enviar la orden al servidor y actualizar las stores
  async function handleConfirmOrder() {
    if (!canOrder || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const id = Math.floor(Math.random() * 1000000000);

      const products: string[] = [];

      items.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          products.push(String(item.product.id));
        }
      });

      const createdOrder = await submitOrder({
        id,
        products,
        total,
        notes: orderNote.trim() || undefined,
      });

      const orderId = addOrder(
        createdOrder.uid,
        createdOrder.id,
        items,
        total,
        orderNote.trim(),
      );

      clearCart();

      router.replace(`/order-confirmed?orderId=${orderId}`);
    } catch (error) {
      console.log("Error al confirmar la orden:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Configuración de cabecera en el Stack Navigator */}
      <Stack.Screen
        options={{
          title: "Confirmar orden",
          headerStyle: { backgroundColor: "#15803d" },
          headerTitleStyle: { color: "#fafafa", fontWeight: "700" },
        }}
      />

      <View style={styles.content}>
        {/* Encabezado visual e indicativos */}
        <Ionicons name="checkmark-circle-outline" size={64} color="#15803d" />
        <Text style={styles.title}>Confirmar tu orden</Text>
        <Text style={styles.subtitle}>
          Tienes {items.length} producto{items.length !== 1 ? "s" : ""} en tu
          carrito.
        </Text>

        {/* Tarjeta con el desglose completo del pedido */}
        <View style={styles.summaryBox}>
          {items.map((item) => (
            <View key={item.product.id} style={styles.summaryItemBlock}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryItemName}>
                  {item.quantity}x {item.product.name}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Sumatoria total */}
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>

          {orderNote.trim() ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.noteLabel}>Nota del pedido</Text>
              <Text style={styles.noteText}>{orderNote}</Text>
            </>
          ) : null}
        </View>
      </View>

      {/* Botones de acción inferiores */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.confirmButton,
            (!canOrder || isSubmitting) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmOrder}
          disabled={!canOrder || isSubmitting}
        >
          <Text style={styles.confirmButtonText}>
            {isSubmitting
              ? "Enviando..."
              : canOrder
                ? "Confirmar orden"
                : "Ya tienes un pedido en curso"}
          </Text>
        </Pressable>

        {!canOrder && pendingOrder && (
          <Text style={styles.cooldownText}>
            No puedes hacer más pedidos hasta que se entregue tu pedido actual
            (estado: {pendingOrder.status}).
          </Text>
        )}

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver al carrito</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Declaración de estilos para la pantalla de confirmación
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#14532d",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#4d7c62",
    marginTop: 4,
    marginBottom: 20,
  },
  summaryBox: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  summaryItemBlock: {
    marginBottom: 8,
  },
  summaryItemName: {
    fontSize: 14,
    color: "#14532d",
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#15803d",
  },
  divider: {
    height: 1,
    backgroundColor: "#dcfce7",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#14532d",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#15803d",
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14532d",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: "#4d7c62",
    fontStyle: "italic",
  },
  footer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#dcfce7",
    gap: 8,
  },
  confirmButton: {
    alignItems: "center",
    backgroundColor: "#15803d",
    borderRadius: 10,
    padding: 14,
  },
  confirmButtonDisabled: {
    backgroundColor: "#a7c4b3",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cooldownText: {
    fontSize: 12,
    color: "#b91c1c",
    textAlign: "center",
    marginTop: 8,
  },
  backButton: {
    alignItems: "center",
    padding: 10,
  },
  backButtonText: {
    color: "#4d7c62",
    fontWeight: "600",
    fontSize: 13,
  },
});
