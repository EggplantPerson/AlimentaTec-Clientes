import { router, Stack } from "expo-router";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    MAX_QUANTITY_PER_PRODUCT,
    MAX_TOTAL_ITEMS,
    useCartStore,
    useCartTotal,
} from "../store/cartStore";
import { useCanPlaceOrder } from "../store/orderStore";

// Componente para visualizar y gestionar el carrito de compras
export default function CartScreen() {
  // Selectores para obtener los productos y acciones del store
  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const orderNote = useCartStore((state) => state.orderNote);
  const setOrderNote = useCartStore((state) => state.setOrderNote);

  // Cálculo del monto total acumulado
  const total = useCartTotal();

  // Conteo total de unidades agregadas para validar límites
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const reachedTotalLimit = totalItems >= MAX_TOTAL_ITEMS;

  const { canOrder, pendingOrder } = useCanPlaceOrder();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Opciones del header navegable con Expo Router */}
      <Stack.Screen
        options={{
          title: "Carrito",
          headerStyle: { backgroundColor: "#15803d" },
          headerTitleStyle: { color: "#fafafa", fontWeight: "700" },
        }}
      />

      {/* Controles superiores cuando el carrito contiene ítems */}
      {items.length > 0 && (
        <View style={styles.topRow}>
          <Pressable style={styles.clearButton} onPress={clearCart}>
            <Text style={styles.clearButtonText}>Vaciar carrito</Text>
          </Pressable>
          {reachedTotalLimit && (
            <Text style={styles.totalLimitText}>
              Alcanzaste el máximo de {MAX_TOTAL_ITEMS} productos por pedido.
            </Text>
          )}
        </View>
      )}

      {/* Vista de estado vacío */}
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>¿Quieres pedir algo? Añadelo!</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Ver productos</Text>
          </Pressable>
        </View>
      ) : (
        /* Vista con la lista de productos agregados */
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.lineId}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const reachedLimit =
                item.quantity >= MAX_QUANTITY_PER_PRODUCT || reachedTotalLimit;
              // Precio unitario real de esta línea: producto + adicional elegido (si hay)
              const unitPrice = item.product.price + (item.addon?.price ?? 0);

              return (
                <View style={styles.itemRow}>
                  {/* Miniatura de la imagen del producto */}
                  <Image
                    source={{ uri: item.product.image }}
                    style={styles.itemImage}
                  />

                  {/* Información y detalles del ítem */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.product.name}
                    </Text>

                    {/* Adicional elegido para esta línea, si hay */}
                    {item.addon && (
                      <Text style={styles.itemAddon} numberOfLines={1}>
                        + {item.addon.name} (+${item.addon.price})
                      </Text>
                    )}

                    <Text style={styles.itemPrice}>
                      ${unitPrice.toFixed(2)}
                    </Text>

                    {/* Controles de incremento/decremento de unidades */}
                    <View style={styles.quantityRow}>
                      <Pressable
                        style={styles.quantityButton}
                        onPress={() => decreaseQuantity(item.lineId)}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </Pressable>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <Pressable
                        style={[
                          styles.quantityButton,
                          reachedLimit && styles.quantityButtonDisabled,
                        ]}
                        onPress={() => increaseQuantity(item.lineId)}
                        disabled={reachedLimit}
                      >
                        <Text
                          style={[
                            styles.quantityButtonText,
                            reachedLimit && styles.quantityButtonTextDisabled,
                          ]}
                        >
                          +
                        </Text>
                      </Pressable>

                      {/* Botón para eliminar la línea por completo */}
                      <Pressable
                        style={styles.removeButton}
                        onPress={() => removeItem(item.lineId)}
                      >
                        <Text style={styles.removeButtonText}>Quitar</Text>
                      </Pressable>
                    </View>

                    {/* Mensaje informativo en caso de tope de stock por combinación */}
                    {reachedLimit && (
                      <Text style={styles.limitText}>
                        Máximo {MAX_QUANTITY_PER_PRODUCT} por producto
                      </Text>
                    )}
                  </View>
                </View>
              );
            }}
          />

          {/* Sección de resumen de pago y checkout */}
          <View style={styles.footer}>
            {/* Nota general para toda la orden */}
            <Text style={styles.noteLabel}>Nota para tu pedido (opcional)</Text>
            <TextInput
              value={orderNote}
              onChangeText={setOrderNote}
              style={styles.noteInput}
              placeholder="Ej. Sin popote, servilletas extra..."
              placeholderTextColor="#a7c4b3"
              multiline
              maxLength={100}
            />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            <Pressable
              style={[
                styles.orderButton,
                !canOrder && styles.orderButtonDisabled,
              ]}
              onPress={() => router.push("/order-confirmation")}
              disabled={!canOrder}
            >
              <Text style={styles.orderButtonText}>
                {canOrder ? "Ordenar ahora" : "Ya tienes un pedido en curso"}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: "#4d7c62",
  },
  backButton: {
    backgroundColor: "#15803d",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
  },
  topRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  totalLimitText: {
    fontSize: 12,
    color: "#b91c1c",
    marginTop: 8,
  },
  itemRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#e6f7ec",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#14532d",
  },
  itemAddon: {
    fontSize: 12,
    color: "#4d7c62",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    color: "#15803d",
    fontWeight: "600",
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: "#f0fdf4",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
  },
  quantityButtonTextDisabled: {
    color: "#a7c4b3",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#14532d",
    minWidth: 18,
    textAlign: "center",
  },
  removeButton: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeButtonText: {
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: "600",
  },
  limitText: {
    fontSize: 11,
    color: "#a7c4b3",
    marginTop: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: "#f0fdf4",
    borderTopWidth: 1,
    borderTopColor: "#f0fdf4",
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14532d",
    marginBottom: 6,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    padding: 12,
    fontSize: 14,
    color: "#14532d",
    minHeight: 50,
    textAlignVertical: "top",
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#14532d",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#15803d",
  },
  orderButton: {
    alignItems: "center",
    backgroundColor: "#15803d",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  orderButtonDisabled: {
    backgroundColor: "#a7c4b3",
  },
  orderButtonText: {
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
  clearButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#dcfce7",
  },
  clearButtonText: {
    color: "#166534",
    fontWeight: "700",
  },
});
