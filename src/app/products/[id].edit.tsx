import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import ProductForm from "../../components/ProductForm";
import { useProductsStore } from "../../store/productsStore";

// Pantalla principal para la edición de información de un producto
export default function EditProductScreen() {
  // Obtiene el ID del producto enviado como parámetro de navegación desde la URL
  const { id } = useLocalSearchParams<{ id: string }>();

  // Obtiene el producto correspondiente desde el store global
  const product = useProductsStore((state) =>
    state.products.find((item) => item.id === id),
  );

  // Vista de respaldo cuando el producto no existe o no se encuentra en el estado
  if (!product) {
    return (
      <View>
        <Text>Producto no encontrado.</Text>
      </View>
    );
  }

  // Renderiza el formulario prellenado y configura el encabezado de navegación
  return (
    <>
      <Stack.Screen options={{ title: "Editar producto" }} />
      <ProductForm product={product} />
    </>
  );
}
