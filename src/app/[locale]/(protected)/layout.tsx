"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/contexts/AuthContext";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || user) {
      return;
    }

    const redirect = encodeURIComponent(pathname);

    router.replace(
      `/login?redirect=${redirect}`,
      { locale },
    );
  }, [
    user,
    loading,
    pathname,
    locale,
    router,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A]">
        <p className="text-sm text-[#8B92A6]">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}