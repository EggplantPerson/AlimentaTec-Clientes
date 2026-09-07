import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import {
  Product,
  ProductInput,
  useCategories,
  useProductsStore,
} from '../store/productsStore';

interface ProductFormProps {
  product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const categories = useCategories().filter((category) => category !== 'Todos');
  const createProduct = useProductsStore((state) => state.createProduct);
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const saving = useProductsStore((state) => state.saving);
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [image, setImage] = useState(product?.image ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [category, setCategory] = useState(product?.category ?? categories[0] ?? '');
  const [available, setAvailable] = useState(product?.available ?? true);

  async function handleSubmit() {
    if (!name.trim() || !description.trim() || !category.trim() || !price.trim()) {
      Alert.alert('Datos incompletos', 'Completa nombre, descripción, precio y categoría.');
      return;
    }

    const data: ProductInput = {
      name: name.trim(),
      description: description.trim(),
      image: image.trim(),
      price: Number(price),
      available,
      category: category.trim(),
    };

    if (!Number.isFinite(data.price)) {
      Alert.alert('Precio inválido', 'Escribe un precio numérico.');
      return;
    }

    try {
      if (product) {
        await updateProduct(product.id, data);
      } else {
        await createProduct(data);
      }
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el producto.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.label}>Nombre</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nombre del producto" />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.multiline]}
        placeholder="Descripción del producto"
        multiline
      />

      <Text style={styles.label}>Precio</Text>
      <TextInput value={price} onChangeText={setPrice} style={styles.input} placeholder="0.00" keyboardType="decimal-pad" />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.categoryRow}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, item === category && styles.categorySelected]}>
            <Text style={item === category ? styles.categoryTextSelected : styles.categoryText}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput value={category} onChangeText={setCategory} style={styles.input} placeholder="Categoría" />

      <Text style={styles.label}>Imagen (nombre o URL)</Text>
      <TextInput value={image} onChangeText={setImage} style={styles.input} placeholder="imagen.png" />

      <View style={styles.availableRow}>
        <Text style={styles.label}>Disponible</Text>
        <Switch value={available} onValueChange={setAvailable} />
      </View>

      <Pressable disabled={saving} onPress={handleSubmit} style={[styles.submit, saving && styles.disabled]}>
        <Text style={styles.submitText}>{saving ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 8 },
  label: { color: '#333', fontSize: 14, fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: '#fff', padding: 12, fontSize: 15 },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  category: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#e5e5e5' },
  categorySelected: { backgroundColor: '#111827' },
  categoryText: { color: '#333' },
  categoryTextSelected: { color: '#fff' },
  availableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  submit: { alignItems: 'center', backgroundColor: '#111827', borderRadius: 8, marginTop: 20, padding: 14 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700' },
});