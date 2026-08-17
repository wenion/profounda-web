"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function PublicFooter() {
  const t = useTranslations("PublicFooter");

  return (
    <footer className="border-t border-white/[0.08] bg-[#080B13]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-serif text-lg font-semibold tracking-wide text-[#EDEAE1]"
            >
              Pro
              <span className="text-[#C9A15C]">
                found
              </span>
              a
            </Link>
          </div>

          {/* Links */}
          {/* <div className="flex gap-8 text-xs text-[#6F768A]">
            <Link
              href="/#performance"
              className="transition hover:text-[#EDEAE1]"
            >
              {t("performance")}
            </Link>

            <Link
              href="/#community"
              className="transition hover:text-[#EDEAE1]"
            >
              {t("community")}
            </Link>
          </div> */}
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-6">
          <div className="flex flex-col gap-3 text-[11px] leading-5 text-[#454B5E] sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-3xl">
              {t("disclaimer")}
            </p>

            <p className="shrink-0">
              © 2026 Profounda
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}