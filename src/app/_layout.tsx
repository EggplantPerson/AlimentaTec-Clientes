import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="products/index" options={{ title: 'Productos' }} />
  <Stack.Screen name="products/[id]" options={{ title: 'Detalle' }} />
  <Stack.Screen name="cart" options={{ title: 'Carrito' }} />
  <Stack.Screen name="order-confirmation" options={{ title: 'Confirmar orden' }} />
</Stack>
  );
}