"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button, Input } from "@/components/ui";
import { authService } from "@/lib/services";
import { useAuthStore } from "@/store/auth-store";

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(
      1,
      "Username, email or registration number is required",
    ),

  password: z
    .string()
    .min(
      1,
      "Password is required",
    ),
});

type LoginFormValues =
  z.infer<typeof loginSchema>;

/*
|--------------------------------------------------------------------------
| Role redirects
|--------------------------------------------------------------------------
*/

const roleRedirect: Record<
  string,
  string
> = {
  super_admin: "/admin",
  admin: "/admin",
  college_admin: "/college",
  mentor: "/mentor",
  student: "/student",
};

export default function LoginPage() {
  const router = useRouter();

  const setAuth =
    useAuthStore(
      (state) => state.setAuth,
    );

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<LoginFormValues>({
      resolver:
        zodResolver(
          loginSchema,
        ),

      defaultValues: {
        identifier: "",
        password: "",
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const onSubmit = async (
    values: LoginFormValues,
  ) => {
    try {
      const response =
        await authService.login({
          identifier:
            values.identifier.trim(),

          password:
            values.password,
        });

      const responseData =
        response.data?.data;

      const user =
        responseData?.user;

      const accessToken =
        responseData?.accessToken;

      if (
        !user ||
        !accessToken
      ) {
        throw new Error(
          "Invalid login response",
        );
      }

      const redirectPath =
        roleRedirect[
          user.role
        ];

      if (!redirectPath) {
        throw new Error(
          `Unknown role received: ${user.role}`,
        );
      }

      setAuth(
        user,
        accessToken,
      );

      toast.success(
        "Login successful",
      );

      router.replace(
        redirectPath,
      );

      router.refresh();
    } catch (error: unknown) {
      console.error(
        "LOGIN ERROR:",
        error,
      );

      const requestError =
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
          message?: string;
        };

      toast.error(
        requestError.response
          ?.data?.message ||
          requestError.message ||
          "Login failed. Please check your username and password.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">

        {/* ================================
            LEFT IMAGE SECTION
        ================================= */}

        <section className="relative hidden min-h-screen overflow-hidden lg:block">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/images/login-hero.jpg')",
            }}
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#061426]/95 via-[#071a2f]/80 to-[#0c4a6e]/70" />

          {/* Decorative glow */}
          <div className="absolute -left-36 -top-36 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="absolute -bottom-40 -right-28 h-[450px] w-[450px] rounded-full bg-blue-500/25 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex min-h-screen flex-col justify-between px-12 py-10 xl:px-16 xl:py-12">
            {/* Logo */}
            <Link
              href="/"
              className="flex w-fit items-center gap-3"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#071a2f] shadow-xl">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  RK
                  <span className="text-cyan-300">
                    Nexora
                  </span>
                </h1>

                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">
                  Internship ERP
                </p>
              </div>
            </Link>

            {/* Main message */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                Secure internship management platform
              </div>

              <h2 className="text-5xl font-black leading-[1.08] tracking-[-0.045em] text-white xl:text-6xl">
                Build skills.
                <span className="mt-2 block text-cyan-300">
                  Track progress.
                </span>
                Shape careers.
              </h2>

              <p className="mt-6 max-w-lg text-base leading-8 text-white/70">
                One unified platform for colleges,
                mentors and students to manage
                internships, learning, attendance,
                assessments, payments and certificates.
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
                <FeatureItem text="Role-based dashboard" />

                <FeatureItem text="Learning and assessments" />

                <FeatureItem text="Attendance tracking" />

                <FeatureItem text="Verified certificates" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/55">
              <span>
                © 2026 RKNexora
              </span>

              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                Secure access
              </span>
            </div>
          </div>
        </section>

        {/* ================================
            RIGHT LOGIN SECTION
        ================================= */}

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
          {/* Background shapes */}
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />

          <div className="relative z-10 w-full max-w-[440px]">
            {/* Mobile logo */}
            <Link
              href="/"
              className="mb-10 flex w-fit items-center gap-3 lg:hidden"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#071a2f] text-white">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-black text-[#071a2f]">
                  RK
                  <span className="text-blue-600">
                    Nexora
                  </span>
                </h1>

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Internship ERP
                </p>
              </div>
            </Link>

            {/* Heading */}
            <div className="mb-8">
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#071a2f] text-white shadow-lg shadow-slate-900/15">
                <LockKeyhole className="h-6 w-6" />
              </div>

              <h2 className="text-3xl font-black tracking-tight text-[#071a2f] sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your login details to access
                your RKNexora dashboard.
              </p>
            </div>

            {/* Login card */}
            <div className="rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
              <form
                noValidate
                onSubmit={
                  handleSubmit(
                    onSubmit,
                  )
                }
                className="space-y-5"
              >
                {/* Identifier */}
                <div>
                  <label
                    htmlFor="identifier"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Username, email or registration number
                  </label>

                  <div className="relative">
                   

                    <Input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      placeholder="Enter your login ID"
                      className={`h-13 rounded-xl border-slate-200 bg-slate-50/70 pl-12 text-sm transition focus:bg-white ${
                        errors.identifier
                          ? "border-red-400 focus-visible:ring-red-200"
                          : ""
                      }`}
                      {...register(
                        "identifier",
                      )}
                    />
                  </div>

                  {errors.identifier && (
                    <p className="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                      {
                        errors
                          .identifier
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="password"
                      className="text-sm font-bold text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-bold text-blue-600 transition hover:text-blue-800 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                  
                    <Input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={`h-13 rounded-xl border-slate-200 bg-slate-50/70 px-12 text-sm transition focus:bg-white ${
                        errors.password
                          ? "border-red-400 focus-visible:ring-red-200"
                          : ""
                      }`}
                      {...register(
                        "password",
                      )}
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (
                            current,
                          ) =>
                            !current,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#071a2f]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                      {
                        errors
                          .password
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  className="h-13 w-full rounded-xl bg-[#071a2f] font-bold text-white shadow-lg shadow-slate-900/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#0b294b] hover:shadow-xl disabled:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Student registration */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  New student
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <Link
                href="/register"
                className="group flex items-center justify-between rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <GraduationCap className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#071a2f]">
                      Student registration
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Complete your internship registration
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-5 w-5 text-blue-600 transition group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Bottom message */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4" />

              Your account is protected with secure authentication
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Feature item
|--------------------------------------------------------------------------
*/

function FeatureItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-300" />

      <span className="text-sm font-semibold text-white/85">
        {text}
      </span>
    </div>
  );
}