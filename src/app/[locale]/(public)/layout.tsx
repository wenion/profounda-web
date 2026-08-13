import type { ReactNode } from "react";

import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B0F1A] text-[#EDEAE1]">
      <PublicHeader />

      <div className="flex-1">
        {children}
      </div>

      <PublicFooter />
    </div>
  );
}