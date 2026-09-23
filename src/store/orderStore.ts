import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { CartItem } from "./cartStore";

// Posibles estados del pedido en el flujo de trabajo
export type OrderStatus =
  | "Pendiente"
  | "En preparación"
  | "Listo"
  | "Entregado"
  | "Cancelado";

// Copia congelada de un producto comprado, tal como estaba al momento de la compra.
// No depende del catálogo actual: si el producto cambia después, esta copia no se ve afectada.
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Estructura de un pedido individual
export interface Order {
  id: string; // identificador único de ESTE pedido (no del dispositivo)
  uid: string; // identificador del dispositivo que hizo el pedido (para consultar el backend)
  orderNumber: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  notes?: string; // nota general aplicable a toda la orden
  createdAt: number;
}

// Interfaz para la definición del estado global de pedidos y sus acciones
interface OrdersState {
  orders: Order[];
  nextOrderNumber: number;
  addOrder: (
    uid: string,
    orderNumber: number,
    items: CartItem[],
    total: number,
    notes?: string,
  ) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  removeOrder: (orderId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  clearOrders: () => void;
}

// Store principal de Zustand para la gestión de pedidos
export const useOrdersStore = create<OrdersState>()(
  persist<OrdersState>(
    (set, get) => ({
      orders: [],
      nextOrderNumber: 1,

      // Crea SIEMPRE una nueva orden en el historial local, aunque venga del mismo dispositivo.
      addOrder: (uid, orderNumber, items, total, notes) => {
        const snapshotItems: OrderItem[] = items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        }));

        const localOrderId = `${uid}-${Date.now()}`;

        const newOrder: Order = {
          id: localOrderId,
          uid,
          orderNumber,
          items: snapshotItems,
          total,
          status: "Pendiente",
          notes,
          createdAt: Date.now(),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
          nextOrderNumber: state.nextOrderNumber + 1,
        }));

        return localOrderId;
      },

      // Actualiza el estado actual de una orden por el uid del dispositivo.
      // Si el nuevo estado es "Entregado", la orden se elimina del historial en vez de solo actualizarse.
      updateOrderStatus: (uid: string, status: OrderStatus) =>
        set((state) => {
          const ordersOfDevice = state.orders
            .filter((order) => order.uid === uid)
            .sort((a, b) => b.createdAt - a.createdAt);

          const mostRecentId = ordersOfDevice[0]?.id;

          if (!mostRecentId) return state;

          if (status === "Entregado") {
            return {
              orders: state.orders.filter((order) => order.id !== mostRecentId),
            };
          }

          return {
            orders: state.orders.map((order) =>
              order.id === mostRecentId ? { ...order, status } : order,
            ),
          };
        }),

      removeOrder: (orderId: string) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId),
        })),

      // Busca y retorna un pedido específico mediante su id local
      getOrderById: (orderId) =>
        get().orders.find((order) => order.id === orderId),

      // Vacía por completo el historial de pedidos guardado localmente
      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: "orders-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Hook personalizado para obtener la cantidad de pedidos que no han sido entregados
export function useActiveOrdersCount(): number {
  return useOrdersStore(
    (state) =>
      state.orders.filter((order) => order.status !== "Entregado").length,
  );
}

// Hook para saber si el usuario puede hacer un nuevo pedido (no debe tener ninguno pendiente de entrega)
export function useCanPlaceOrder(): {
  canOrder: boolean;
  pendingOrder?: Order;
} {
  return useOrdersStore(
    useShallow((state) => {
      const pendingOrder = state.orders.find(
        (order) => order.status !== "Entregado",
      );
      return {
        canOrder: !pendingOrder,
        pendingOrder,
      };
    }),
  );
}

// Formatea el número de orden agregando ceros a la izquierda (ej. #00000001)
export function formatOrderNumber(orderNumber: number): string {
  return `#${String(orderNumber).padStart(8, "0")}`;
}

// Convierte un timestamp a una fecha legible con el día, número y hora en español
export function formatOrderDate(timestamp: number): string {
  const date = new Date(timestamp);
  const weekday = date.toLocaleDateString("es-MX", { weekday: "long" });
  const day = date.getDate();
  const time = date.toLocaleTimeString("es-MX", {
    hour: "numeric",
    minute: "2-digit",
  });
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday}, ${day} - ${time}`;
}
