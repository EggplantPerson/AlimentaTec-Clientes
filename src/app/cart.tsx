import { PRODUCT_IMAGES } from '@/constants/images';
import { router, Stack } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_QUANTITY_PER_PRODUCT, MAX_TOTAL_ITEMS, useCartStore, useCartTotal } from '../store/cartStore';

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartTotal();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const reachedTotalLimit = totalItems >= MAX_TOTAL_ITEMS;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Carrito', headerStyle: { backgroundColor: '#15803d' },headerTitleStyle: { color: '#fafafa', fontWeight: '700' }}} />

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

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>¿Quieres pedir algo? Añadelo!</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Ver productos</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.product.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const reachedLimit = item.quantity >= MAX_QUANTITY_PER_PRODUCT || reachedTotalLimit;
              return (
                <View style={styles.itemRow}>
                  <Image source={PRODUCT_IMAGES[item.product.image]} style={styles.itemImage} />

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.itemPrice}>${item.product.price.toFixed(2)}</Text>
                    {item.product.notes ? (
  <Text style={styles.itemNote}>Nota: {item.product.notes}</Text>
) : null}

                    <View style={styles.quantityRow}>
                      <Pressable
                        style={styles.quantityButton}
                        onPress={() => decreaseQuantity(item.product.id)}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </Pressable>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <Pressable
                        style={[styles.quantityButton, reachedLimit && styles.quantityButtonDisabled]}
                        onPress={() => increaseQuantity(item.product.id)}
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

                      <Pressable
                        style={styles.removeButton}
                        onPress={() => removeItem(item.product.id)}
                      >
                        <Text style={styles.removeButtonText}>Quitar</Text>
                      </Pressable>
                    </View>

                    {reachedLimit && (
                      <Text style={styles.limitText}>Máximo {MAX_QUANTITY_PER_PRODUCT} por producto</Text>
                    )}
                  </View>
                </View>
              );
            }}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            <Pressable style={styles.orderButton} onPress={() => router.push('/order-confirmation')}>
              <Text style={styles.orderButtonText}>Ordenar ahora</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#4d7c62',
  },
  backButton: {
    backgroundColor: '#15803d',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
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
  color: '#b91c1c',
  marginTop: 8,
},
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#e6f7ec',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14532d',
  },
  itemPrice: {
    fontSize: 13,
    color: '#15803d',
    fontWeight: '600',
    marginTop: 2,
  },
  itemNote: {
  fontSize: 12,
  color: '#4d7c62',
  fontStyle: 'italic',
  marginTop: 2,
},
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f0fdf4',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
  },
  quantityButtonTextDisabled: {
    color: '#a7c4b3',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14532d',
    minWidth: 18,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#b91c1c',
    fontWeight: '600',
  },
  limitText: {
    fontSize: 11,
    color: '#a7c4b3',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderTopWidth: 1,
    borderTopColor: '#f0fdf4',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14532d',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#15803d',
  },
  orderButton: {
    alignItems: 'center',
    backgroundColor: '#15803d',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  clearButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#dcfce7',
  },
  clearButtonText: {
    color: '#166534',
    fontWeight: '700',
  },
});