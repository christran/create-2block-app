import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NavbarState {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const useNavbarStore = create<NavbarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: "navbarClosed",
    }
  )
);