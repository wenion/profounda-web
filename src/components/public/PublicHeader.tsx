"use client";

import { useState } from "react";
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

  const {
    user,
    loading,
    profile,
  } = useAuth();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const displayName =
    profile?.name ||
    user?.displayName ||
    user?.email ||
    "";

  const initial =
    displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);

    await authService.signOut();
  };

  const closeMenus = () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0B0F1A]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenus}
          className="shrink-0 font-serif text-xl font-semibold tracking-wide text-[#EDEAE1]"
        >
          Pro
          <span className="text-[#C9A15C]">
            found
          </span>
          a
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm text-[#8B92A6] transition hover:text-[#EDEAE1]"
          >
            {t("home")}
          </Link>

          <Link
            href="/analysis"
            className="text-sm text-[#8B92A6] transition hover:text-[#EDEAE1]"
          >
            {t("analysis")}
          </Link>

          <Link
            href="/subscription"
            className="text-sm text-[#8B92A6] transition hover:text-[#EDEAE1]"
          >
            {t("subscription")}
          </Link>


          <Link
            href="/messages"
            className="text-sm text-[#8B92A6] transition hover:text-[#EDEAE1]"
          >
            {t("messages")}
          </Link>

          <div className="h-4 w-px bg-white/10" />

          {/* Language */}
          <div className="flex items-center gap-2 text-xs">
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
              <div className="h-6 w-px bg-white/10" />

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen(
                      current => !current,
                    )
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.05]"
                >
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

                  <span className="max-w-32 truncate text-sm text-[#EDEAE1]">
                    {displayName}
                  </span>

                  <span className="text-xs text-[#5A6178]">
                    ▾
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-white/[0.1] bg-[#101521] shadow-xl">
                    <div className="border-b border-white/[0.08] px-4 py-3">
                      <p className="truncate text-sm font-medium text-[#EDEAE1]">
                        {displayName || "User"}
                      </p>

                      <p className="mt-1 truncate text-xs text-[#5A6178]">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-1.5">
                      {profile?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={closeMenus}
                          className="block rounded-md px-3 py-2 text-sm text-[#E4BC7A] transition hover:bg-white/[0.05]"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-[#8B92A6] transition hover:bg-white/[0.05] hover:text-[#EDEAE1]"
                      >
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Language */}
          <div className="flex items-center gap-1.5 text-xs">
            <Link
              href="/"
              locale="zh"
              onClick={closeMenus}
              className={
                locale === "zh"
                  ? "text-[#E4BC7A]"
                  : "text-[#5A6178]"
              }
            >
              中
            </Link>

            <span className="text-white/20">
              /
            </span>

            <Link
              href="/"
              locale="en"
              onClick={closeMenus}
              className={
                locale === "en"
                  ? "text-[#E4BC7A]"
                  : "text-[#5A6178]"
              }
            >
              EN
            </Link>
          </div>

          {/* Hamburger */}
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => {
              setMobileMenuOpen(
                current => !current,
              );
              setProfileOpen(false);
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#EDEAE1] transition hover:bg-white/[0.05]"
          >
            {mobileMenuOpen ? (
              <span className="text-2xl leading-none">
                ×
              </span>
            ) : (
              <span className="flex flex-col gap-1.5">
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/[0.08] bg-[#0B0F1A] md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <div className="flex flex-col">
              <Link
                href="/"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm text-[#8B92A6] transition hover:bg-white/[0.05] hover:text-[#EDEAE1]"
              >
                {t("home")}
              </Link>

              <Link
                href="/analysis"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm text-[#8B92A6] transition hover:bg-white/[0.05] hover:text-[#EDEAE1]"
              >
                {t("analysis")}
              </Link>

              <Link
                href="/subscription"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm text-[#8B92A6] transition hover:bg-white/[0.05] hover:text-[#EDEAE1]"
              >
                {t("subscription")}
              </Link>

              <Link
                href="/messages"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm text-[#8B92A6] transition hover:bg-white/[0.05] hover:text-[#EDEAE1]"
              >
                {t("messages")}
              </Link>
            </div>

            {!loading && user && (
              <div className="mt-3 border-t border-white/[0.08] pt-3">
                {/* User */}
                <div className="flex items-center gap-3 px-3 py-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A15C]/15 text-xs font-semibold text-[#E4BC7A]">
                      {initial}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#EDEAE1]">
                      {displayName || "User"}
                    </p>

                    <p className="truncate text-xs text-[#5A6178]">
                      {user.email}
                    </p>
                  </div>
                </div>

                {profile?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={closeMenus}
                    className="mt-1 block rounded-lg px-3 py-3 text-sm text-[#E4BC7A] transition hover:bg-white/[0.05]"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full cursor-pointer rounded-lg px-3 py-3 text-left text-sm text-[#8B92A6] transition hover:bg-white/[0.05] hover:text-[#EDEAE1]"
                >
                  {t("logout")}
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}