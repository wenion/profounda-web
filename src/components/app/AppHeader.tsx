"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";

export function AppHeader() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleLogout() {
    await authService.signOut();

    router.replace("/login");
  }

  const displayName =
    user?.displayName ||
    user?.email ||
    "Account";

  const initial =
    displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0B0F1A]/90 px-6 backdrop-blur lg:px-10">
      <div className="md:hidden">
        <span className="font-serif text-lg font-semibold">
          Pro
          <span className="text-[#C9A15C]">
            found
          </span>
          a
        </span>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-5">
        <button
          type="button"
          className="text-xs text-[#8B92A6] transition hover:text-[#EDEAE1]"
        >
          中文 / EN
        </button>

        <div className="h-5 w-px bg-white/10" />

        <div className="flex items-center gap-3">
          {user?.photoURL ? (
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
              className="text-xs text-[#5A6178] transition hover:text-[#E4BC7A]"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}