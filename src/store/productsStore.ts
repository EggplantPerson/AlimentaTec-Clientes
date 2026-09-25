import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { getProducts } from "../services/product.service";

// Categoría especial: sus productos son "adicionales" (no se muestran como productos navegables)
const ADDONS_CATEGORY = "Adicionales";

// Estructura de datos para representar un producto
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  available: boolean;
  category: string;
  notes: string;
  addons: string[]; // ids de productos-adicional disponibles para este producto
}

// Tipo de utilidad para crear o editar un producto omitiendo el id autogenerado
export type ProductInput = Omit<Product, "id">;

// Constantes para las etiquetas de los filtros del catálogo
export const ALL_CATEGORIES_LABEL = "Todos";
export const AVAILABLE_FILTER_LABEL = "Disponibles";

// Interfaz para la definición del estado global del catálogo de productos y sus acciones
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
  upsertProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
}

// Store principal de Zustand para administrar el inventario y estado del catálogo
export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: [],
  selectedProduct: undefined,
  selectedCategory: ALL_CATEGORIES_LABEL,
  loading: false,
  saving: false,
  error: null,

  // Cambia la categoría seleccionada actualmente en el filtro
  setCategory: (category) => set({ selectedCategory: category }),

  // Carga asíncrona de los productos desde el servicio externo y mapea la respuesta
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
        addons: Array.isArray(product.addons) ? product.addons : [],
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

  // Genera la lista de categorías únicas basándose en los productos cargados
  loadCategories: async () => {
    const products = get().products;

    set({
      categories: Array.from(
        new Set(products.map((product) => product.category)),
      ),
    });
  },

  // Busca un producto por ID y lo establece como el producto seleccionado activo
  selectProduct: async (id) => {
    const product = get().products.find((item) => item.id === id);

    if (product) {
      set({ selectedProduct: product });
      return product;
    }

    set({ selectedProduct: undefined });
    return undefined;
  },

  // Crea un nuevo producto, recalcula las categorías únicas y actualiza la lista
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

  // Modifica un producto existente por id y actualiza el estado global
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

  // Retorna un producto del estado local según su ID
  getProductById: (id) => get().products.find((product) => product.id === id),

  // funcion para actualizar el producto
  upsertProduct: (product) =>
    set((state) => {
      const exists = state.products.some((item) => item.id === product.id);

      const products = exists
        ? state.products.map((item) =>
            item.id === product.id ? product : item,
          )
        : [...state.products, product];

      return {
        products,
        categories: Array.from(new Set(products.map((item) => item.category))),
        selectedProduct:
          state.selectedProduct?.id === product.id
            ? product
            : state.selectedProduct,
      };
    }),
  // funcion para eliminar el pedido
  removeProduct: (id) =>
    set((state) => {
      const products = state.products.filter((item) => item.id !== id);

      return {
        products,
        categories: Array.from(new Set(products.map((item) => item.category))),
        selectedProduct:
          state.selectedProduct?.id === id ? undefined : state.selectedProduct,
      };
    }),
}));

// Hook para obtener las categorías disponibles junto con los filtros especiales de UI
// (la categoría "Adicionales" nunca aparece como chip navegable)
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
    ).filter((cat) => cat !== ADDONS_CATEGORY);

    return [ALL_CATEGORIES_LABEL, AVAILABLE_FILTER_LABEL, ...unique];
  }, [categories, products]);
}

// Hook para obtener la lista de productos filtrada por categoría y ordenada por disponibilidad
// (los productos de la categoría "Adicionales" nunca se listan como producto navegable)
export function useFilteredProducts(): Product[] {
  const products = useProductsStore((state) => state.products);
  const selectedCategory = useProductsStore((state) => state.selectedCategory);

  return useMemo(() => {
    let list = products.filter(
      (product) => product.category !== ADDONS_CATEGORY,
    );

    if (selectedCategory === AVAILABLE_FILTER_LABEL) {
      list = list.filter((product) => product.available);
    } else if (selectedCategory !== ALL_CATEGORIES_LABEL) {
      list = list.filter((product) => product.category === selectedCategory);
    }

    return [...list].sort((a, b) => {
      if (a.available === b.available) return 0;
      return a.available ? -1 : 1;
    });
  }, [products, selectedCategory]);
}

// Hook para resolver los ids guardados en `producto.addons` a los productos-adicional reales
// (busca en el store completo sin filtrar categoría; descarta ids que no existan o no sean de "Adicionales")
export function useAddonsFor(product: Product | undefined): Product[] {
  const products = useProductsStore((state) => state.products);

  return useMemo(() => {
    if (!product) return [];
    return (product.addons ?? [])
      .map((id) =>
        products.find(
          (p) => String(p.id) === id && p.category === ADDONS_CATEGORY,
        ),
      )
      .filter((p): p is Product => Boolean(p));
  }, [product, products]);
}

// Hook de efecto para cargar automáticamente la lista de productos al montar el componente
export function useLoadProducts(): void {
  const loadProducts = useProductsStore((state) => state.loadProducts);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);
}
