import { create } from "zustand";

import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  initialized: boolean;

  setAuth: (
    user: User,
    accessToken: string,
  ) => void;

  setAccessToken: (
    accessToken: string | null,
  ) => void;

  setInitialized: (
    initialized: boolean,
  ) => void;

  clearAuth: () => void;
}

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    initialized: false,

    setAuth: (
      user,
      accessToken,
    ) =>
      set({
        user,
        accessToken,
        initialized: true,
      }),

    setAccessToken: (
      accessToken,
    ) =>
      set({
        accessToken,
      }),

    setInitialized: (
      initialized,
    ) =>
      set({
        initialized,
      }),

    clearAuth: () => {
      /*
       * Remove data left by the old persisted store.
       */
      if (
        typeof window !==
        "undefined"
      ) {
        localStorage.removeItem(
          "rknexora-auth",
        );
      }

      set({
        user: null,
        accessToken: null,
        initialized: true,
      });
    },
  }));