import { Stack } from "expo-router";
import { useEffect } from "react";
import { socket } from "../services/socket";
import { OrderStatus, useOrdersStore } from "../store/orderStore";

const STATUS_FROM_API: Record<string, OrderStatus> = {
  "En espera": "Pendiente",
  "En preparacion": "En preparación",
  Completado: "Listo",
  Entregado: "Entregado",
};

function useOrderSocket() {
  useEffect(() => {
    const handleConnect = () => {
      console.log("✅ Socket conectado:", socket.id);
    };

    const handleConnectError = (error: Error & { description?: unknown }) => {
      console.log("❌ Error de Socket:", error.message);
      console.log("Detalle:", error.description);
    };

    const handleDisconnect = (reason: string) => {
      console.log("⚠️ Socket desconectado:", reason);
    };

    const handleOrderUpdated = (order: { uid: string; status: string }) => {
      console.log("📦 Evento recibido:", order);

      const status = STATUS_FROM_API[order.status];

      if (!status) {
        console.log("❌ Estado no reconocido:", order.status);
        return;
      }

      const previousOrders = useOrdersStore.getState().orders;
      console.log(
        "¿Existe el pedido localmente?",
        previousOrders.some((localOrder) => localOrder.id === order.uid),
      );

      useOrdersStore.getState().updateOrderStatus(order.uid, status);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    socket.on("order:updated", handleOrderUpdated);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.off("order:updated", handleOrderUpdated);
      socket.disconnect();
    };
  }, []);
}

// Layout principal que define la navegación mediante Stack para toda la app
export default function RootLayout() {
  useOrderSocket();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="products/index" options={{ title: "Productos" }} />
      <Stack.Screen name="products/[id]" options={{ title: "Detalle" }} />
      <Stack.Screen name="cart" options={{ title: "Carrito" }} />
      <Stack.Screen
        name="order-confirmation"
        options={{ title: "Confirmar orden" }}
      />
      <Stack.Screen name="order-confirmed" options={{ headerShown: false }} />
      <Stack.Screen
        name="notifications"
        options={{ title: "Notificaciones" }}
      />
    </Stack>
  );
}
