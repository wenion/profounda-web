import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { MarketRegimeBadge } from "@/components/app/MarketRegimeBadge";

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");

  // TODO:
  // 后面这些数据从 Firestore / strategy API 获取。
  // 现在先用 mock data 把 UI 做出来。

  const portfolio = {
    totalValue: 124830,
    stockValue: 102361,
    cash: 22469,
    stockAllocation: 82,
    cashAllocation: 18,
  };

  const holdings = [
    {
      ticker: "AAPL",
      name: "Apple",
      weight: 18.2,
      return: 20.8,
    },
    {
      ticker: "GOOG",
      name: "Alphabet",
      weight: 16.8,
      return: 13.9,
    },
    {
      ticker: "AMZN",
      name: "Amazon",
      weight: 15.4,
      return: -2.3,
    },
    {
      ticker: "META",
      name: "Meta",
      weight: 12.1,
      return: 7.6,
    },
  ];

  const rebalanceActions = [
    {
      ticker: "XYZ",
      action: "newBuy",
      type: "buy",
    },
    {
      ticker: "AAPL",
      action: "increase",
      type: "buy",
    },
    {
      ticker: "META",
      action: "decrease",
      type: "sell",
    },
  ] as const;

  return (
    <div className="space-y-10">
      {/* Page header */}
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#C9A15C]">
              {t("eyebrow")}
            </p>

            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#EDEAE1] sm:text-4xl">
              {t("title")}
            </h1>

            <p className="mt-2 text-sm text-[#8B92A6]">
              {t("description")}
            </p>
          </div>

          <p className="text-xs text-[#5A6178]">
            {t("updatedAt", {
              date: "2026-08-13",
            })}
          </p>
        </div>
      </section>

      {/* Top metrics */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t("metrics.totalValue")}
          value={formatCurrency(
            portfolio.totalValue,
          )}
          helper={t(
            "metrics.currentPortfolio",
          )}
        />

        <MetricCard
          label={t("metrics.stockValue")}
          value={formatCurrency(
            portfolio.stockValue,
          )}
          helper={t(
            "metrics.accountAllocation",
            {
              percentage:
                portfolio.stockAllocation,
            },
          )}
        />

        <MetricCard
          label={t("metrics.cash")}
          value={formatCurrency(
            portfolio.cash,
          )}
          helper={t(
            "metrics.accountAllocation",
            {
              percentage:
                portfolio.cashAllocation,
            },
          )}
        />

        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#6F768A]">
            {t("metrics.marketRegime")}
          </p>

          <div className="mt-5">
            <MarketRegimeBadge regime="BULL" />
          </div>

          <p className="mt-4 text-xs leading-5 text-[#5A6178]">
            {t(
              "metrics.targetStockAllocation",
              {
                percentage: 80,
              },
            )}
          </p>
        </div>
      </section>

      {/* Portfolio + Rebalance */}
      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Portfolio */}
        <div className="rounded-xl border border-white/10 bg-white/[0.025]">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#EDEAE1]">
                {t("holdings.title")}
              </h2>

              <p className="mt-1 text-xs text-[#6F768A]">
                {t(
                  "holdings.description",
                )}
              </p>
            </div>

            <Link
              href="/portfolio"
              className="text-sm text-[#C9A15C] transition hover:text-[#E4BC7A]"
            >
              {t("holdings.viewAll")} →
            </Link>
          </div>

          <div>
            {holdings.map((holding) => (
              <div
                key={holding.ticker}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-6 border-b border-white/[0.06] px-6 py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-[#EDEAE1]">
                      {holding.ticker}
                    </span>

                    <span className="truncate text-xs text-[#6F768A]">
                      {holding.name}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-sm text-[#EDEAE1]">
                    {holding.weight.toFixed(
                      1,
                    )}
                    %
                  </p>

                  <p className="mt-1 text-[11px] text-[#5A6178]">
                    {t("holdings.weight")}
                  </p>
                </div>

                <div className="w-20 text-right">
                  <p
                    className={[
                      "font-mono text-sm",
                      holding.return >= 0
                        ? "text-[#7FA37A]"
                        : "text-[#C1614F]",
                    ].join(" ")}
                  >
                    {holding.return >= 0
                      ? "+"
                      : ""}
                    {holding.return.toFixed(
                      1,
                    )}
                    %
                  </p>

                  <p className="mt-1 text-[11px] text-[#5A6178]">
                    {t("holdings.pnl")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rebalance */}
        <div className="rounded-xl border border-white/10 bg-white/[0.025]">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="font-serif text-xl font-semibold text-[#EDEAE1]">
              {t("rebalance.title")}
            </h2>

            <p className="mt-1 text-xs text-[#6F768A]">
              {t(
                "rebalance.description",
              )}
            </p>
          </div>

          <div className="px-6 py-5">
            <div className="space-y-3">
              {rebalanceActions.map(
                (item) => (
                  <div
                    key={item.ticker}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <ActionIndicator
                        type={item.type}
                      />

                      <div>
                        <p className="font-mono text-sm font-semibold text-[#EDEAE1]">
                          {item.ticker}
                        </p>

                        <p className="mt-0.5 text-xs text-[#6F768A]">
                          {t(
                            `rebalance.actions.${item.action}`,
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className={
                        item.type === "buy"
                          ? "text-xs text-[#7FA37A]"
                          : "text-xs text-[#C1614F]"
                      }
                    >
                      {item.type === "buy"
                        ? "BUY"
                        : "SELL"}
                    </span>
                  </div>
                ),
              )}
            </div>

            <Link
              href="/rebalance"
              className="mt-5 flex w-full items-center justify-center rounded-lg border border-[#C9A15C]/40 bg-[#C9A15C]/10 px-4 py-3 text-sm font-medium text-[#E4BC7A] transition hover:bg-[#C9A15C]/15"
            >
              {t(
                "rebalance.openAssistant",
              )}
            </Link>
          </div>
        </div>
      </section>

      {/* Allocation */}
      <section className="rounded-xl border border-white/10 bg-white/[0.025] p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#EDEAE1]">
              {t("allocation.title")}
            </h2>

            <p className="mt-1 text-xs text-[#6F768A]">
              {t(
                "allocation.description",
              )}
            </p>
          </div>

          <div className="flex gap-6 font-mono text-xs">
            <span className="text-[#EDEAE1]">
              {t("allocation.stocks")}{" "}
              {portfolio.stockAllocation}%
            </span>

            <span className="text-[#8B92A6]">
              {t("allocation.cash")}{" "}
              {portfolio.cashAllocation}%
            </span>
          </div>
        </div>

        <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="bg-[#C9A15C]"
            style={{
              width: `${portfolio.stockAllocation}%`,
            }}
          />

          <div
            className="bg-[#5A6178]"
            style={{
              width: `${portfolio.cashAllocation}%`,
            }}
          />
        </div>
      </section>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
};

function MetricCard({
  label,
  value,
  helper,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#6F768A]">
        {label}
      </p>

      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight text-[#EDEAE1]">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#5A6178]">
        {helper}
      </p>
    </div>
  );
}

function ActionIndicator({
  type,
}: {
  type: string;
}) {
  const buy = type === "buy";

  return (
    <span
      className={[
        "flex h-7 w-7 items-center justify-center rounded-full text-sm",
        buy
          ? "bg-[#7FA37A]/10 text-[#7FA37A]"
          : "bg-[#C1614F]/10 text-[#C1614F]",
      ].join(" ")}
    >
      {buy ? "↑" : "↓"}
    </span>
  );
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}