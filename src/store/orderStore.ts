import { create } from "zustand";
import { CartItem } from "./cartStore";

export type OrderStatus =
  | "Pendiente"
  | "En preparación"
  | "Listo"
  | "Entregado";

export interface Order {
  id: string;
  orderNumber: number;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
}

interface OrdersState {
  orders: Order[];
  nextOrderNumber: number;
  addOrder: (items: CartItem[], total: number) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  nextOrderNumber: 1,

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

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    })),

  getOrderById: (orderId) => get().orders.find((order) => order.id === orderId),
}));

export function useActiveOrdersCount(): number {
  return useOrdersStore(
    (state) =>
      state.orders.filter((order) => order.status !== "Entregado").length,
  );
}

export function formatOrderNumber(orderNumber: number): string {
  return `#${String(orderNumber).padStart(8, "0")}`;
}

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
