import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { getProducts } from "../services/product.service";

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  available: boolean;
  category: string;
  notes: string;
}

export type ProductInput = Omit<Product, "id">;

export const ALL_CATEGORIES_LABEL = "Todos";
export const AVAILABLE_FILTER_LABEL = "Disponibles";

interface ProductsState {
  products: Product[];
  categories: string[];
  selectedProduct?: Product;
  selectedCategory: string;
  loading: boolean;
  saving: boolean;
  error: string | null;

  setCategory: (category: string) => void;
  loadProducts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  selectProduct: (id: string) => Promise<Product | undefined>;
  createProduct: (product: ProductInput) => Promise<void>;
  updateProduct: (id: string, product: Partial<ProductInput>) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: [],
  selectedProduct: undefined,
  selectedCategory: ALL_CATEGORIES_LABEL,
  loading: false,
  saving: false,
  error: null,

  setCategory: (category) => set({ selectedCategory: category }),

  loadProducts: async () => {
    set({ loading: true, error: null });

    try {
      const data = await getProducts();

      const products: Product[] = data.map((product: any) => ({
        id: String(product.id),
        name: product.name,
        description: product.description,
        image: product.image_url,
        price: Number(product.price),
        available: product.available,
        category: product.category,
        notes: "",
      }));

      set({
        products,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.log("Error al cargar productos:", error);

      set({
        products: [],
        loading: false,
        error: "No se pudieron cargar los productos",
      });
    }
  },

  loadCategories: async () => {
    const products = get().products;

    set({
      categories: Array.from(
        new Set(products.map((product) => product.category)),
      ),
    });
  },

  selectProduct: async (id) => {
    const product = get().products.find((item) => item.id === id);

    if (product) {
      set({ selectedProduct: product });
      return product;
    }

    set({ selectedProduct: undefined });
    return undefined;
  },

  createProduct: async (product) => {
    set({ saving: true, error: null });

    try {
      const newProduct: Product = {
        id: String(Date.now()),
        ...product,
      };

      set((state) => {
        const products = [...state.products, newProduct];

        return {
          products,
          categories: Array.from(
            new Set(products.map((item) => item.category)),
          ),
          selectedProduct: newProduct,
          saving: false,
        };
      });
    } catch (error) {
      set({
        saving: false,
        error: "No se pudo crear el producto",
      });
    }
  },

  updateProduct: async (id, product) => {
    set({ saving: true, error: null });

    try {
      set((state) => {
        const updatedProduct = state.products.find((item) => item.id === id);

        if (!updatedProduct) {
          return {
            saving: false,
            error: "Producto no encontrado",
          };
        }

        const nextProduct = {
          ...updatedProduct,
          ...product,
        };

        const products = state.products.map((item) =>
          item.id === id ? nextProduct : item,
        );

        return {
          products,
          categories: Array.from(
            new Set(products.map((item) => item.category)),
          ),
          selectedProduct: nextProduct,
          saving: false,
        };
      });
    } catch (error) {
      set({
        saving: false,
        error: "No se pudo actualizar el producto",
      });
    }
  },

  getProductById: (id) => get().products.find((product) => product.id === id),
}));

export function useCategories(): string[] {
  const products = useProductsStore((state) => state.products);
  const categories = useProductsStore((state) => state.categories);

  return useMemo(() => {
    const unique = Array.from(
      new Set(
        categories.length
          ? categories
          : products.map((product) => product.category),
      ),
    );

    return [ALL_CATEGORIES_LABEL, AVAILABLE_FILTER_LABEL, ...unique];
  }, [categories, products]);
}

export function useFilteredProducts(): Product[] {
  const products = useProductsStore((state) => state.products);
  const selectedCategory = useProductsStore((state) => state.selectedCategory);

  return useMemo(() => {
    let list = products;

    if (selectedCategory === AVAILABLE_FILTER_LABEL) {
      list = products.filter((product) => product.available);
    } else if (selectedCategory !== ALL_CATEGORIES_LABEL) {
      list = products.filter(
        (product) => product.category === selectedCategory,
      );
    }

    return [...list].sort((a, b) => {
      if (a.available === b.available) return 0;
      return a.available ? -1 : 1;
    });
  }, [products, selectedCategory]);
}

export function useLoadProducts(): void {
  const loadProducts = useProductsStore((state) => state.loadProducts);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);
}
