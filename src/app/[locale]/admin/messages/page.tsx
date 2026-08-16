"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useTranslations } from "next-intl";

import {
  Link,
} from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { messageService } from "@/services/messageService";

import type {
  MessageThread,
} from "@/types/message";


export default function AdminMessagesPage() {
  const t = useTranslations(
    "AdminMessages",
  );

  const {
    user,
    profile,
    loading: authLoading,
  } = useAuth();

  const [
    threads,
    setThreads,
  ] = useState<MessageThread[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  const loadThreads = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await messageService.getAllThreads();

        setThreads(result);
      } catch (err) {
        console.error(
          "Failed to load admin message threads:",
          err,
        );

        setError(t("loadError"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );


  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (
      !user ||
      profile?.role !== "admin"
    ) {
      setLoading(false);
      return;
    }

    void loadThreads();
  }, [
    authLoading,
    user,
    profile,
    loadThreads,
  ]);


  if (authLoading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="text-sm text-white/50">
          {t("loading")}
        </div>
      </main>
    );
  }


  if (
    !user ||
    profile?.role !== "admin"
  ) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-6 text-sm text-red-400">
          {t("noAccess")}
        </div>
      </main>
    );
  }


  const unreadCount = threads.reduce(
    (total, thread) =>
      total + thread.unreadByAdmin,
    0,
  );


  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      {/* Header */}

      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            {t("title")}
          </h1>

          <p className="mt-2 text-sm text-white/50">
            {t("description")}
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">
            {t("unread", {
              count: unreadCount,
            })}
          </div>
        )}
      </div>


      {/* Content */}

      <div className="mt-8">
        {loading ? (
          <div className="text-sm text-white/50">
            {t("loading")}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-5 text-sm text-red-400">
            {error}
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-14 text-center">
            <div className="text-base font-medium text-white">
              {t("emptyTitle")}
            </div>

            <div className="mt-2 text-sm text-white/40">
              {t("emptyDescription")}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            {/* Table header */}

            <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,3fr)_120px_160px] gap-6 border-b border-white/[0.08] bg-white/[0.03] px-6 py-3 text-xs font-medium uppercase tracking-wide text-white/40 md:grid">
              <div>
                {t("user")}
              </div>

              <div>
                {t("subject")}
              </div>

              <div>
                {t("status")}
              </div>

              <div className="text-right">
                {t("updated")}
              </div>
            </div>


            {/* Threads */}

            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/admin/messages/${thread.id}`}
                className="grid gap-3 border-b border-white/[0.08] bg-white/[0.015] px-6 py-5 transition last:border-b-0 hover:bg-white/[0.05] md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_120px_160px] md:items-center md:gap-6"
              >
                {/* User */}

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-sm font-medium text-white">
                    {getInitial(
                      thread.userEmail,
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm text-white">
                      {thread.userEmail}
                    </div>

                    {thread.unreadByAdmin > 0 && (
                      <div className="mt-1 text-xs font-medium text-emerald-300">
                        {t("newMessages", {
                          count:
                            thread.unreadByAdmin,
                        })}
                      </div>
                    )}
                  </div>
                </div>


                {/* Subject */}

                <div className="min-w-0">
                  <div
                    className={`truncate text-sm ${
                      thread.unreadByAdmin > 0
                        ? "font-semibold text-white"
                        : "text-white/70"
                    }`}
                  >
                    {thread.subject ||
                      t("noSubject")}
                  </div>
                </div>


                {/* Status */}

                <div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      thread.status === "open"
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-white/[0.06] text-white/40"
                    }`}
                  >
                    {thread.status === "open"
                      ? t("statusOpen")
                      : t("statusClosed")}
                  </span>
                </div>


                {/* Updated */}

                <div className="text-sm text-white/40 md:text-right">
                  {formatDate(
                    thread.lastMessageAt?.toDate(),
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


function getInitial(
  value: string,
): string {
  return (
    value.trim().charAt(0).toUpperCase() ||
    "?"
  );
}


function formatDate(
  date?: Date,
): string {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}