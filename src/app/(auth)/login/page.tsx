"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button, Input } from "@/components/ui";
import { authService } from "@/lib/services";
import { useAuthStore } from "@/store/auth-store";

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Username, email or registration number is required"),

  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const roleRedirect: Record<string, string> = {
  super_admin: "/admin",
  admin: "/admin",
  college_admin: "/college",
  mentor: "/mentor",
  student: "/student",
};

const platformFeatures = [
  {
    icon: Building2,
    title: "College Management",
    description: "Manage colleges and student records centrally.",
  },
  {
    icon: Users,
    title: "Mentor & Student Tracking",
    description: "Track internship progress and assigned mentors.",
  },
  {
    icon: BookOpenCheck,
    title: "Learning & Assessment",
    description: "Manage modules, assignments and assessments.",
  },
  {
    icon: GraduationCap,
    title: "Verified Certification",
    description: "Generate secure internship certificates.",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",

    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit =
  async (
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

      /*
       * Do not store authentication
       * when the received role is unknown.
       */
      if (!redirectPath) {
        throw new Error(
          `Unknown role received: ${user.role}`,
        );
      }

      /*
       * Store user and access token.
       * The refresh token is already stored
       * by the backend as an HttpOnly cookie.
       */
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
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left section */}
        <section className="relative hidden overflow-hidden bg-[#071a2f] text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,0.22),transparent_32%),linear-gradient(135deg,#061426_0%,#0a2848_55%,#0d3761_100%)]" />

          <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full border border-white/10" />

          <div className="absolute -bottom-48 -right-44 h-[500px] w-[500px] rounded-full border border-white/10" />

          <div className="relative z-10 flex min-h-screen flex-col justify-between p-10 xl:p-14">
            <Link
              href="/"
              className="flex w-fit items-center gap-3 text-2xl font-black tracking-tight"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-[#071a2f] shadow-lg shadow-cyan-400/20">
                <Sparkles className="h-5 w-5" />
              </span>

              <span>
                RK<span className="text-cyan-300">Nexora</span>
              </span>
            </Link>

            <div className="my-14 max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-cyan-100">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                Secure role-based internship ERP
              </div>

              <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.04em] xl:text-6xl">
                One platform for modern
                <span className="mt-2 block text-cyan-300">
                  internship operations.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-white/65">
                Manage colleges, mentors, students, learning, attendance,
                assessments, payments, reports and verified certificates from
                one unified platform.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">
                {platformFeatures.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                    >
                      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                        <Icon className="h-5 w-5" />
                      </div>

                      <h3 className="text-sm font-bold text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-white/50">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-6 text-sm text-white/45">
              <span>© 2026 RKNexora</span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                Secure access
              </span>
            </div>
          </div>
        </section>

        {/* Right login section */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl" />

          <div className="relative z-10 w-full max-w-md">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600 lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-[#071a2f]">
                  <Sparkles className="h-5 w-5" />
                </span>

                <span className="text-2xl font-black text-[#071a2f]">
                  RK<span className="text-blue-500">Nexora</span>
                </span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-9">
              <div className="mb-8">
                <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <LockKeyhole className="h-6 w-6" />
                </div>

                <h2 className="text-3xl font-black tracking-tight text-[#071a2f]">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in using your username, email, employee ID or
                  registration number.
                </p>
              </div>

              <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="identifier"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Username, email or registration number
                  </label>

                  <div className="relative">
                    <UserRoundCheck className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <Input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      placeholder="admin or admin@rknexora.com"
                      className={`h-12 pl-12 ${
                        errors.identifier
                          ? "border-red-400 focus-visible:ring-red-200"
                          : ""
                      }`}
                      {...register("identifier")}
                    />
                  </div>

                  {errors.identifier && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {errors.identifier.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-bold text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      className={`h-12 px-12 ${
                        errors.password
                          ? "border-red-400 focus-visible:ring-red-200"
                          : ""
                      }`}
                      {...register("password")}
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-[#071a2f] font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#0b294b]"
                  disabled={isSubmitting}
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

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  New student
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <GraduationCap className="h-5 w-5" />
                  </span>

                  <div>
                    <h3 className="font-bold text-[#071a2f]">
                      Student registration
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your college must preload your registration number before
                      you start registration.
                    </p>

                    <Link
                      href="/register"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:gap-3"
                    >
                      Complete registration
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              By signing in, you agree to the platform&apos;s terms and privacy
              policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}