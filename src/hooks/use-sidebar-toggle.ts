import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface useSidebarToggleStore {
  isClosed: boolean;
  setIsClosed: () => void;
}

export const useSidebarToggle = create(
  persist<useSidebarToggleStore>(
    (set, get) => ({
      isClosed: true,
      setIsClosed: () => {
        set({ isClosed: !get().isClosed });
      }
    }),
    {
      name: "sidebarClosed",
      storage: createJSONStorage(() => localStorage)
    }
  )
);