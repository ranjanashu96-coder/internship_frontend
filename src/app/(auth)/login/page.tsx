"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { ElementType, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button, Input } from "@/components/ui";
import { authService } from "@/lib/services";
import { useAuthStore } from "@/store/auth-store";

/* =========================================================
   VALIDATION
========================================================= */

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Username, email or registration number is required"),

  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/* =========================================================
   ROLE REDIRECTS
========================================================= */

const roleRedirect: Record<string, string> = {
  super_admin: "/admin",
  admin: "/admin",
  college_admin: "/college",
  mentor: "/mentor",
  student: "/student",
};

/* =========================================================
   PAGE
========================================================= */

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
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await authService.login({
        identifier: values.identifier.trim(),
        password: values.password,
      });

      const responseData = response.data?.data;
      const user = responseData?.user;
      const accessToken = responseData?.accessToken;

      if (!user || !accessToken) {
        throw new Error("Invalid login response");
      }

      const redirectPath = roleRedirect[user.role];

      if (!redirectPath) {
        throw new Error(`Unknown role received: ${user.role}`);
      }

      setAuth(user, accessToken);

      toast.success("Login successful");

      router.replace(redirectPath);
      router.refresh();
    } catch (error: unknown) {
      console.error("LOGIN ERROR:", error);

      const requestError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      toast.error(
        requestError.response?.data?.message ||
          requestError.message ||
          "Login failed. Please check your username and password.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8fc]">
      <div className="grid min-h-screen lg:grid-cols-[1.06fr_.94fr]">
        {/* =====================================================
            LEFT BRAND / VISUAL PANEL
        ===================================================== */}
        <section className="relative hidden min-h-screen overflow-hidden bg-[#071a3c] lg:block">
          {/* Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(70,181,255,.22),transparent_28%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,.28),transparent_34%),linear-gradient(135deg,#06142c_0%,#08285b_55%,#0b4b8f_100%)]" />

          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:42px_42px]" />

          <motion.div
            className="absolute -left-28 -top-24 h-[360px] w-[360px] rounded-full bg-cyan-300/15 blur-3xl"
            animate={{ x: [0, 26, 0], y: [0, 20, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute -bottom-32 -right-20 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl"
            animate={{ x: [0, -22, 0], y: [0, -18, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 flex min-h-screen flex-col justify-between px-12 py-9 xl:px-16 xl:py-11">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <Link href="/" className="inline-flex rounded-2xl bg-white p-3 shadow-xl">
                <img
                  src="/rknexora_logo.png"
                  alt="RK Nexora"
                  className="h-[62px] w-auto object-contain"
                />
              </Link>
            </motion.div>

            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.12 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-cyan-100 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                Secure internship management platform
              </div>

              <h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-[-0.045em] text-white xl:text-[62px]">
                One platform.
                <span className="mt-2 block text-cyan-300">
                  Every internship journey.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/68">
                Manage learning, attendance, mentorship, assessments, payments
                and verified documents through one connected RK NEXORA
                ecosystem.
              </p>

              <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-2">
                <FeatureItem
                  icon={BarChart3}
                  title="Role-Based Dashboard"
                  text="Personalized access for every user"
                />

                <FeatureItem
                  icon={BookOpenCheck}
                  title="Learning Management"
                  text="Modules, assignments and progress"
                />

                <FeatureItem
                  icon={CheckCircle2}
                  title="Attendance & Reports"
                  text="Complete digital internship tracking"
                />

                <FeatureItem
                  icon={Award}
                  title="Verified Documents"
                  text="Certificates, reports and assessments"
                />
              </div>

              {/* Mini dashboard card */}
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="mt-8 max-w-xl rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl"
              >
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["50+", "Domains"],
                    ["120+", "Hours"],
                    ["Verified", "Documents"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"
                    >
                      <strong className="block text-lg font-black text-white">
                        {value}
                      </strong>
                      <span className="mt-1 block text-xs text-white/45">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/15 pt-5 text-xs text-white/45">
              <span>© 2026 RK NEXORA Private Limited</span>

              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                Secure authentication
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ===================================================== */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
          <motion.div
            className="absolute right-[-80px] top-[-80px] h-80 w-80 rounded-full bg-blue-200/45 blur-3xl"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute bottom-[-90px] left-[-80px] h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl"
            animate={{ scale: [1.08, 1, 1.08] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="relative z-10 w-full max-w-[470px]"
          >
            {/* Mobile header */}
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link href="/" className="inline-flex rounded-2xl bg-white p-2.5 shadow-sm">
                <img
                  src="/rknexora_logo.png"
                  alt="RK Nexora"
                  className="h-[54px] w-auto object-contain"
                />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                <Sparkles className="h-4 w-4" />
                Secure Login
              </div>

              <h2 className="text-4xl font-black tracking-[-0.035em] text-[#071a2f] sm:text-[44px]">
                Welcome back
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Sign in with your username, email or registration number to
                continue to your dashboard.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-[30px] border border-white bg-white/90 p-6 shadow-[0_28px_80px_rgba(15,23,42,.13)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-[#f7faff] p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#071a2f] text-white">
                  <LockKeyhole className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-black text-[#071a2f]">
                    Account Access
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Enter your registered login credentials
                  </p>
                </div>
              </div>

              <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
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
                      className={`h-14 rounded-xl border-slate-200 bg-slate-50/80 pl-12 pr-4 text-sm transition focus:bg-white ${
                        errors.identifier
                          ? "border-red-400 focus-visible:ring-red-200"
                          : ""
                      }`}
                      {...register("identifier")}
                    />
                  </div>

                  {errors.identifier && (
                    <p className="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {errors.identifier.message}
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
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={`h-14 rounded-xl border-slate-200 bg-slate-50/80 pl-12 pr-12 text-sm transition focus:bg-white ${
                        errors.password
                          ? "border-red-400 focus-visible:ring-red-200"
                          : ""
                      }`}
                      {...register("password")}
                    />

                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((current) => !current)}
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
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="group h-14 w-full rounded-xl bg-[#071a2f] font-black text-white shadow-lg shadow-slate-900/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#0b294b] hover:shadow-xl disabled:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to dashboard
                      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  New student
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Registration CTA */}
              <Link
                href="/register"
                className="group flex items-center justify-between rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <GraduationCap className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[#071a2f]">
                      Complete student registration
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Verify your registration and create an account
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-5 w-5 shrink-0 text-blue-600 transition group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              Your account is protected with secure authentication
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   FEATURE ITEM
========================================================= */

function FeatureItem({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-black text-white">{title}</p>
          <p className="mt-1 text-xs leading-5 text-white/50">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}