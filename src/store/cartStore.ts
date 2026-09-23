import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Product } from "./productsStore";

// Límites permitidos por producto y para el total del carrito
export const MAX_QUANTITY_PER_PRODUCT = 2;
export const MAX_TOTAL_ITEMS = 4;

// Estructura de un elemento dentro del carrito
export interface CartItem {
  product: Product;
  quantity: number;
}

// Función auxiliar para calcular la suma total de unidades en el carrito
function getTotalQuantity(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// Interfaz para la definición del estado del carrito y sus acciones
interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  removeUnavailableItems: (currentProducts: Product[]) => void;
}

// Store principal de Zustand para la gestión del carrito de compras
export const useCartStore = create<CartState>()(
  persist<CartState>(
    (set) => ({
      items: [],

      // Agrega un producto al carrito respetando los límites de stock por producto y total
      addItem: (product) =>
        set((state) => {
          if (getTotalQuantity(state.items) >= MAX_TOTAL_ITEMS) return state;

          const existing = state.items.find(
            (item) => item.product.id === product.id,
          );
          if (existing) {
            if (existing.quantity >= MAX_QUANTITY_PER_PRODUCT) return state;
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        }),

      // Elimina completamente un producto del carrito por su ID
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      // Incrementa la cantidad de un producto específico si no excede los límites
      increaseQuantity: (productId) =>
        set((state) => {
          if (getTotalQuantity(state.items) >= MAX_TOTAL_ITEMS) return state;
          return {
            items: state.items.map((item) =>
              item.product.id === productId &&
              item.quantity < MAX_QUANTITY_PER_PRODUCT
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          };
        }),

      // Reduce la cantidad de un producto y lo remueve si su cantidad llega a cero
      decreaseQuantity: (productId) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.product.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),

      // Vacía todos los elementos del carrito
      clearCart: () => set({ items: [] }),

      // Elimina del carrito cualquier producto que ya no exista o ya no esté disponible
      removeUnavailableItems: (currentProducts) =>
        set((state) => ({
          items: state.items.filter((item) => {
            const currentProduct = currentProducts.find(
              (p) => p.id === item.product.id,
            );
            return currentProduct !== undefined && currentProduct.available;
          }),
        })),
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

// Hook para calcular el monto total a pagar de la compra
export function useCartTotal(): number {
  return useCartStore((state) =>
    state.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    ),
  );
}
