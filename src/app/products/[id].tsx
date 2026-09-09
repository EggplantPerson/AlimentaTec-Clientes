import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PRODUCT_IMAGES } from '../../constants/images';
import { useProductsStore } from '../../store/productsStore';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProductsStore((state) => state.products.find((p) => p.id === id));
  const selectedProduct = useProductsStore((state) => state.selectedProduct);
  const selectProduct = useProductsStore((state) => state.selectProduct);
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const loading = useProductsStore((state) => state.loading);
  const saving = useProductsStore((state) => state.saving);

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
      <Stack.Screen options={{ title: displayedProduct.name }} />

      <Image source={PRODUCT_IMAGES[displayedProduct.image]} style={styles.image} />

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{displayedProduct.name}</Text>
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

        <Text style={styles.category}>{displayedProduct.category}</Text>
        <Text style={styles.price}>${displayedProduct.price.toFixed(2)}</Text>

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
    backgroundColor: '#f0fdf4',
  },
  content: {
    paddingBottom: 32,
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
    width: '100%',
    height: 260,
    backgroundColor: '#e6f7ec',
  },
  body: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: -20,
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
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#15803d',
    marginTop: 10,
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