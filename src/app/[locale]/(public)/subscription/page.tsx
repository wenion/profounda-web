"use client";

import {
  useEffect,
  useState,
} from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { subscriptionService } from "@/services/subscriptionService";

export default function SubscriptionPage() {
  const t = useTranslations("Subscription");
  const router = useRouter();

  const { user, loading } = useAuth();

  const [subscribed, setSubscribed] =
    useState(false);

  const [checkingSubscription, setCheckingSubscription] =
    useState(true);

  const [subscribing, setSubscribing] =
    useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setSubscribed(false);
      setCheckingSubscription(false);
      return;
    }

    let cancelled = false;

    const checkSubscription = async () => {
      setCheckingSubscription(true);

      try {
        const isSubscribed =
          await subscriptionService.isSubscribed(
            user.uid,
          );

        if (!cancelled) {
          setSubscribed(isSubscribed);
        }
      } catch {
        if (!cancelled) {
          setSubscribed(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingSubscription(false);
        }
      }
    };

    void checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const handleSubscribe = async () => {
    if (loading || subscribing) {
      return;
    }

    // Not logged in -> login first
    if (!user) {
      router.push(
        "/login?redirect=/subscription",
      );
      return;
    }

    if (!user.email) {
      return;
    }

    setSubscribing(true);

    try {
      await subscriptionService.subscribe(
        user.uid,
        user.email,
      );

      setSubscribed(true);
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (
      !user ||
      subscribing
    ) {
      return;
    }

    setSubscribing(true);

    try {
      await subscriptionService.unsubscribe(
        user.uid,
      );

      setSubscribed(false);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F1A]">
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">

        {/* Header */}
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A15C]">
            {t("eyebrow")}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#EDEAE1]">
            {t("title")}
          </h1>

          <p className="mt-6 text-base leading-8 text-[#8B92A6]">
            {t("description")}
          </p>
        </div>

        {/* Delivery information */}
        <div className="mt-10 flex flex-wrap gap-4">
          <div className="rounded-lg border border-white/[0.08] bg-[#101521] px-5 py-3">
            <p className="text-sm text-[#A8AEBE]">
              ✉️ {t("delivery")}
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-[#101521] px-5 py-3">
            <p className="text-sm text-[#A8AEBE]">
              ↻ {t("frequency")}
            </p>
          </div>
        </div>

        {/* What you receive */}
        <div className="mt-12 max-w-3xl rounded-xl border border-white/[0.08] bg-[#101521] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#EDEAE1]">
            {t("includes.title")}
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Feature>
              {t("includes.buy")}
            </Feature>

            <Feature>
              {t("includes.sell")}
            </Feature>

            <Feature>
              {t("includes.stopLoss")}
            </Feature>

            <Feature>
              {t("includes.portfolio")}
            </Feature>
          </div>
        </div>

        {/* Subscribe */}
        <div className="mt-10">
          <div className="mt-10">
            {checkingSubscription ? (
              <button
                type="button"
                disabled
                className="rounded-lg bg-[#C9A15C] px-6 py-3 text-sm font-semibold text-[#0B0F1A] opacity-60"
              >
                {t("checking")}
              </button>
            ) : subscribed ? (
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-lg border border-[#7FA37A]/30 bg-[#7FA37A]/10 px-6 py-3 text-sm font-medium text-[#7FA37A]">
                  ✓ {t("subscribed")}
                </span>

                <button
                  type="button"
                  onClick={handleUnsubscribe}
                  disabled={subscribing}
                  className="cursor-pointer text-sm text-[#8B92A6] transition hover:text-[#EDEAE1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {subscribing
                    ? t("unsubscribing")
                    : t("unsubscribe")}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={
                    loading ||
                    subscribing
                  }
                  className="cursor-pointer rounded-lg bg-[#C9A15C] px-6 py-3 text-sm font-semibold text-[#0B0F1A] transition hover:bg-[#E4BC7A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {subscribing
                    ? t("subscribing")
                    : t("cta")}
                </button>

                {!loading && !user && (
                  <p className="mt-3 text-xs text-[#5A6178]">
                    {t("loginRequired")}
                  </p>
                )}
              </>
            )}
          </div>

          {!loading && !user && (
            <p className="mt-3 text-xs text-[#5A6178]">
              {t("loginRequired")}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function Feature({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-sm text-[#C9A15C]">
        ✓
      </span>

      <span className="text-sm text-[#A8AEBE]">
        {children}
      </span>
    </div>
  );
}