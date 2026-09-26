import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Product } from "./productsStore";

// Límites permitidos por combinación producto+adicional y para el total del carrito
export const MAX_QUANTITY_PER_PRODUCT = 2;
export const MAX_TOTAL_ITEMS = 4;

// Genera un identificador único por línea: mismo producto con distinto adicional = línea distinta
function buildLineId(productId: string, addonId?: string | null): string {
  return `${productId}::${addonId ?? "none"}`;
}

// Estructura de un elemento dentro del carrito
export interface CartItem {
  lineId: string;
  product: Product;
  addon?: Product | null; // producto-adicional elegido (de la categoría "Adicionales"), o null
  quantity: number;
}

// Precio unitario real de una línea: producto + adicional elegido (si hay)
function unitPrice(item: CartItem): number {
  return item.product.price + (item.addon?.price ?? 0);
}

// Función auxiliar para calcular la suma total de unidades en el carrito
function getTotalQuantity(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// Interfaz para la definición del estado del carrito y sus acciones
interface CartState {
  items: CartItem[];
  orderNote: string;
  addItem: (product: Product, addon?: Product | null) => void;
  removeItem: (lineId: string) => void;
  increaseQuantity: (lineId: string) => void;
  decreaseQuantity: (lineId: string) => void;
  clearCart: () => void;
  removeUnavailableItems: (currentProducts: Product[]) => void;
  setOrderNote: (note: string) => void;
}

// Store principal de Zustand para la gestión del carrito de compras
export const useCartStore = create<CartState>()(
  persist<CartState>(
    (set) => ({
      items: [],
      orderNote: "",

      // Agrega un producto (con adicional opcional) respetando los límites por línea y totales.
      // Si el carrito estaba vacío, sanitiza la nota heredada (evita arrastrar un motivo de cancelación).
      addItem: (product, addon = null) =>
        set((state) => {
          if (getTotalQuantity(state.items) >= MAX_TOTAL_ITEMS) return state;

          const lineId = buildLineId(product.id, addon?.id);
          const existing = state.items.find((item) => item.lineId === lineId);

          if (existing) {
            if (existing.quantity >= MAX_QUANTITY_PER_PRODUCT) return state;
            return {
              items: state.items.map((item) =>
                item.lineId === lineId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { lineId, product, addon, quantity: 1 }],
          };
        }),

      // Elimina completamente una línea del carrito por su lineId y limpia la nota si queda vacío
      removeItem: (lineId) =>
        set((state) => {
          const newItems = state.items.filter((item) => item.lineId !== lineId);
          return {
            items: newItems,
            orderNote: newItems.length === 0 ? "" : state.orderNote,
          };
        }),

      // Incrementa la cantidad de una línea específica si no excede los límites
      increaseQuantity: (lineId) =>
        set((state) => {
          if (getTotalQuantity(state.items) >= MAX_TOTAL_ITEMS) return state;
          return {
            items: state.items.map((item) =>
              item.lineId === lineId && item.quantity < MAX_QUANTITY_PER_PRODUCT
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          };
        }),

      // Reduce la cantidad de una línea, la remueve si llega a cero, y limpia la nota si el carrito queda vacío
      decreaseQuantity: (lineId) =>
        set((state) => {
          const newItems = state.items
            .map((item) =>
              item.lineId === lineId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0);

          return {
            items: newItems,
            orderNote: newItems.length === 0 ? "" : state.orderNote,
          };
        }),

      // Vacía todos los elementos del carrito y su nota
      clearCart: () => set({ items: [], orderNote: "" }),

      // Elimina del carrito cualquier línea cuyo producto ya no exista o no esté disponible
      removeUnavailableItems: (currentProducts) =>
        set((state) => {
          const newItems = state.items.filter((item) => {
            const currentProduct = currentProducts.find(
              (p) => p.id === item.product.id,
            );
            return currentProduct !== undefined && currentProduct.available;
          });

          return {
            items: newItems,
            orderNote: newItems.length === 0 ? "" : state.orderNote,
          };
        }),

      // Guarda la nota general aplicable a toda la orden
      setOrderNote: (note) => set({ orderNote: note }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Hook para obtener el número total de unidades agregadas
export function useCartItemCount(): number {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
}

// Hook para calcular el monto total a pagar: precio del producto + precio del adicional elegido
export function useCartTotal(): number {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0),
  );
}
