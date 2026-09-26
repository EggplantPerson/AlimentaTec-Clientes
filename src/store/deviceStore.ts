import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Store que asigna y conserva un identificador único por dispositivo/instalación
interface DeviceState {
  deviceId: string | null;
  ensureDeviceId: () => string;
}

export const useDeviceStore = create<DeviceState>()(
  persist<DeviceState>(
    (set, get) => ({
      deviceId: null,

      // Si ya existe un deviceId, lo devuelve. Si no, genera uno nuevo y lo guarda.
      ensureDeviceId: () => {
        const current = get().deviceId;
        if (current) return current;

        const newId = Crypto.randomUUID();
        set({ deviceId: newId });
        return newId;
      },
    }),
    {
      name: "device-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
