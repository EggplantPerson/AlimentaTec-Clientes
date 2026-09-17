import { Stack } from "expo-router";

// Layout principal que define la navegación mediante Stack para toda la app
export default function RootLayout() {
  return (
    <Stack>
      {/* Pantalla de inicio o bienvenida (sin encabezado de navegación) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Catálogo general de productos */}
      <Stack.Screen name="products/index" options={{ title: "Productos" }} />

      {/* Detalle individual de un producto según su ID */}
      <Stack.Screen name="products/[id]" options={{ title: "Detalle" }} />

      {/* Pantalla del carrito de compras */}
      <Stack.Screen name="cart" options={{ title: "Carrito" }} />

      {/* Paso para la confirmación de la orden/pago */}
      <Stack.Screen
        name="order-confirmation"
        options={{ title: "Confirmar orden" }}
      />

      {/* Pantalla de agradecimiento o confirmación exitosa (sin encabezado) */}
      <Stack.Screen name="order-confirmed" options={{ headerShown: false }} />

      {/* Historial o lista de notificaciones del usuario */}
      <Stack.Screen
        name="notifications"
        options={{ title: "Notificaciones" }}
      />
    </Stack>
  );
}
