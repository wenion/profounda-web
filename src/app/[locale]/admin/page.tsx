"use client";

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/i18n/navigation";
import { messageService } from "@/services/messageService";


export default function AdminPage() {
  const { user } = useAuth();

  const [
    unreadMessages,
    setUnreadMessages,
  ] = useState(0);


  useEffect(() => {
    const loadUnreadMessages = async () => {
      try {
        const threads =
          await messageService.getAllThreads();

        const count = threads.reduce(
          (total, thread) =>
            total + thread.unreadByAdmin,
          0,
        );

        setUnreadMessages(count);
      } catch (err) {
        console.error(
          "Failed to load unread messages:",
          err,
        );
      }
    };

    void loadUnreadMessages();
  }, []);


  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A15C]">
        Profounda Admin
      </p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#EDEAE1]">
        Admin Dashboard
      </h1>

      <p className="mt-4 text-sm text-[#8B92A6]">
        Signed in as {user?.email}
      </p>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <AdminCard
          href="/admin/users"
          title="Users"
          description="View and manage Profounda users."
        />

        <AdminCard
          href="/admin/subscriptions"
          title="Subscriptions"
          description="View signal subscription users."
        />

        <AdminCard
          href="/admin/data"
          title="Data"
          description="View and replace Profounda performance data."
        />

        <AdminCard
          href="/admin/messages"
          title="Support"
          description="View and reply to user messages."
          badge={
            unreadMessages > 0
              ? unreadMessages
              : undefined
          }
        />
      </div>
    </main>
  );
}


function AdminCard({
  href,
  title,
  description,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-white/[0.08] bg-[#101521] p-6 transition hover:border-[#C9A15C]/30 hover:bg-[#121824]"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#EDEAE1] transition group-hover:text-[#E4BC7A]">
          {title}
        </h2>

        {badge !== undefined && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#C9A15C] px-2 text-xs font-semibold text-[#0B0F1A]">
            {badge}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-6 text-[#8B92A6]">
        {description}
      </p>
    </Link>
  );
}