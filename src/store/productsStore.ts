import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import productsData from '../data/products.json';

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

export type ProductInput = Omit<Product, 'id'>;

export const ALL_CATEGORIES_LABEL = 'Todos';

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
  products: productsData as Product[],
  categories: Array.from(new Set((productsData as Product[]).map((product) => product.category))),
  selectedProduct: undefined,
  selectedCategory: ALL_CATEGORIES_LABEL,
  loading: false,
  saving: false,
  error: null,

  setCategory: (category) => set({ selectedCategory: category }),

  loadProducts: async () => {
    set({ loading: true, error: null });
    await Promise.resolve();
    set({ products: [...get().products], loading: false });
  },

  loadCategories: async () => {
    await Promise.resolve();
    set({ categories: Array.from(new Set(get().products.map((product) => product.category))) });
  },

  selectProduct: async (id) => {
    const product = get().products.find((item) => item.id === id);
    if (product) {
      set({ selectedProduct: product });
      return product;
    }

    set({ selectedProduct: undefined, loading: true, error: null });
    await Promise.resolve();
    const selectedProduct = get().products.find((item) => item.id === id);
    set({ selectedProduct, loading: false });
    return selectedProduct;
  },

  createProduct: async (product) => {
    set({ saving: true, error: null });
    await Promise.resolve();
    const ids = get().products.map((item) => Number(item.id)).filter(Number.isFinite);
    const newProduct: Product = { id: String(Math.max(0, ...ids) + 1), ...product };
    set((state) => {
      const products = [...state.products, newProduct];
      return {
        products,
        categories: Array.from(new Set(products.map((item) => item.category))),
        selectedProduct: newProduct,
        saving: false,
      };
    });
  },

  updateProduct: async (id, product) => {
    set({ saving: true, error: null });
    await Promise.resolve();
    set((state) => {
      const updatedProduct = state.products.find((item) => item.id === id);
      if (!updatedProduct) return { saving: false };
      const nextProduct = { ...updatedProduct, ...product };
      const products = state.products.map((item) => (item.id === id ? nextProduct : item));
      return {
        products,
        categories: Array.from(new Set(products.map((item) => item.category))),
        selectedProduct: nextProduct,
        saving: false,
      };
    });
  },

  getProductById: (id) => get().products.find((p) => p.id === id),
}));

export function useCategories(): string[] {
  const products = useProductsStore((state) => state.products);
  const categories = useProductsStore((state) => state.categories);

  return useMemo(() => {
    const unique = Array.from(new Set(categories.length ? categories : products.map((p) => p.category)));
    return [ALL_CATEGORIES_LABEL, ...unique];
  }, [categories, products]);
}

export function useFilteredProducts(): Product[] {
  const products = useProductsStore((state) => state.products);
  const selectedCategory = useProductsStore((state) => state.selectedCategory);

  if (selectedCategory === ALL_CATEGORIES_LABEL) {
    return products;
  }
  return products.filter((p) => p.category === selectedCategory);
}

export function useLoadProducts(): void {
  const loadProducts = useProductsStore((state) => state.loadProducts);
  const loadCategories = useProductsStore((state) => state.loadCategories);

  useEffect(() => {
    void loadProducts();
    void loadCategories();
  }, [loadCategories, loadProducts]);
}