"use client";

import {
  type SubmitEvent,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  Link,
  useRouter,
} from "@/i18n/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { messageService } from "@/services/messageService";


export default function NewMessagePage() {
  const t = useTranslations("Messages.new");

  const router = useRouter();

  const {
    user,
    loading,
  } = useAuth();

  const [
    subject,
    setSubject,
  ] = useState("");

  const [
    content,
    setContent,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const trimmedSubject = subject.trim();
    const trimmedContent = content.trim();

    if (!trimmedSubject || !trimmedContent) {
      setError(t("required"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const threadId =
        await messageService.createThread(
          user.uid,
          user.email ?? "",
          trimmedSubject,
        );

      await messageService.sendMessage(
        threadId,
        user.uid,
        "user",
        trimmedContent,
      );

      router.push(
        `/messages/${threadId}`,
      );
    } catch (err) {
      console.error(
        "Failed to create message thread:",
        err,
      );

      setError(t("sendError"));
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
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


  return (
    <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <Link
        href="/messages"
        className="text-sm text-white/50 transition hover:text-white"
      >
        ← {t("back")}
      </Link>


      <div className="mt-8">
        <h1 className="text-3xl font-semibold text-white">
          {t("title")}
        </h1>

        <p className="mt-2 text-sm leading-6 text-white/60">
          {t("description")}
        </p>
      </div>


      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-6"
      >
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-white"
          >
            {t("subject")}
          </label>

          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(event) =>
              setSubject(event.target.value)
            }
            maxLength={120}
            disabled={submitting}
            placeholder={t("subjectPlaceholder")}
            className="mt-2 h-11 w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 disabled:opacity-50"
          />

          <div className="mt-1 text-right text-xs text-white/30">
            {subject.length}/120
          </div>
        </div>


        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-white"
          >
            {t("message")}
          </label>

          <textarea
            id="message"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            maxLength={5000}
            disabled={submitting}
            placeholder={t("messagePlaceholder")}
            rows={8}
            className="mt-2 w-full resize-none rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-white/30 disabled:opacity-50"
          />

          <div className="mt-1 text-right text-xs text-white/30">
            {content.length}/5000
          </div>
        </div>


        {error && (
          <div className="text-sm text-red-400">
            {error}
          </div>
        )}


        <div className="flex justify-end gap-3">
          <Link
            href="/messages"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-white/[0.1] px-5 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white"
          >
            {t("cancel")}
          </Link>

          <button
            type="submit"
            disabled={
              submitting ||
              !subject.trim() ||
              !content.trim()
            }
            className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting
              ? t("sending")
              : t("send")}
          </button>
        </div>
      </form>
    </main>
  );
}