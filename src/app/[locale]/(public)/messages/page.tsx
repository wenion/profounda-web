"use client";

import {
  useEffect,
  useState,
} from "react";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { messageService } from "@/services/messageService";

import type {
  MessageThread,
} from "@/types/message";


export default function MessagesPage() {
  const t = useTranslations("Messages");

  const {
    user,
    loading,
  } = useAuth();

  const [
    threads,
    setThreads,
  ] = useState<MessageThread[]>([]);

  const [
    threadsLoading,
    setThreadsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  useEffect(() => {
    if (!user) {
      setThreads([]);
      return;
    }

    const loadThreads = async () => {
      setThreadsLoading(true);
      setError(null);

      try {
        const result =
          await messageService.getUserThreads(
            user.uid,
          );

        setThreads(result);
      } catch (err) {
        console.error(
          "Failed to load message threads:",
          err,
        );

        setError(t("loadError"));
      } finally {
        setThreadsLoading(false);
      }
    };

    void loadThreads();
  }, [user, t]);


  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <div className="text-sm text-white/50">
          {t("loading")}
        </div>
      </main>
    );
  }


  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
          <h1 className="text-2xl font-semibold text-white">
            {t("loginTitle")}
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/60">
            {t("loginDescription")}
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-white px-5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            {t("login")}
          </Link>
        </div>
      </main>
    );
  }


  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            {t("title")}
          </h1>

          <p className="mt-2 text-sm text-white/60">
            {t("description")}
          </p>
        </div>

        <Link
          href="/messages/new"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-white px-5 text-sm font-medium text-black transition hover:bg-white/90"
        >
          {t("newMessage")}
        </Link>
      </div>


      <div className="mt-10">
        {threadsLoading ? (
          <div className="text-sm text-white/50">
            {t("loading")}
          </div>
        ) : error ? (
          <div className="text-sm text-red-400">
            {error}
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-12 text-center">
            <div className="text-base font-medium text-white">
              {t("emptyTitle")}
            </div>

            <div className="mt-2 text-sm text-white/50">
              {t("emptyDescription")}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className="flex items-center justify-between gap-6 border-b border-white/[0.08] bg-white/[0.02] px-6 py-5 transition last:border-b-0 hover:bg-white/[0.05]"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-white">
                    {thread.subject ||
                      t("noSubject")}
                  </div>

                  <div className="mt-1 text-xs text-white/40">
                    {thread.status === "open"
                      ? t("statusOpen")
                      : t("statusClosed")}
                  </div>
                </div>

                {thread.unreadByUser > 0 && (
                  <div className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-semibold text-black">
                    {thread.unreadByUser}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}