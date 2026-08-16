"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useTranslations } from "next-intl";

import {
  Link,
  useRouter,
} from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { messageService } from "@/services/messageService";

import type {
  Message,
  MessageThread,
} from "@/types/message";


interface MessageThreadPageProps {
  params: Promise<{
    threadId: string;
  }>;
}


export default function MessageThreadPage({
  params,
}: MessageThreadPageProps) {
  const t = useTranslations(
    "Messages.thread",
  );

  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    threadId,
    setThreadId,
  ] = useState<string | null>(null);

  const [
    thread,
    setThread,
  ] = useState<MessageThread | null>(
    null,
  );

  const [
    messages,
    setMessages,
  ] = useState<Message[]>([]);

  const [
    content,
    setContent,
  ] = useState("");

  const [
    pageLoading,
    setPageLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;

      setThreadId(resolved.threadId);
    };

    void resolveParams();
  }, [params]);


  const loadThread = useCallback(
    async (id: string) => {
      if (!user) {
        return;
      }

      setPageLoading(true);
      setError(null);

      try {
        const threadResult =
          await messageService.getThread(id);

        if (!threadResult) {
          setThread(null);
          return;
        }

        setThread(threadResult);

        if (threadResult.unreadByUser > 0) {
          await messageService.markAsReadByUser(
            id,
          );

          setThread({
            ...threadResult,
            unreadByUser: 0,
          });
        }
      } catch (err) {
        console.error(
          "Failed to load message thread:",
          err,
        );

        setError(t("loadError"));
      } finally {
        setPageLoading(false);
      }
    },
    [user, t],
  );

  useEffect(() => {
    if (
      authLoading ||
      !user ||
      !threadId
    ) {
      return;
    }

    const unsubscribe =
      messageService.subscribeToMessages(
        threadId,
        (messages) => {
          setMessages(messages);
        },
        (err) => {
          console.error(
            "Message listener failed:",
            err,
          );

          setError(t("loadError"));
        },
      );

    return unsubscribe;
  }, [
    authLoading,
    user,
    threadId,
    t,
  ]);


  useEffect(() => {
    if (
      authLoading ||
      !user ||
      !threadId
    ) {
      return;
    }

    void loadThread(threadId);
  }, [
    authLoading,
    user,
    threadId,
    loadThread,
  ]);


  const handleSend = async () => {
    if (
      !user ||
      !threadId ||
      !thread
    ) {
      return;
    }

    const trimmedContent =
      content.trim();

    if (!trimmedContent) {
      return;
    }

    if (thread.status === "closed") {
      return;
    }

    setSending(true);
    setError(null);

    try {
      await messageService.sendMessage(
        threadId,
        user.uid,
        "user",
        trimmedContent,
      );

      setContent("");

      const updatedThread =
        await messageService.getThread(
          threadId,
        );

      setThread(updatedThread);
    } catch (err) {
      console.error(
        "Failed to send message:",
        err,
      );

      setError(t("sendError"));
    } finally {
      setSending(false);
    }
  };


  if (authLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <div className="text-sm text-white/50">
          {t("loading")}
        </div>
      </main>
    );
  }


  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
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


  if (!threadId || pageLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <div className="text-sm text-white/50">
          {t("loading")}
        </div>
      </main>
    );
  }


  if (error && !thread) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <Link
          href="/messages"
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← {t("back")}
        </Link>

        <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-6 text-sm text-red-400">
          {error}
        </div>
      </main>
    );
  }


  if (!thread) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <Link
          href="/messages"
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← {t("back")}
        </Link>

        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
          <h1 className="text-xl font-semibold text-white">
            {t("notFound")}
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push("/messages")
            }
            className="mt-6 text-sm text-white/60 transition hover:text-white"
          >
            {t("back")}
          </button>
        </div>
      </main>
    );
  }


  return (
    <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <Link
        href="/messages"
        className="text-sm text-white/50 transition hover:text-white"
      >
        ← {t("back")}
      </Link>


      {/* Header */}

      <div className="mt-8 border-b border-white/[0.08] pb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-white">
              {thread.subject ||
                t("noSubject")}
            </h1>

            <p className="mt-2 text-sm text-white/50">
              {t("privateDescription")}
            </p>
          </div>

          <div
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              thread.status === "open"
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-white/[0.06] text-white/40"
            }`}
          >
            {thread.status === "open"
              ? t("statusOpen")
              : t("statusClosed")}
          </div>
        </div>
      </div>


      {/* Messages */}

      <div className="space-y-5 py-8">
        {messages.length === 0 ? (
          <div className="py-10 text-center text-sm text-white/40">
            {t("empty")}
          </div>
        ) : (
          messages.map((message) => {
            const isUser =
              message.senderRole === "user";

            return (
              <div
                key={message.id}
                className={`flex ${
                  isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                    isUser
                      ? "bg-white text-black"
                      : "border border-white/[0.08] bg-white/[0.04] text-white"
                  }`}
                >
                  {!isUser && (
                    <div className="mb-1 text-xs font-medium text-white/40">
                      {t("admin")}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap break-words text-sm leading-6">
                    {message.content}
                  </div>

                  <div
                    className={`mt-2 text-right text-[11px] ${
                      isUser
                        ? "text-black/40"
                        : "text-white/30"
                    }`}
                  >
                    {formatMessageTime(
                      message.createdAt?.toDate(),
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>


      {/* Error */}

      {error && (
        <div className="mb-4 text-sm text-red-400">
          {error}
        </div>
      )}


      {/* Composer */}

      {thread.status === "closed" ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-center text-sm text-white/50">
          {t("closedDescription")}
        </div>
      ) : (
        <div className="border-t border-white/[0.08] pt-6">
          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            maxLength={5000}
            rows={5}
            disabled={sending}
            placeholder={t(
              "messagePlaceholder",
            )}
            className="w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-white/30 disabled:opacity-50"
          />

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="text-xs text-white/30">
              {content.length}/5000
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={
                sending ||
                !content.trim()
              }
              className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending
                ? t("sending")
                : t("send")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}


function formatMessageTime(
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