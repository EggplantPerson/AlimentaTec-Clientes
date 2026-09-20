import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CartItem } from "./cartStore";

// Posibles estados del pedido en el flujo de trabajo
export type OrderStatus =
  | "Pendiente"
  | "En preparación"
  | "Listo"
  | "Entregado";

// Copia congelada de un producto comprado, tal como estaba al momento de la compra.
// No depende del catálogo actual: si el producto cambia después, esta copia no se ve afectada.
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  notes?: string;
}

// Estructura de un pedido individual
export interface Order {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
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
  ) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

// Store principal de Zustand para la gestión de pedidos
export const useOrdersStore = create<OrdersState>()(
  persist<OrdersState>(
    (set, get) => ({
      orders: [],
      nextOrderNumber: 1,

      // Crea una nueva orden: convierte cada CartItem en una copia congelada (OrderItem)
      // para que la orden no dependa del catálogo de productos en el futuro.
      addOrder: (uid, orderNumber, items, total) => {
        const snapshotItems: OrderItem[] = items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
          notes: item.product.notes,
        }));

        const newOrder: Order = {
          id: uid,
          orderNumber,
          items: snapshotItems,
          total,
          status: "Pendiente",
          createdAt: Date.now(),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
          nextOrderNumber: state.nextOrderNumber + 1,
        }));

        return uid;
      },

      // Actualiza el estado actual de una orden por su id
      updateOrderStatus: (uid: string, status: OrderStatus) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === uid ? { ...order, status } : order,
          ),
        })),

      // Busca y retorna un pedido específico mediante su id
      getOrderById: (orderId) =>
        get().orders.find((order) => order.id === orderId),
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
