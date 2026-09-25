import { Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import GlobalToast from "../components/GlobalToast";
import StoreClosedOverlay from "../components/StoreClosedOverlay";
import { socket } from "../services/socket";
import { useDeviceStore } from "../store/deviceStore";
import {
  formatOrderNumber,
  OrderStatus,
  useOrdersStore,
} from "../store/orderStore";
import { Product, useProductsStore } from "../store/productsStore";
import { useStoreStateStore } from "../store/storeStateStore";
import { useToastStore } from "../store/toastStore"; // revisar si lo voy a usar

const STATUS_FROM_API: Record<string, OrderStatus> = {
  "En espera": "Pendiente",
  "En preparacion": "En preparación",
  Completado: "Listo",
  Entregado: "Entregado",
  Cancelado: "Cancelado",
};

function useOrderSocket() {
  // Inicialización única: id del dispositivo y estado inicial de la tienda
  useEffect(() => {
    const id = useDeviceStore.getState().ensureDeviceId();
    console.log(" Device ID actual:", id);
    useStoreStateStore.getState().loadStoreState();
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      console.log(" Socket conectado:", socket.id);
      useStoreStateStore.getState().loadStoreState();
    };

    const handleConnectError = (error: Error & { description?: unknown }) => {
      console.log(" Error de Socket:", error.message);
      console.log("Detalle:", error.description);
    };

    const handleDisconnect = (reason: string) => {
      console.log(" Socket desconectado:", reason);
    };

    const handleOrderUpdated = (order: {
      uid: string;
      status: string;
      notes?: string | null;
    }) => {
      console.log(" Evento recibido:", order);

      const status = STATUS_FROM_API[order.status];

      if (!status) {
        console.log(" Estado no reconocido:", order.status);
        return;
      }

      const previousOrders = useOrdersStore.getState().orders;
      const ordersOfDevice = previousOrders
        .filter((localOrder) => localOrder.uid === order.uid)
        .sort((a, b) => b.createdAt - a.createdAt);

      const matchedOrder = ordersOfDevice[0];

      if (!matchedOrder) {
        console.log("Pedido no encontrado localmente:", order.uid);
        return;
      }

      // Pedido cancelado (desde el admin, con motivo, o desde la app): notificamos y
      // lo quitamos del historial local para liberar el límite de "un pedido a la vez"
      if (status === "Cancelado") {
        useToastStore
          .getState()
          .showToast(
            `Pedido ${formatOrderNumber(matchedOrder.orderNumber)} cancelado${
              order.notes ? `: ${order.notes}` : ""
            }`,
          );
        useOrdersStore.getState().removeOrder(matchedOrder.id);
        return;
      }

      // Solo mostramos el pop-up si el estado realmente cambió
      if (matchedOrder.status !== status) {
        useToastStore
          .getState()
          .showToast(
            `Pedido ${formatOrderNumber(matchedOrder.orderNumber)}: ${status}`,
          );
      }

      useOrdersStore.getState().updateOrderStatus(order.uid, status);
    };

    const handleStoreUpdated = (payload: {
      isOpen?: boolean;
      open?: boolean;
      status?: string;
    }) => {
      // Normalizamos porque el backend puede mandar isOpen, open o status según el evento
      const raw = payload.isOpen ?? payload.open;
      if (typeof raw === "boolean") {
        useStoreStateStore.getState().setOpen(raw);
      }
    };

    const mapApiProduct = (product: {
      id: number;
      name: string;
      description: string;
      image_url: string;
      price: number;
      available: boolean;
      category: string;
      addons?: string[];
    }): Product => ({
      id: String(product.id),
      name: product.name,
      description: product.description,
      image: product.image_url,
      price: Number(product.price),
      available: product.available,
      category: product.category,
      notes: "",
      addons: Array.isArray(product.addons) ? product.addons : [],
    });

    const handleProductCreated = (
      product: Parameters<typeof mapApiProduct>[0],
    ) => {
      useProductsStore.getState().upsertProduct(mapApiProduct(product));
    };

    const handleProductUpdated = (
      product: Parameters<typeof mapApiProduct>[0],
    ) => {
      useProductsStore.getState().upsertProduct(mapApiProduct(product));
    };

    const handleProductDeleted = (product: { id: number }) => {
      useProductsStore.getState().removeProduct(String(product.id));
    };

    const handleOrderDeleted = (order: { uid: string }) => {
      const previousOrders = useOrdersStore.getState().orders;
      const matchedOrder = previousOrders.find(
        (localOrder) => localOrder.uid === order.uid,
      );
      if (matchedOrder) {
        useOrdersStore.getState().removeOrder(matchedOrder.id);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    socket.on("order:updated", handleOrderUpdated);
    socket.on("product:created", handleProductCreated);
    socket.on("product:updated", handleProductUpdated);
    socket.on("product:deleted", handleProductDeleted);
    socket.on("storeState: updated", handleStoreUpdated);
    socket.on("order:deleted", handleOrderDeleted);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.off("order:updated", handleOrderUpdated);
      socket.off("product:created", handleProductCreated);
      socket.off("product:updated", handleProductUpdated);
      socket.off("product:deleted", handleProductDeleted);
      socket.off("storeState: updated", handleStoreUpdated);
      socket.off("order:deleted", handleOrderDeleted);
      socket.disconnect();
    };
  }, []);
}

// Layout principal que define la navegación mediante Stack para toda la app
export default function RootLayout() {
  useOrderSocket();

  return (
    <View style={{ flex: 1 }}>
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
      <StoreClosedOverlay />
      <GlobalToast />
    </View>
  );
}
