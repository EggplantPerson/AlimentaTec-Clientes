import { PRODUCT_IMAGES } from '@/constants/images';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Product } from '../store/productsStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/products/${product.id}`)}
    >
      <Image source={PRODUCT_IMAGES[product.image]} style={styles.image} />

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <View
            style={[
              styles.badge,
              product.available ? styles.badgeAvailable : styles.badgeUnavailable,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                product.available ? styles.badgeTextAvailable : styles.badgeTextUnavailable,
              ]}
            >
              {product.available ? 'Disponible' : 'Agotado'}
            </Text>
          </View>
        </View>



        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#dcfce7',
    shadowColor: '#14532d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: '#f0fdf4',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#e6f7ec',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#14532d',
    marginRight: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeAvailable: {
    backgroundColor: '#dcfce7',
  },
  badgeUnavailable: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextAvailable: {
    color: '#166534',
  },
  badgeTextUnavailable: {
    color: '#991b1b',
  },
  category: {
    fontSize: 12,
    color: '#4d7c62',
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803d',
  },
});