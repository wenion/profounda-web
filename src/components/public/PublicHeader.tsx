"use client";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import { Link } from "@/i18n/navigation";

export function PublicHeader() {
  const locale = useLocale();
  const t = useTranslations(
    "PublicNavigation",
  );

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
            href="/#performance"
            className="hidden text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] md:block"
          >
            {t("performance")}
          </Link>

          <Link
            href="/#holdings"
            className="hidden text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] md:block"
          >
            {t("holdings")}
          </Link>

          <Link
            href="/#community"
            className="hidden text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] md:block"
          >
            {t("community")}
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

          <div className="hidden h-4 w-px bg-white/10 sm:block" />

          {/* Auth */}
          <Link
            href="/login"
            className="text-sm font-medium text-[#A8AEBE] transition hover:text-[#EDEAE1]"
          >
            {t("login")}
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-[#C9A15C] px-4 py-2 text-sm font-semibold text-[#0B0F1A] transition hover:bg-[#E4BC7A]"
          >
            {t("getStarted")}
          </Link>
        </nav>
      </div>
    </header>
  );
}