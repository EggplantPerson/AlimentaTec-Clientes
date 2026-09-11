import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Order, OrderStatus, useOrdersStore } from '../store/orderStore';

const STATUS_COLORS: Record<OrderStatus, { background: string; text: string }> = {
  Pendiente: { background: '#fef3c7', text: '#92400e' },
  'En preparación': { background: '#dbeafe', text: '#1e40af' },
  Listo: { background: '#dcfce7', text: '#166534' },
  Entregado: { background: '#e5e5e5', text: '#525252' },
};

function formatTime(timestamp: number): string {                    
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function NotificationsScreen() {
  const orders = useOrdersStore((state) => state.orders);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Notificaciones' }} />

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
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderTitle}>Pedido #{item.id.slice(-4)}</Text>
                <Text style={styles.orderTime}>{formatTime(item.createdAt)}</Text>
              </View>

              <Text style={styles.itemsSummary} numberOfLines={2}>
                {item.items.map((cartItem) => `${cartItem.quantity}x ${cartItem.product.name}`).join(', ')}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#4d7c62',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14532d',
  },
  orderTime: {
    fontSize: 12,
    color: '#4d7c62',
  },
  itemsSummary: {
    fontSize: 13,
    color: '#555',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803d',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});