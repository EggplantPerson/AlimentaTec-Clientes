import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import ProductForm from '../../components/ProductForm';
import { useProductsStore } from '../../store/productsStore';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProductsStore((state) => state.products.find((item) => item.id === id));

  if (!product) {
    return <View><Text>Producto no encontrado.</Text></View>;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Editar producto' }} />
      <ProductForm product={product} />
    </>
  );
}