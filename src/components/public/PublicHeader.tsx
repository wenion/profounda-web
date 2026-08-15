"use client";

"use client";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";

export function PublicHeader() {
  const locale = useLocale();
  const t = useTranslations("PublicNavigation");
  const { user, loading } = useAuth();

  const displayName =
    user?.displayName ||
    user?.email ||
    "";

  const initial =
    displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await authService.signOut();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0B0F1A]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-wide text-[#EDEAE1]"
        >
          Pro
          <span className="text-[#C9A15C]">
            found
          </span>
          a
        </Link>

        {/* Desktop navigation */}
        <nav className="flex items-center gap-5 sm:gap-6">
          <Link
            href="/"
            className="hidden text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] md:block"
          >
            {t("home")}
          </Link>

          <Link
            href="/analysis"
            className="hidden text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] md:block"
          >
            {t("analysis")}
          </Link>

          <Link
            href="/subscription"
            className="hidden text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] md:block"
          >
            {t("subscription")}
          </Link>

          <div className="hidden h-4 w-px bg-white/10 md:block" />

          {/* Language */}
          <div className="hidden items-center gap-2 text-xs sm:flex">
            <Link
              href="/"
              locale="zh"
              className={
                locale === "zh"
                  ? "text-[#E4BC7A]"
                  : "text-[#5A6178] transition hover:text-[#EDEAE1]"
              }
            >
              中文
            </Link>

            <span className="text-white/20">
              /
            </span>

            <Link
              href="/"
              locale="en"
              className={
                locale === "en"
                  ? "text-[#E4BC7A]"
                  : "text-[#5A6178] transition hover:text-[#EDEAE1]"
              }
            >
              EN
            </Link>
          </div>

          {/* Logged-in user */}
          {!loading && user && (
            <>
              <div className="hidden h-6 w-px bg-white/10 sm:block" />

              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A15C]/15 text-xs font-semibold text-[#E4BC7A]">
                    {initial}
                  </div>
                )}

                <div className="hidden sm:block">
                  <p className="max-w-40 truncate text-sm text-[#EDEAE1]">
                    {displayName}
                  </p>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="cursor-pointer text-xs text-[#5A6178] transition hover:text-[#E4BC7A]"
                  >
                    {t("logout")}
                  </button>
                </div>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}