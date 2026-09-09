import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {ActivityIndicator,FlatList,Pressable,ScrollView,StyleSheet,Text,TextInput,View,} from 'react-native';
import ProductCard from '../../components/ProductCard';
import {useCategories,useFilteredProducts,useLoadProducts,useProductsStore,} from '../../store/productsStore';

export default function ProductsScreen() {
  useLoadProducts();
  const categories = useCategories();
  const selectedCategory = useProductsStore((state) => state.selectedCategory);
  const setCategory = useProductsStore((state) => state.setCategory);
  const loading = useProductsStore((state) => state.loading);
  const error = useProductsStore((state) => state.error);

  const [searchQuery, setSearchQuery] = useState('');

  const categoryFilteredProducts = useFilteredProducts();

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categoryFilteredProducts;
    return categoryFilteredProducts.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
  }, [categoryFilteredProducts, searchQuery]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Productos' }} />

      <View style={styles.headerRow}>
        <Text style={styles.title}>Productos</Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar producto..."
          placeholderTextColor="#6b9c80"
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Listado de categorías */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
        style={styles.categoriesScroll}
      >
        {categories.map((category) => {
          const isSelected = category === selectedCategory;
          return (
            <Pressable
              key={category}
              onPress={() => setCategory(category)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={styles.loading} size="large" color="#15803d" />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery
                ? `No se encontraron productos para "${searchQuery}".`
                : `No hay productos en la categoría "${selectedCategory}".`}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#f0fdf4',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#14532d',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#14532d',
  },
  clearButton: {
    paddingLeft: 8,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#4d7c62',
    fontWeight: '700',
  },
  errorText: {
    color: '#b91c1c',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loading: {
    marginTop: 40,
  },
  categoriesScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 56,
  },
  categoriesRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    height: 36,
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#dcfce7',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  chipSelected: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  chipTextSelected: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#4d7c62',
    paddingHorizontal: 24,
  },
});