"use client";

import type { ComponentProps } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { authService } from "@/services/authService";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const t = useTranslations("Signup");

  const redirectParam =
    searchParams.get("redirect");

  const redirect =
    redirectParam?.startsWith("/") &&
    !redirectParam.startsWith("//")
      ? redirectParam
      : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  const handleSignup:
    ComponentProps<"form">["onSubmit"] =
    async (event) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      setError("");

      if (password !== confirmPassword) {
        setError(t("errors.passwordMismatch"));
        return;
      }

      setLoading(true);

      try {
        await authService.signUpWithEmail(
          name.trim(),
          email.trim(),
          password,
        );

        router.replace(redirect);
      } catch {
        setError(t("errors.signup"));
      } finally {
        setLoading(false);
      }
    };

  async function handleGoogleSignup() {
    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authService.signInWithGoogle();

      router.replace(redirect);
    } catch {
      setError(t("errors.google"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0B0F1A]">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-[#C9A15C]/[0.04] blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#4FA9A0]/[0.025] blur-[140px]" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        {/* ========================================
            Left side
        ======================================== */}
        <section className="hidden border-r border-white/[0.07] px-12 py-12 lg:flex lg:flex-col xl:px-20">
          {/* Brand */}
          {/* <Link
            href={homeHref}
            className="inline-flex w-fit items-center gap-3"
          >
            <LogoMark />

            <span className="font-serif text-xl font-semibold tracking-tight text-[#EDEAE1]">
              Profounda
            </span>
          </Link> */}

          {/* Hero */}
          <div className="my-auto max-w-lg">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#C9A15C]">
              {t("hero.eyebrow")}
            </p>

            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.12] tracking-tight text-[#EDEAE1] xl:text-6xl">
              {t("hero.title")}
            </h1>

            <p className="mt-7 max-w-md text-base leading-8 text-[#8B92A6]">
              {t("hero.description")}
            </p>

            <div className="mt-12 space-y-6">
              <Feature>
                {t("hero.tracking")}
              </Feature>

              <Feature>
                {t("hero.portfolio")}
              </Feature>

              <Feature>
                {t("hero.rebalance")}
              </Feature>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="max-w-md text-[11px] leading-5 text-[#454B5E]">
            {t("disclaimer")}
          </p>
        </section>

        {/* ========================================
            Right side
        ======================================== */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-[430px]">
            {/* Mobile logo */}
            <Link href="/">
              <LogoMark />

              <span className="font-serif text-xl font-semibold tracking-tight text-[#EDEAE1]">
                Profounda
              </span>
            </Link>

            {/* Heading */}
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#C9A15C]">
                {t("eyebrow")}
              </p>

              <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[#EDEAE1]">
                {t("title")}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#697386]">
                {t("description")}
              </p>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="mt-9 flex w-full items-center justify-center gap-3 rounded-md border border-white/[0.12] bg-white/[0.025] px-4 py-3.5 cursor-pointer text-sm font-medium text-[#D8D6CF] transition hover:border-white/[0.2] hover:bg-white/[0.045] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <GoogleIcon />

              {t("google")}
            </button>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.08]" />

              <span className="text-[10px] uppercase tracking-[0.16em] text-[#454B5E]">
                {t("or")}
              </span>

              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            {/* ========================================
                Signup form
            ======================================== */}
            <form
              onSubmit={handleSignup}
              className="space-y-5"
            >
              <Field
                id="name"
                label={t("name")}
                type="text"
                autoComplete="name"
                value={name}
                onChange={setName}
              />

              <Field
                id="email"
                label={t("email")}
                type="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
              />

              <div>
                <Field
                  id="password"
                  label={t("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={setPassword}
                  minLength={6}
                  showPasswordToggle
                  showPassword={showPassword}
                  onTogglePassword={() =>
                    setShowPassword((value) => !value)
                  }
                />

                <div className="mt-5">
                  <Field
                    id="confirmPassword"
                    label={t("confirmPassword")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    minLength={6}
                  />
                </div>

                {confirmPassword &&
                  password !== confirmPassword && (
                    <p className="mt-2 text-[11px] text-[#D47A68]">
                      {t("errors.passwordMismatch")}
                    </p>
                  )}

                <p className="mt-2 text-[11px] text-[#454B5E]">
                  {t("passwordHint")}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-md border border-[#C1614F]/20 bg-[#C1614F]/[0.06] px-4 py-3"
                >
                  <p className="text-xs leading-5 text-[#D47A68]">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#C9A15C] px-4 py-3.5 text-sm font-semibold cursor-pointer text-[#0B0F1A] transition hover:bg-[#D8B36F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? t("creating")
                  : t("createAccount")}
              </button>
            </form>

            {/* Login */}
            <p className="mt-7 text-center text-sm text-[#697386]">
              {t("hasAccount")}{" "}
              <Link
                href={`/login?redirect=${encodeURIComponent(redirect)}`}
                className="font-medium text-[#E4BC7A] transition hover:text-[#F0CC8E]"
              >
                {t("login")}
              </Link>
            </p>

            {/* Mobile disclaimer */}
            <p className="mt-12 text-center text-[10px] leading-5 text-[#3F4658] lg:hidden">
              {t("disclaimer")}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ========================================
   Field
======================================== */

type FieldProps = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;

  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
};

function Field({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  minLength,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium text-[#8B92A6]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`w-full rounded-md border border-white/[0.1] bg-[#101521] px-4 py-3.5 text-sm text-[#EDEAE1] outline-none transition placeholder:text-[#3F4658] hover:border-white/[0.16] focus:border-[#C9A15C]/60 focus:ring-1 focus:ring-[#C9A15C]/20 ${
            showPasswordToggle ? "pr-12" : ""
          }`}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#697386] transition hover:text-[#E4BC7A]"
          >
            {showPassword ? (
              <EyeOffIcon />
            ) : (
              <EyeIcon />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ========================================
   Feature
======================================== */

function Feature({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A15C]" />

      <p className="text-sm leading-6 text-[#8B92A6]">
        {children}
      </p>
    </div>
  );
}

/* ========================================
   Logo
======================================== */

function LogoMark() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#C9A15C]/30 bg-[#C9A15C]/[0.08]">
      <span className="font-serif text-lg font-semibold text-[#E4BC7A]">
        P
      </span>
    </div>
  );
}

/* ========================================
   Google icon
======================================== */

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.18c0-.64-.06-1.25-.17-1.84H12v3.48h5.25a4.49 4.49 0 0 1-1.95 2.95v2.26h3.16c1.85-1.7 2.89-4.21 2.89-6.85Z"
      />

      <path
        fill="#34A853"
        d="M12 21.7c2.64 0 4.86-.88 6.48-2.38l-3.16-2.45c-.88.59-2 .94-3.32.94-2.55 0-4.71-1.72-5.48-4.03H3.26v2.53A9.79 9.79 0 0 0 12 21.7Z"
      />

      <path
        fill="#FBBC05"
        d="M6.52 13.78A5.9 5.9 0 0 1 6.21 12c0-.62.11-1.22.31-1.78V7.69H3.26A9.7 9.7 0 0 0 2.2 12c0 1.56.37 3.04 1.06 4.31l3.26-2.53Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.19c1.44 0 2.73.49 3.74 1.46l2.81-2.81A9.42 9.42 0 0 0 12 2.3a9.79 9.79 0 0 0-8.74 5.39l3.26 2.53C7.29 7.91 9.45 6.19 12 6.19Z"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.2" />
      <path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 8 10 8a9.8 9.8 0 0 0 4.1-.9" />
    </svg>
  );
}