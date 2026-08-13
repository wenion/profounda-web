import type { ReactNode } from "react";

import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#EDEAE1]">
      <AppSidebar />

      <div className="min-h-screen md:pl-64">
        <AppHeader />

        <main className="px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}