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

// Estructura de un pedido individual
export interface Order {
  id: string;
  orderNumber: number;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
}

// Interfaz para la definición del estado global de pedidos y sus acciones
interface OrdersState {
  orders: Order[];
  nextOrderNumber: number;
  addOrder: (items: CartItem[], total: number) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

// Store principal de Zustand para la gestión de pedidos
export const useOrdersStore = create<OrdersState>()(
  persist<OrdersState>(
    (set, get) => ({
      orders: [],
      nextOrderNumber: 1,

      // Crea una nueva orden, le asigna folios e id, y la agrega al inicio de la lista
      addOrder: (items, total) => {
        const id = String(Date.now());
        const orderNumber = get().nextOrderNumber;
        const newOrder: Order = {
          id,
          orderNumber,
          items,
          total,
          status: "Pendiente",
          createdAt: Date.now(),
        };
        set((state) => ({
          orders: [newOrder, ...state.orders],
          nextOrderNumber: state.nextOrderNumber + 1,
        }));
        return id;
      },

      // Actualiza el estado actual de una orden por su id
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order,
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
