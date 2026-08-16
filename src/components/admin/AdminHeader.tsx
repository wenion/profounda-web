"use client";

import { useState } from "react";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";


export function AdminHeader() {
  const {
    user,
    profile,
    loading,
  } = useAuth();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const displayName =
    profile?.name ||
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
        {/* Brand */}
        <Link
          href="/admin"
          className="flex items-center gap-3"
        >
          <span className="font-serif text-xl font-semibold tracking-wide text-[#EDEAE1]">
            Pro
            <span className="text-[#C9A15C]">
              found
            </span>
            a
          </span>

          <span className="rounded-md border border-[#C9A15C]/20 bg-[#C9A15C]/[0.06] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#E4BC7A]">
            Admin
          </span>
        </Link>


        {/* Navigation */}
        <nav className="flex items-center gap-5">
          <Link
            href="/admin"
            className="hidden text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] md:block"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className="hidden text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] md:block"
          >
            Users
          </Link>

          <Link
            href="/admin/subscriptions"
            className="hidden text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] md:block"
          >
            Subscriptions
          </Link>

          <Link
            href="/admin/data"
            className="hidden text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] md:block"
          >
            Data
          </Link>

          <Link
            href="/admin/messages"
            className="hidden text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] md:block"
          >
            Messages
          </Link>

          <div className="hidden h-6 w-px bg-white/10 md:block" />


          {/* Profile */}
          {!loading && user && (
            <>
              <div className="hidden h-6 w-px bg-white/10 sm:block" />

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

                  <span className="hidden max-w-32 truncate text-sm text-[#EDEAE1] sm:block">
                    {displayName}
                  </span>

                  <span className="text-xs text-[#5A6178]">
                    ▾
                  </span>
                </button>


                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-white/[0.1] bg-[#101521] shadow-xl">
                    {/* User info */}
                    <div className="border-b border-white/[0.08] px-4 py-3">
                      <p className="truncate text-sm font-medium text-[#EDEAE1]">
                        {displayName}
                      </p>

                      <p className="mt-1 truncate text-xs text-[#5A6178]">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-1.5">
                      <Link
                        href="/"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                        className="block rounded-md px-3 py-2 text-sm text-[#8B92A6] transition hover:bg-white/[0.05] hover:text-[#EDEAE1]"
                      >
                        Back to Profounda
                      </Link>

                      <button
                        type="button"
                        onClick={async () => {
                          setProfileOpen(false);
                          await handleLogout();
                        }}
                        className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-[#8B92A6] transition hover:bg-white/[0.05] hover:text-[#EDEAE1]"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}