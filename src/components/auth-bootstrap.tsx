"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  refreshAccessToken,
} from "@/lib/api";

import {
  useAuthStore,
} from "@/store/auth-store";

const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/register",
];

const isPublicPath = (
  pathname: string,
) => {
  return PUBLIC_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(
        `${route}/`,
      ),
  );
};

export function AuthBootstrap({
  children,
}: {
  children: ReactNode;
}) {
  const pathname =
    usePathname();

  const initialized =
    useAuthStore(
      (state) =>
        state.initialized,
    );

  useEffect(() => {
    const restoreSession =
      async () => {
        /*
         * Registration, login aur payment
         * status public routes hain.
         *
         * In routes par refresh-token call
         * karne ki zarurat nahi hai.
         */
        if (
          isPublicPath(pathname)
        ) {
          useAuthStore
            .getState()
            .setInitialized(true);

          return;
        }

        try {
          await refreshAccessToken();
        } catch {
          useAuthStore
            .getState()
            .clearAuth();
        } finally {
          useAuthStore
            .getState()
            .setInitialized(true);
        }
      };

    void restoreSession();
  }, [pathname]);

  /*
   * Public pages ko session restore
   * loader ke peeche block mat karo.
   */
  if (
    !initialized &&
    !isPublicPath(pathname)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-3 text-sm text-slate-500">
            Restoring session...
          </p>
        </div>
      </div>
    );
  }

  return children;
}