"use client";

import {
  useEffect,
  useState,
} from "react";

import { useTranslations } from "next-intl";

import { HoldingsTable } from "@/components/public/HoldingsTable";
import { PerformanceChart } from "@/components/public/PerformanceChart";
import {
  HomeConfig,
  siteConfigService,
} from "@/services/siteConfigService";

export default function HomePage() {
  const t = useTranslations("Home");

  const [config, setConfig] =
    useState<HomeConfig | null>(null);

  useEffect(() => {
    siteConfigService
      .getHomeConfig()
      .then(setConfig)
      .catch(console.error);
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#C9A15C]/[0.035] blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24 lg:px-8 lg:pb-24 lg:pt-32">
          {/* Hero */}
          <div className="text-left">
            {/* Eyebrow */}
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#C9A15C]">
              {t("eyebrow")}
            </p>

            {/* Headline */}
            <h1 className="mt-7 text-[48px] font-semibold leading-[1.3] tracking-tight text-[#EDEAE1]">
              <span className="block">
                {t("headline.line1")}
              </span>

              <span className="block">
                {t("headline.line2")}
              </span>

              <span className="block">
                {t("headline.line3")}
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-3xl text-base leading-8 text-[#8B92A6] sm:text-lg">
              {t("description")}
            </p>

            {/* Rebalance dates */}
            <div className="mt-10 flex flex-wrap justify-start gap-3">
              <div className="inline-flex items-center gap-4 rounded-full border border-[#C9A15C]/20 bg-[#C9A15C]/[0.06] px-5 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C9A15C]" />

                <span className="text-xs text-[#8B92A6]">
                  {t("currentRebalance")}
                </span>

                <span className="font-mono text-xs font-medium text-[#E4BC7A]">
                  {config?.currentRebalance ?? "—"}
                </span>
              </div>

              <div className="inline-flex items-center gap-4 rounded-full border border-[#C9A15C]/20 bg-[#C9A15C]/[0.06] px-5 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C9A15C]" />

                <span className="text-xs text-[#8B92A6]">
                  {t("nextRebalance")}
                </span>

                <span className="font-mono text-xs font-medium text-[#E4BC7A]">
                  {config?.nextRebalance ?? "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-5">
            <Metric
              label={t("metrics.cagr")}
              value={
                config
                  ? `${config.cagr.toFixed(2)}%`
                  : "—"
              }
              tone="gold"
            />

            <Metric
              label={t("metrics.liveReturn")}
              value={
                config
                  ? formatPercent(config.liveReturn)
                  : "—"
              }
              tone="green"
            />

            <Metric
              label={t("metrics.spy")}
              value={
                config
                  ? formatPercent(config.spyReturn)
                  : "—"
              }
              tone="white"
            />

            <Metric
              label={t("metrics.maxDrawdown")}
              value={
                config
                  ? `${config.maxDrawdown.toFixed(1)}%`
                  : "—"
              }
              tone="red"
            />

            <Metric
              label={t("metrics.sharpe")}
              value={
                config
                  ? config.sharpe.toFixed(2)
                  : "—"
              }
              tone="white"
            />
          </div>
        </div>
      </section>

      {/* Performance */}
      <section
        id="performance"
        className="scroll-mt-16 border-t border-white/[0.08]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <SectionHeader
            eyebrow={t("performance.eyebrow")}
            title={t("performance.title")}
            note={t("performance.note")}
          />

          <PerformanceChart />
        </div>
      </section>

      {/* Holdings */}
      <section
        id="holdings"
        className="scroll-mt-16 border-t border-white/[0.08]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <SectionHeader
            eyebrow={t("holdings.eyebrow")}
            title={t("holdings.title")}
            note={t("holdings.note")}
          />

          <HoldingsTable />
        </div>
      </section>

      {/* Community */}
      {/* <section
        id="community"
        className="scroll-mt-16 border-t border-white/[0.08] bg-white/[0.012]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <SectionHeader
            eyebrow={t("community.eyebrow")}
            title={t("community.title")}
          />

          <Community />
        </div>
      </section> */}
    </main>
  );
}

type MetricTone =
  | "gold"
  | "green"
  | "white"
  | "red";

type MetricProps = {
  label: string;
  value: string;
  tone?: MetricTone;
};

function Metric({
  label,
  value,
  tone = "white",
}: MetricProps) {
  const toneClasses: Record<
    MetricTone,
    string
  > = {
    gold: "text-[#E4BC7A]",
    green: "text-[#7FA37A]",
    white: "text-[#EDEAE1]",
    red: "text-[#C1614F]",
  };

  return (
    <div className="border-white/[0.08] px-4 py-7 text-center md:border-r md:last:border-r-0 lg:px-6">
      <p className="flex min-h-8 items-center justify-center text-[11px] leading-4 text-[#5A6178]">
        {label}
      </p>

      <p
        className={[
          "mt-2 font-mono text-2xl font-semibold tracking-tight lg:text-3xl",
          toneClasses[tone],
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  note?: string;
};

function SectionHeader({
  eyebrow,
  title,
  note,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A15C]">
          {eyebrow}
        </p>

        <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#EDEAE1]">
          {title}
        </h2>
      </div>

      {note && (
        <p className="max-w-xl text-sm leading-6 text-[#697386] sm:text-right">
          {note}
        </p>
      )}
    </div>
  );
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(1)}%`;
}