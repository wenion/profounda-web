"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";


type AdminLayoutProps = {
  children: ReactNode;
};


export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const router = useRouter();

  const {
    user,
    profile,
    loading,
  } = useAuth();


  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(
        "/login?redirect=/admin",
      );
      return;
    }

    if (profile?.role !== "admin") {
      router.replace("/");
    }
  }, [
    user,
    profile,
    loading,
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


  if (
    !user ||
    profile?.role !== "admin"
  ) {
    return null;
  }


  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      <AdminHeader />

      {children}
    </div>
  );
}