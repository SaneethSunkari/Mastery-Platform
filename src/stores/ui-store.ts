"use client";

import { create } from "zustand";

type UiStore = {
  mobileNavOpen: boolean;
  searchQuery: string;
  setMobileNavOpen: (open: boolean) => void;
  setSearchQuery: (value: string) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  mobileNavOpen: false,
  searchQuery: "",
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setSearchQuery: (value) => set({ searchQuery: value }),
}));
