
"use client";

import {
  Suspense,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { toast } from "sonner";

import {
  Button,
  Input,
} from "@/components/ui";

import { authService } from "@/lib/services";

function ResetPasswordContent() {
  const searchParams =
    useSearchParams();

  const router =
    useRouter();

  const token =
    searchParams.get("token") ??
    "";

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const handleResetPassword =
    async () => {
      if (!token) {
        toast.error(
          "Reset token is missing or invalid",
        );
        return;
      }

      if (
        password.length < 8
      ) {
        toast.error(
          "Password must contain at least 8 characters",
        );
        return;
      }

      try {
        setLoading(true);

        await authService.reset(
          token,
          password,
        );

        toast.success(
          "Password updated successfully",
        );

        router.replace(
          "/login",
        );
      } catch (
        error: unknown
      ) {
        const message =
          typeof error ===
            "object" &&
          error !== null &&
          "response" in error
            ? (
                error as {
                  response?: {
                    data?: {
                      message?: string;
                    };
                  };
                }
              ).response?.data
                ?.message
            : undefined;

        toast.error(
          message ||
            "Password could not be updated",
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold">
          Reset password
        </h1>

        <Input
          className="mt-4"
          type="password"
          value={password}
          onChange={(
            event,
          ) =>
            setPassword(
              event.target
                .value,
            )
          }
          placeholder="New password"
          autoComplete="new-password"
        />

        <Button
          className="mt-4 w-full"
          disabled={
            loading ||
            !token
          }
          onClick={() =>
            void handleResetPassword()
          }
        >
          {loading
            ? "Updating..."
            : "Update password"}
        </Button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center p-6">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

