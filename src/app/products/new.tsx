import { Stack } from 'expo-router';
import ProductForm from '../../components/ProductForm';

export default function NewProductScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Nuevo producto' }} />
      <ProductForm />
    </>
  );
}