import { create } from "zustand";
import { getStoreState } from "../services/storeState.service";

// Normaliza la respuesta del backend. Si no reconoce el formato devuelve null
// y el estado actual no cambia.
function parseIsOpen(data: unknown): boolean | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const raw = d.isOpen ?? d.is_open ?? d.open ?? d.status;

  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    const v = raw.toLowerCase();
    if (["open", "abierta", "abierto"].includes(v)) return true;
    if (["closed", "cerrada", "cerrado"].includes(v)) return false;
  }
  return null;
}

type StoreStateStore = {
  isOpen: boolean;
  loading: boolean;
  setOpen: (isOpen: boolean) => void;
  loadStoreState: () => Promise<void>;
};

export const useStoreStateStore = create<StoreStateStore>((set) => ({
  isOpen: true, // abierta por defecto para no mostrar el cierre antes de saber el estado
  loading: false,
  setOpen: (isOpen) => set({ isOpen }),
  loadStoreState: async () => {
    set({ loading: true });
    try {
      const data = await getStoreState();
      const isOpen = parseIsOpen(data);
      if (isOpen !== null) set({ isOpen });
    } catch (e) {
      console.log("No se pudo obtener el estado de la tienda:", e);
    } finally {
      set({ loading: false });
    }
  },
}));
