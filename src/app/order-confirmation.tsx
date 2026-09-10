import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCartStore, useCartTotal } from '../store/cartStore';

export default function OrderConfirmationScreen() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartTotal();

  function handleConfirmOrder() {
    clearCart();
    router.replace('/products');
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Confirmar orden' , headerStyle: { backgroundColor: '#15803d' },headerTitleStyle: { color: '#fafafa', fontWeight: '700' }}} />

      <View style={styles.content}>
        <Ionicons name="checkmark-circle-outline" size={64} color="#15803d" />
        <Text style={styles.title}>Confirmar tu orden</Text>
        <Text style={styles.subtitle}>
          Tienes {items.length} producto{items.length !== 1 ? 's' : ''} en tu carrito.
        </Text>

        <View style={styles.summaryBox}>
          {items.map((item) => (
            <View key={item.product.id} style={styles.summaryRow}>
              <Text style={styles.summaryItemName}>
                {item.quantity}x {item.product.name}
              </Text>
              <Text style={styles.summaryItemPrice}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.confirmButton} onPress={handleConfirmOrder}>
          <Text style={styles.confirmButtonText}>Confirmar orden</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver al carrito</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#14532d',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#4d7c62',
    marginTop: 4,
    marginBottom: 20,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItemName: {
    fontSize: 14,
    color: '#14532d',
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
  },
  divider: {
    height: 1,
    backgroundColor: '#dcfce7',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14532d',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803d',
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#dcfce7',
    gap: 8,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: '#15803d',
    borderRadius: 10,
    padding: 14,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  backButton: {
    color: '#dcfce7',
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    color: '#4d7c62',
    fontWeight: '600',
    fontSize: 13,
  },
});