"use client";

import {create} from "zustand";
import {persist} from "zustand/middleware";

const MAX_HISTORY_ITEMS = 10;

export const useSearchHistoryStore = create(
  persist(
    (set, get) => ({
      searchHistory: [],

      // Add search term to history
      addToHistory: (searchTerm) => {
        if (!searchTerm || !searchTerm.trim()) return;

        const trimmedTerm = searchTerm.trim();
        const currentHistory = get().searchHistory;

        // Remove duplicate if exists and add to front
        const newHistory = [
          trimmedTerm,
          ...currentHistory.filter((item) => item !== trimmedTerm),
        ].slice(0, MAX_HISTORY_ITEMS);

        set({searchHistory: newHistory});
      },

      // Remove specific item from history
      removeFromHistory: (searchTerm) => {
        const currentHistory = get().searchHistory;
        const newHistory = currentHistory.filter((item) => item !== searchTerm);
        set({searchHistory: newHistory});
      },

      // Clear all history
      clearHistory: () => {
        set({searchHistory: []});
      },
    }),
    {
      name: "nexttv-search-history",
    }
  )
);
