"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";
import type { Role } from "@/types";

const roleRoutes: Record<Role, string> = {
  super_admin: "/admin",
  admin: "/admin",
  college_admin: "/college",
  mentor: "/mentor",
  student: "/student",
};

export function AuthGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Role[];
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const isAllowed = Boolean(
    user && (!roles || roles.includes(user.role)),
  );

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (roles && !roles.includes(user.role)) {
      router.replace(roleRoutes[user.role] ?? "/login");
    }
  }, [user, roles, router]);

  if (!isAllowed) {
    return (
      <div className="grid min-h-screen place-items-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}