"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

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


interface AdminMessageThreadPageProps {
  params: Promise<{
    threadId: string;
  }>;
}


export default function AdminMessageThreadPage({
  params,
}: AdminMessageThreadPageProps) {
  const router = useRouter();

  const {
    user,
    profile,
    loading: authLoading,
  } = useAuth();

  const [
    threadId,
    setThreadId,
  ] = useState<string | null>(null);

  const [
    thread,
    setThread,
  ] = useState<MessageThread | null>(null);

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
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  /* =========================================
   * Resolve route params
   * ======================================= */

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;

      setThreadId(resolved.threadId);
    };

    void resolveParams();
  }, [params]);


  /* =========================================
   * Load thread metadata
   * ======================================= */

  const loadThread = useCallback(
    async (id: string) => {
      setPageLoading(true);
      setError(null);

      try {
        const threadResult =
          await messageService.getThread(id);

        if (!threadResult) {
          setThread(null);
          setMessages([]);
          return;
        }

        setThread(threadResult);

        if (threadResult.unreadByAdmin > 0) {
          await messageService.markAsReadByAdmin(
            id,
          );

          setThread({
            ...threadResult,
            unreadByAdmin: 0,
          });
        }
      } catch (err) {
        console.error(
          "Failed to load admin message thread:",
          err,
        );

        setError(
          "Failed to load this conversation.",
        );
      } finally {
        setPageLoading(false);
      }
    },
    [],
  );


  /* =========================================
   * Load thread after auth + params ready
   * ======================================= */

  useEffect(() => {
    if (
      authLoading ||
      !user ||
      profile?.role !== "admin" ||
      !threadId
    ) {
      return;
    }

    void loadThread(threadId);
  }, [
    authLoading,
    user,
    profile?.role,
    threadId,
    loadThread,
  ]);


  /* =========================================
   * Real-time message listener
   * ======================================= */

  useEffect(() => {
    if (
      authLoading ||
      !user ||
      profile?.role !== "admin" ||
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
            "Admin message listener failed:",
            err,
          );

          setError(
            "Failed to listen for new messages.",
          );
        },
      );

    return unsubscribe;
  }, [
    authLoading,
    user,
    profile?.role,
    threadId,
  ]);


  /* =========================================
   * Send admin reply
   * ======================================= */

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
        "admin",
        trimmedContent,
      );

      setContent("");

      /*
       * Messages do not need to be fetched here.
       * onSnapshot() will update them automatically.
       *
       * We only reload thread metadata because
       * sendMessage updates lastMessageAt,
       * updatedAt and unreadByUser.
       */
      const updatedThread =
        await messageService.getThread(
          threadId,
        );

      setThread(updatedThread);
    } catch (err) {
      console.error(
        "Failed to send admin reply:",
        err,
      );

      setError(
        "Failed to send the reply. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };


  /* =========================================
   * Close / reopen conversation
   * ======================================= */

  const handleToggleStatus = async () => {
    if (!threadId || !thread) {
      return;
    }

    setUpdatingStatus(true);
    setError(null);

    try {
      if (thread.status === "open") {
        await messageService.closeThread(
          threadId,
        );

        setThread({
          ...thread,
          status: "closed",
        });
      } else {
        await messageService.reopenThread(
          threadId,
        );

        setThread({
          ...thread,
          status: "open",
        });
      }
    } catch (err) {
      console.error(
        "Failed to update thread status:",
        err,
      );

      setError(
        "Failed to update the conversation status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };


  /* =========================================
   * Loading auth
   * ======================================= */

  if (authLoading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="text-sm text-white/50">
          Loading...
        </div>
      </main>
    );
  }


  /* =========================================
   * Access guard
   *
   * AdminLayout already protects this route,
   * but keeping this prevents rendering while
   * auth/profile state is resolving.
   * ======================================= */

  if (
    !user ||
    profile?.role !== "admin"
  ) {
    return null;
  }


  /* =========================================
   * Loading thread
   * ======================================= */

  if (!threadId || pageLoading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="text-sm text-white/50">
          Loading...
        </div>
      </main>
    );
  }


  /* =========================================
   * Load error
   * ======================================= */

  if (error && !thread) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <Link
          href="/admin/messages"
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← Back to messages
        </Link>

        <div className="mt-8 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-6 text-sm text-red-400">
          {error}
        </div>
      </main>
    );
  }


  /* =========================================
   * Thread not found
   * ======================================= */

  if (!thread) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <Link
          href="/admin/messages"
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← Back to messages
        </Link>

        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
          <h1 className="text-xl font-semibold text-white">
            Conversation not found
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/messages")
            }
            className="mt-6 text-sm text-white/60 transition hover:text-white"
          >
            Back to messages
          </button>
        </div>
      </main>
    );
  }


  /* =========================================
   * Page
   * ======================================= */

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
      <Link
        href="/admin/messages"
        className="text-sm text-white/50 transition hover:text-white"
      >
        ← Back to messages
      </Link>


      {/* Header */}

      <div className="mt-8 flex flex-col gap-6 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-white">
            {thread.subject || "No subject"}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/50">
            <span>
              {thread.userEmail}
            </span>

            <span>
              {messages.length}{" "}
              {messages.length === 1
                ? "message"
                : "messages"}
            </span>
          </div>
        </div>


        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              thread.status === "open"
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-white/[0.06] text-white/40"
            }`}
          >
            {thread.status === "open"
              ? "Open"
              : "Closed"}
          </span>

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={updatingStatus}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-white/[0.1] px-4 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {updatingStatus
              ? "Updating..."
              : thread.status === "open"
                ? "Close"
                : "Reopen"}
          </button>
        </div>
      </div>


      {/* Conversation */}

      <div className="space-y-5 py-8">
        {messages.length === 0 ? (
          <div className="py-10 text-center text-sm text-white/40">
            No messages in this conversation.
          </div>
        ) : (
          messages.map((message) => {
            const isAdmin =
              message.senderRole === "admin";

            return (
              <div
                key={message.id}
                className={`flex ${
                  isAdmin
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                    isAdmin
                      ? "bg-white text-black"
                      : "border border-white/[0.08] bg-white/[0.04] text-white"
                  }`}
                >
                  <div
                    className={`mb-1 text-xs font-medium ${
                      isAdmin
                        ? "text-black/40"
                        : "text-white/40"
                    }`}
                  >
                    {isAdmin
                      ? "Admin"
                      : thread.userEmail}
                  </div>

                  <div className="whitespace-pre-wrap break-words text-sm leading-6">
                    {message.content}
                  </div>

                  <div
                    className={`mt-2 text-right text-[11px] ${
                      isAdmin
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
        <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}


      {/* Reply */}

      {thread.status === "closed" ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-5 text-center">
          <div className="text-sm text-white/50">
            This conversation is closed.
          </div>

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={updatingStatus}
            className="mt-3 text-sm font-medium text-white transition hover:text-white/70 disabled:opacity-40"
          >
            {updatingStatus
              ? "Reopening..."
              : "Reopen conversation"}
          </button>
        </div>
      ) : (
        <div className="border-t border-white/[0.08] pt-6">
          <div className="mb-2 text-sm font-medium text-white">
            Reply
          </div>

          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            maxLength={5000}
            rows={5}
            disabled={sending}
            placeholder="Write a reply..."
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
                ? "Sending..."
                : "Send reply"}
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
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}