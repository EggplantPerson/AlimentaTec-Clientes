import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {ActivityIndicator,Alert,Image,Pressable,ScrollView,StyleSheet,Text,TextInput,View,} from 'react-native';
import { PRODUCT_IMAGES } from '../../constants/images';
import { MAX_TOTAL_ITEMS, useCartStore } from '../../store/cartStore';
import { useProductsStore } from '../../store/productsStore';
import { Ionicons } from '@expo/vector-icons';
import { useCartItemCount } from '../../store/cartStore';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProductsStore((state) => state.products.find((p) => p.id === id));
  const selectedProduct = useProductsStore((state) => state.selectedProduct);
  const selectProduct = useProductsStore((state) => state.selectProduct);
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const loading = useProductsStore((state) => state.loading);
  const saving = useProductsStore((state) => state.saving);
  const addItem = useCartStore((state) => state.addItem);
  const cartCount = useCartItemCount();
  const reachedTotalLimit = cartCount >= MAX_TOTAL_ITEMS;

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (id) void selectProduct(id);
  }, [id, selectProduct]);

  const displayedProduct = product ?? selectedProduct;

  useEffect(() => {
    if (displayedProduct) {
      setNoteText(displayedProduct.notes ?? '');
    }
  }, [displayedProduct?.id]);

  async function handleSaveNote() {
    if (!displayedProduct) return;
    try {
      await updateProduct(displayedProduct.id, { notes: noteText.trim() });
      setIsEditingNote(false);
    } catch {
      Alert.alert('Error', 'No se pudo guardar la nota.');
    }
  }

  function handleCancelNote() {
    if (!displayedProduct) return;
    setNoteText(displayedProduct.notes ?? '');
    setIsEditingNote(false);
  }

  function handleAddToCart() {
    if (!displayedProduct) return;
    addItem(displayedProduct);
  }

  if (loading && !displayedProduct) {
    return <ActivityIndicator style={styles.centered} size="large" color="#15803d" />;
  }

  if (!displayedProduct) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Producto no encontrado' }} />
        <Text style={styles.notFoundText}>
          El producto solicitado no existe o fue eliminado.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
  options={{
    title: displayedProduct.name,
    headerStyle: { backgroundColor: '#15803d' },
    headerTitleStyle: { color: '#fffdfd', fontWeight: '700' },
    headerRight: () => (
      <Pressable style={styles.headerCartButton} onPress={() => router.push('/cart')}>
        <Ionicons name="cart-outline" size={22} color="#fff" />
        {cartCount > 0 && (
          <View style={styles.headerCartBadge}>
            <Text style={styles.headerCartBadgeText}>{cartCount}</Text>
          </View>
        )}
      </Pressable>
    ),
  }}
/>

      
      <View style={styles.body}>
        <Image source={PRODUCT_IMAGES[displayedProduct.image]} style={styles.image} resizeMode="cover"/>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.badge,
              displayedProduct.available ? styles.badgeAvailable : styles.badgeUnavailable,
            ]}
          >

            <Text
              style={[
                styles.badgeText,
                displayedProduct.available
                  ? styles.badgeTextAvailable
                  : styles.badgeTextUnavailable,
              ]}
            >
              {displayedProduct.available ? 'Disponible' : 'Agotado'}
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
  <Text style={styles.price}>${displayedProduct.price.toFixed(2)}</Text>

  {displayedProduct.available && (
    <Pressable
      style={[styles.addToCartButton, reachedTotalLimit && styles.addToCartButtonDisabled]}
      onPress={handleAddToCart}
      disabled={reachedTotalLimit}
    >
      <Text style={styles.addToCartButtonText}>Agregar</Text>
    </Pressable>
  )}
</View>

{reachedTotalLimit && (
  <Text style={styles.totalLimitText}>
    Alcanzaste el máximo de {MAX_TOTAL_ITEMS} productos por pedido.
  </Text>
)}

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{displayedProduct.description}</Text>

        <Text style={styles.sectionTitle}>Nota</Text>

        {isEditingNote ? (
          <View>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              style={[styles.input, styles.multiline]}
              placeholder="Ej. Sin lechuga, sin cebolla..."
              placeholderTextColor="#6b9c80"
              multiline
              autoFocus
            />
            <View style={styles.noteButtonsRow}>
              <Pressable
                style={[styles.noteButton, styles.cancelButton]}
                onPress={handleCancelNote}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.noteButton, styles.saveButton]}
                onPress={handleSaveNote}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Guardando...' : 'Guardar nota'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              {displayedProduct.notes ? displayedProduct.notes : 'Sin notas para este producto.'}
            </Text>
            <Pressable style={styles.editNoteButton} onPress={() => setIsEditingNote(true)}>
              <Text style={styles.editNoteButtonText}>
                {displayedProduct.notes ? 'Editar nota' : 'Agregar nota'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15803d',
  },
  content: {
    paddingBottom: 32,
    flexGrow: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f0fdf4',
  },
  notFoundText: {
    fontSize: 15,
    color: '#4d7c62',
    textAlign: 'center',
  },
  image: {
    width: '82%',
    height: 220,
    alignSelf: 'center',
    borderRadius: 30,
    backgroundColor: '#e6f7ec',
    marginTop: 30,
    marginBottom: 30,
  },
  body: {
    flex: 2,
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#14532d',
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeAvailable: {
    backgroundColor: '#dcfce7',
  },
  badgeUnavailable: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextAvailable: {
    color: '#166534',
  },
  badgeTextUnavailable: {
    color: '#991b1b',
  },
  category: {
    fontSize: 13,
    color: '#4d7c62',
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#15803d',
  },
  addToCartButton: {
    alignItems: 'center',
    backgroundColor: '#15803d',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerCartButton: {
  marginRight: 12,
  padding: 4,
},
headerCartBadge: {
  position: 'absolute',
  top: -4,
  right: -4,
  minWidth: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: '#14532d',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 3,
},
headerCartBadgeText: {
  color: '#fff',
  fontSize: 9,
  fontWeight: '700',
},
  addToCartButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  addToCartButtonDisabled: {
  backgroundColor: '#a7c4b3',
},
totalLimitText: {
  fontSize: 12,
  color: '#b91c1c',
  marginTop: 6,
},
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14532d',
    marginTop: 20,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  noteContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginTop: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    padding: 12,
    fontSize: 14,
    marginTop: 8,
    color: '#14532d',
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  noteButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  noteButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  saveButton: {
    backgroundColor: '#15803d',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#dcfce7',
  },
  cancelButtonText: {
    color: '#166534',
    fontWeight: '700',
  },
  editNoteButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#15803d',
  },
  editNoteButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});