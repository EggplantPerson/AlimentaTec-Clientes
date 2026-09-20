import { create } from "zustand";

// Store simple (sin persistencia) para controlar el pop-up global de notificaciones
interface ToastState {
  message: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  showToast: (message) => set({ message }),
  hideToast: () => set({ message: null }),
}));
