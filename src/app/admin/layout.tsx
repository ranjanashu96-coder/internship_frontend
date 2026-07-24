import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <AppShell role="admin">{children}</AppShell>
    </AuthGuard>
  );
}