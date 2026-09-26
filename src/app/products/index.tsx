import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProductCard from "../../components/ProductCard";
import { useCartItemCount } from "../../store/cartStore";
import { useActiveOrdersCount } from "../../store/orderStore";
import {
  useCategories,
  useFilteredProducts,
  useLoadProducts,
  useProductsStore,
} from "../../store/productsStore";

// Diccionario que asocia el nombre de cada categoría con su respectivo icono de Ionicons
const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Todos: "apps-outline",
  Disponibles: "checkmark-circle-outline",
  Comida: "fast-food-outline",
  Bebida: "cafe-outline",
  Snack: "nutrition-outline",
};

// Pantalla principal del catálogo de productos y filtros
export default function ProductsScreen() {
  // Hook personalizado para desencadenar la carga inicial de datos desde la API o store
  useLoadProducts();

  // Insets para respetar las zonas seguras del dispositivo (notch/barra de estado)
  const insets = useSafeAreaInsets();

  // Hooks y selectores de estado para categorías, productos, carrito y notificaciones
  const categories = useCategories();
  const selectedCategory = useProductsStore((state) => state.selectedCategory);
  const setCategory = useProductsStore((state) => state.setCategory);
  const loading = useProductsStore((state) => state.loading);
  const error = useProductsStore((state) => state.error);
  const cartCount = useCartItemCount();
  const activeOrdersCount = useActiveOrdersCount();

  // Estado local para la búsqueda de productos por texto
  const [searchQuery, setSearchQuery] = useState("");

  // Obtiene los productos filtrados por la categoría seleccionada
  const categoryFilteredProducts = useFilteredProducts();

  // Filtra los productos localmente por coincidencia de texto en el nombre
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categoryFilteredProducts;
    return categoryFilteredProducts.filter((product) =>
      product.name.toLowerCase().includes(query),
    );
  }, [categoryFilteredProducts, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Oculta el encabezado por defecto de Expo Router */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Barra superior con buscador y botones de notificación/carrito */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        {/* Campo de búsqueda con opción de limpiar el texto introducido */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={16}
            color="#166534"
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar"
            placeholderTextColor="#4d7c62"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color="#4d7c62" />
            </Pressable>
          )}
        </View>

        {/* Botón de acceso a notificaciones con contador de pedidos activos */}
        <Pressable
          style={styles.cartButton}
          onPress={() => router.push("/notifications")}
        >
          <Ionicons name="notifications-outline" size={20} color="#15803d" />
          {activeOrdersCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{activeOrdersCount}</Text>
            </View>
          )}
        </Pressable>

        {/* Botón de acceso al carrito con badge numérico */}
        <Pressable
          style={styles.cartButton}
          onPress={() => router.push("/cart")}
        >
          <Ionicons name="cart-outline" size={20} color="#15803d" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Despliegue de mensaje de error en caso de fallo al recuperar los datos */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Menú de categorías con desplazamiento horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
        style={styles.categoriesScroll}
      >
        {categories.map((category) => {
          const isSelected = category === selectedCategory;
          const iconName = CATEGORY_ICONS[category] ?? "pricetag-outline";
          return (
            <Pressable
              key={category}
              onPress={() => setCategory(category)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Ionicons
                name={iconName}
                size={14}
                color={isSelected ? "#fff" : "#166534"}
                style={styles.chipIcon}
              />
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Condicional para mostrar cargando o la lista de tarjetas de productos */}
      {loading ? (
        <ActivityIndicator
          style={styles.loading}
          size="large"
          color="#15803d"
        />
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
    backgroundColor: "#f0fdf4",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#15803d",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#14532d",
  },
  clearButton: {
    paddingLeft: 6,
    paddingVertical: 6,
  },
  cartButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#14532d",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  errorText: {
    color: "#b91c1c",
    paddingHorizontal: 16,
    paddingTop: 8,
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
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    alignSelf: "center",
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#dcfce7",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  chipSelected: {
    backgroundColor: "#15803d",
    borderColor: "#15803d",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#166534",
  },
  chipIcon: {
    marginRight: 6,
  },
  chipTextSelected: {
    color: "#fff",
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#4d7c62",
    paddingHorizontal: 24,
  },
});
