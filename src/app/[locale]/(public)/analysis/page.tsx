"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/i18n/navigation";

import { dataService } from "@/services/dataService";

import type {
  SignalData,
} from "@/types/performance";

const STOP_PCT = -0.15;

type HoldingRow = {
  id: number;
  symbol: string;
  cost: string;
  shares: string;
};

type ResultBadge =
  | "sell"
  | "trim"
  | "new"
  | "buy"
  | "hold";

type ResultRow = {
  symbol: string;
  action: string;
  badge: ResultBadge;
  cur: number;
  target: number;
  price: number | null;
  stop: number | null;
};

const createRow = (
  id: number,
): HoldingRow => ({
  id,
  symbol: "",
  cost: "",
  shares: "",
});

export default function AnalysisPage() {
  const t = useTranslations("Analysis");
  const { user, loading } = useAuth();

  const isAuthenticated =
    !loading && !!user;

  const [signal, setSignal] =
    useState<SignalData | null>(null);

  const [dataLoading, setDataLoading] =
    useState(true);

  const [cash, setCash] =
    useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const signalData =
          await dataService.getSignal();

        setSignal(signalData);
      } catch (error) {
        console.error(
          "Failed to load signal:",
          error,
        );
      } finally {
        setDataLoading(false);
      }
    };

    void loadData();
  }, []);

  const picks =
    signal?.picks ?? [];

  const pickMap = useMemo(
    () =>
      Object.fromEntries(
        picks.map((pick) => [
          pick.symbol,
          pick,
        ]),
      ),
    [picks],
  );

  const [rows, setRows] = useState<
    HoldingRow[]
  >([
    createRow(1),
    createRow(2),
    createRow(3),
  ]);

  const [results, setResults] =
    useState<ResultRow[]>([]);

  const [summary, setSummary] =
    useState<{
      totalValue: number;
      targetStockValue: number;
      stockPct: number;
    } | null>(null);

  const [nextRowId, setNextRowId] =
    useState(4);

  function updateRow(
    id: number,
    field:
      | "symbol"
      | "cost"
      | "shares",
    value: string,
  ) {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      createRow(nextRowId),
    ]);

    setNextRowId(
      (current) => current + 1,
    );
  }

  function removeRow(id: number) {
    setRows((current) =>
      current.filter(
        (row) => row.id !== id,
      ),
    );
  }

  function calculate() {
    if (!signal) {
      return;
    }

    const stockPct =
      signal.stock_pct / 100;

    const userHoldings = rows
      .map((row) => ({
        symbol: row.symbol
          .trim()
          .toUpperCase(),
        cost:
          parseFloat(row.cost) || 0,
        shares:
          parseFloat(row.shares) || 0,
      }))
      .filter(
        (holding) =>
          holding.symbol &&
          holding.shares > 0,
      );

    const cashValue =
      parseFloat(cash) || 0;

    /*
     * Current market value of holdings
     * that are still in SIGNAL picks.
     */
    const holdingsMV =
      userHoldings.reduce(
        (total, holding) => {
          const pick =
            pickMap[
              holding.symbol
            ];

          if (!pick) {
            return total;
          }

          return (
            total +
            holding.shares *
              pick.price
          );
        },
        0,
      );

    /*
     * Holdings no longer in the
     * target list do not have a
     * current SIGNAL price.
     *
     * Same behavior as the original
     * implementation: use cost as
     * the estimated value.
     */
    const nonPickHoldingsMV =
      userHoldings
        .filter(
          (holding) =>
            !pickMap[
              holding.symbol
            ],
        )
        .reduce(
          (total, holding) =>
            total +
            holding.shares *
              holding.cost,
          0,
        );

    const totalValue =
      holdingsMV +
      cashValue +
      nonPickHoldingsMV;

    const targetStockValue =
      totalValue * stockPct;

    const heldSymbols =
      new Set(
        userHoldings.map(
          (holding) =>
            holding.symbol,
        ),
      );

    const nextResults: ResultRow[] =
      [];

    /*
     * Existing holdings
     */
    for (
      const holding of
      userHoldings
    ) {
      const pick =
        pickMap[holding.symbol];

      /*
       * Stock is no longer in
       * SIGNAL picks -> sell all.
       */
      if (!pick) {
        nextResults.push({
          symbol: holding.symbol,
          action: "卖出",
          badge: "sell",
          cur: holding.shares,
          target: 0,
          price: null,
          stop:
            holding.cost > 0
              ? holding.cost *
                (1 + STOP_PCT)
              : null,
        });

        continue;
      }

      const stopPrice =
        holding.cost > 0
          ? holding.cost *
            (1 + STOP_PCT)
          : null;

      /*
       * Stop loss
       */
      if (
        stopPrice !== null &&
        pick.price <= stopPrice
      ) {
        nextResults.push({
          symbol: holding.symbol,
          action: "卖出(止损)",
          badge: "sell",
          cur: holding.shares,
          target: 0,
          price: pick.price,
          stop: stopPrice,
        });

        continue;
      }

      /*
       * Target position
       */
      const targetValue =
        targetStockValue *
        (pick.weight_pct /
          100);

      const targetShares =
        targetValue /
        pick.price;

      const diff =
        targetShares -
        holding.shares;

      let action =
        "维持不动";

      let badge: ResultBadge =
        "hold";

      if (
        Math.abs(diff) >= 0.01
      ) {
        if (diff > 0) {
          action = "加仓";
          badge = "buy";
        } else {
          action = "减仓";
          badge = "trim";
        }
      }

      nextResults.push({
        symbol: holding.symbol,
        action,
        badge,
        cur: holding.shares,
        target:
          Math.round(
            targetShares *
              10000,
          ) / 10000,
        price: pick.price,
        stop:
          holding.cost > 0
            ? holding.cost *
              (1 + STOP_PCT)
            : pick.price *
              (1 + STOP_PCT),
      });
    }

    /*
     * New SIGNAL picks that the
     * user currently doesn't own.
     */
    for (const pick of picks) {
      if (
        heldSymbols.has(
          pick.symbol,
        )
      ) {
        continue;
      }

      const targetValue =
        targetStockValue *
        (pick.weight_pct /
          100);

      const targetShares =
        targetValue /
        pick.price;

      if (
        targetShares <
        0.0001
      ) {
        continue;
      }

      nextResults.push({
        symbol: pick.symbol,
        action: "新买入",
        badge: "new",
        cur: 0,
        target:
          Math.round(
            targetShares *
              10000,
          ) / 10000,
        price: pick.price,
        stop:
          pick.price *
          (1 + STOP_PCT),
      });
    }

    /*
     * Sell
     * Trim
     * New
     * Buy
     * Hold
     */
    const order: Record<
      ResultBadge,
      number
    > = {
      sell: 0,
      trim: 1,
      new: 2,
      buy: 3,
      hold: 4,
    };

    nextResults.sort(
      (a, b) =>
        order[a.badge] -
        order[b.badge],
    );

    setResults(nextResults);

    setSummary({
      totalValue,
      targetStockValue,
      stockPct,
    });
  }

  const visibleResults =
  loading
    ? []
    : isAuthenticated
      ? results
      : results.slice(0, 2);

  const hasLockedResults =
    !loading &&
    !isAuthenticated &&
    results.length > 2;

  if (dataLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="rounded-xl border border-white/10 bg-[#111622] p-6 text-sm text-[#8B92A6]">
          Loading signal...
        </div>
      </main>
    );
  }

  if (!signal) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="rounded-xl border border-white/10 bg-[#111622] p-6 text-sm text-[#8B92A6]">
          Signal data is unavailable.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#EDEAE1]">
          {t("title")}
        </h1>

        <p className="mt-2 text-sm text-[#7F879C]">
          {signal.as_of} ·{" "}
          {signal.regime} ·{" "}
          {signal.stock_pct}% Stocks
          · {signal.cash_pct}% Cash
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          calculate();
        }}
      >
        <div className="rounded-xl border border-white/10 bg-[#111622] p-6">
          <div className="mb-6">
            <label className="mb-2 block text-sm text-[#A8ADBA]">
              Cash
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[#5A6178]">
                $
              </span>

              <input
                type="text"
                inputMode="numeric"
                value={
                  cash
                    ? Number(
                        cash,
                      ).toLocaleString(
                        "en-US",
                      )
                    : ""
                }
                onChange={(
                  event,
                ) => {
                  const rawValue =
                    event.target.value.replace(
                      /,/g,
                      "",
                    );

                  if (
                    /^\d*$/.test(
                      rawValue,
                    )
                  ) {
                    setCash(
                      rawValue,
                    );
                  }
                }}
                placeholder="0"
                className="h-11 w-full rounded-md border border-white/10 bg-[#0B0F1A] pl-8 pr-4 font-mono text-sm text-[#EDEAE1] outline-none transition placeholder:text-[#3F4658] focus:border-[#C9A15C]/60"
              />
            </div>
          </div>

          <div className="mb-3 grid grid-cols-[1.2fr_1fr_1fr_40px] gap-3 px-1 text-xs uppercase tracking-wider text-[#5A6178]">
            <div>Symbol</div>
            <div>Cost / Share</div>
            <div>Shares</div>
            <div />
          </div>

          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1.2fr_1fr_1fr_40px] gap-3"
              >
                <input
                  type="text"
                  value={
                    row.symbol
                  }
                  onChange={(
                    event,
                  ) =>
                    updateRow(
                      row.id,
                      "symbol",
                      event.target
                        .value,
                    )
                  }
                  placeholder="MU"
                  className="h-11 rounded-md border border-white/10 bg-[#0B0F1A] px-4 font-mono text-sm uppercase text-[#EDEAE1] outline-none focus:border-[#C9A15C]/60"
                />

                <input
                  type="number"
                  step="any"
                  min="0"
                  value={row.cost}
                  onChange={(
                    event,
                  ) =>
                    updateRow(
                      row.id,
                      "cost",
                      event.target
                        .value,
                    )
                  }
                  placeholder="0.00"
                  className="h-11 rounded-md border border-white/10 bg-[#0B0F1A] px-4 font-mono text-sm text-[#EDEAE1] outline-none focus:border-[#C9A15C]/60"
                />

                <input
                  type="number"
                  step="any"
                  min="0"
                  value={
                    row.shares
                  }
                  onChange={(
                    event,
                  ) =>
                    updateRow(
                      row.id,
                      "shares",
                      event.target
                        .value,
                    )
                  }
                  placeholder="0"
                  className="h-11 rounded-md border border-white/10 bg-[#0B0F1A] px-4 font-mono text-sm text-[#EDEAE1] outline-none focus:border-[#C9A15C]/60"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeRow(
                      row.id,
                    )
                  }
                  className="h-11 rounded-md text-lg text-[#5A6178] transition hover:bg-white/5 hover:text-[#EDEAE1]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-4 text-sm text-[#C9A15C] transition hover:text-[#D8B979]"
          >
            + Add holding
          </button>

          <button
            type="submit"
            className="mt-8 h-12 w-full rounded-md bg-[#C9A15C] font-medium text-[#0B0F1A] transition hover:opacity-90"
          >
            Calculate Rebalance
          </button>
        </div>
      </form>

      {summary && (
        <section className="mt-8">
          <div className="mb-4 rounded-lg border border-white/10 bg-[#111622] px-5 py-4 font-mono text-sm text-[#A8ADBA]">
            账户总值{" "}
            <span className="text-[#EDEAE1]">
              $
              {summary.totalValue.toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 0,
                },
              )}
            </span>
            {" · "}
            目标股票敞口{" "}
            {(
              summary.stockPct *
              100
            ).toFixed(0)}
            % (
            <span className="text-[#EDEAE1]">
              $
              {summary.targetStockValue.toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 0,
                },
              )}
            </span>
            ) · 目标现金{" "}
            {(
              100 -
              summary.stockPct *
                100
            ).toFixed(0)}
            %
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111622]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-[#5A6178]">
                    <th className="px-5 py-4">
                      代码
                    </th>
                    <th className="px-5 py-4">
                      操作
                    </th>
                    <th className="px-5 py-4 text-right">
                      现有股数
                    </th>
                    <th className="px-5 py-4 text-right">
                      目标股数
                    </th>
                    <th className="px-5 py-4 text-right">
                      现价
                    </th>
                    <th className="px-5 py-4 text-right">
                      止损价
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleResults.map((result) => (
                    <tr
                      key={result.symbol}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-5 py-4 font-mono font-semibold text-[#EDEAE1]">
                        {result.symbol}
                      </td>

                      <td className="px-5 py-4">
                        <ActionBadge badge={result.badge}>
                          {result.action}
                        </ActionBadge>
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-[#A8ADBA]">
                        {formatShares(result.cur)}
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-[#EDEAE1]">
                        {formatShares(result.target)}
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-[#A8ADBA]">
                        {formatMoney(result.price)}
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-[#A8ADBA]">
                        {formatMoney(result.stop)}
                      </td>
                    </tr>
                  ))}

                  {hasLockedResults &&
                    [0, 1, 2].map((index) => (
                      <tr
                        key={`locked-${index}`}
                        aria-hidden="true"
                        className="pointer-events-none select-none border-b border-white/5 opacity-30 blur-[5px]"
                      >
                        <td className="px-5 py-4 font-mono font-semibold text-[#EDEAE1]">
                          XXXX
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-md bg-white/5 px-2.5 py-1 text-xs">
                            XXXX
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right font-mono">
                          10.0000
                        </td>

                        <td className="px-5 py-4 text-right font-mono">
                          15.0000
                        </td>

                        <td className="px-5 py-4 text-right font-mono">
                          $123.45
                        </td>

                        <td className="px-5 py-4 text-right font-mono">
                          $104.93
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {hasLockedResults && (
                <div className="flex flex-col items-center justify-center gap-3 border-t border-white/10 px-5 py-6 sm:flex-row">
                  <span className="text-sm">
                    🔒
                  </span>

                  <p className="text-center text-sm text-[#8B92A6]">
                    {t("loginToViewAll")}
                  </p>

                  <Link
                    href="/login?redirect=/analysis"
                    className="text-sm font-medium text-[#E4BC7A] transition hover:text-[#F0CC8E]"
                  >
                    {t("loginToView")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function ActionBadge({
  badge,
  children,
}: {
  badge: ResultBadge;
  children: React.ReactNode;
}) {
  const classes: Record<
    ResultBadge,
    string
  > = {
    sell:
      "bg-red-500/10 text-red-400",
    trim:
      "bg-orange-500/10 text-orange-400",
    new:
      "bg-emerald-500/10 text-emerald-400",
    buy:
      "bg-blue-500/10 text-blue-400",
    hold:
      "bg-white/5 text-[#7F879C]",
  };

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${classes[badge]}`}
    >
      {children}
    </span>
  );
}

function formatMoney(
  value: number | null,
) {
  if (value === null) {
    return "—";
  }

  return `$${value.toFixed(2)}`;
}

function formatShares(value: number) {
  return value.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 4,
    },
  );
}