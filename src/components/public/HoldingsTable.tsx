"use client";

import {
  useEffect,
  useState,
} from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/i18n/navigation";
import { dataService } from "@/services/dataService";

import type {
  HoldingsData,
  SignalData,
} from "@/types/performance";


export function HoldingsTable() {
  const t =
    useTranslations("Home.holdings");

  const {
    user,
    loading,
  } = useAuth();


  /* =======================================================
   * Performance data
   * ===================================================== */

  const [
    holdingsData,
    setHoldingsData,
  ] = useState<HoldingsData | null>(
    null,
  );

  const [
    signal,
    setSignal,
  ] = useState<SignalData | null>(
    null,
  );

  const [
    dataLoading,
    setDataLoading,
  ] = useState(true);


  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          holdings,
          signalData,
        ] = await Promise.all([
          dataService.getHoldings(),
          dataService.getSignal(),
        ]);

        setHoldingsData(holdings);
        setSignal(signalData);
      } catch (error) {
        console.error(
          "Failed to load holdings data:",
          error,
        );
      } finally {
        setDataLoading(false);
      }
    };

    void loadData();
  }, []);


  /* =======================================================
   * Loading
   * ===================================================== */

  if (dataLoading) {
    return (
      <div className="mt-12 rounded-xl border border-white/[0.08] bg-[#101521] p-6 text-sm text-[#8B92A6]">
        Loading holdings...
      </div>
    );
  }


  /* =======================================================
   * Missing data
   * ===================================================== */

  if (!holdingsData || !signal) {
    return (
      <div className="mt-12 rounded-xl border border-white/[0.08] bg-[#101521] p-6 text-sm text-[#8B92A6]">
        Holdings data is unavailable.
      </div>
    );
  }


  /* =======================================================
   * Derived data
   * ===================================================== */

  const holdings =
    holdingsData.holdings;

  const stockPct =
    100 - holdingsData.cash_pct;

  const isBull =
    signal.regime === "BULL";

  const isAuthenticated =
    !loading && !!user;

  const visibleHoldings =
    isAuthenticated
      ? holdings
      : holdings.slice(0, 2);

  return (
    <div className="mt-12 overflow-hidden rounded-xl border border-white/[0.08] bg-[#101521]">
      {/* Summary */}
      <div className="grid grid-cols-1 border-b border-white/[0.08] md:grid-cols-3">
        <SummaryItem
          label={t("totalEquity")}
          value={formatMoney(
            holdingsData.total_equity,
          )}
        />

        <div className="border-white/[0.08] px-6 py-5 md:border-l">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#5A6178]">
            {t("stockCash")}
          </p>

          <p className="mt-2 font-mono text-lg font-medium text-[#EDEAE1]">
            {stockPct.toFixed(0)}% /{" "}
            {holdingsData.cash_pct.toFixed(0)}%
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#242C42]">
            <div
              className="h-full rounded-full bg-[#E4BC7A]"
              style={{
                width: `${stockPct}%`,
              }}
            />
          </div>
        </div>

        <div className="border-white/[0.08] px-6 py-5 md:border-l">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#5A6178]">
            {t("regime")}
          </p>

          <div className="mt-3">
            <span
              className={[
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-sm font-semibold",
                isBull
                  ? "border-[#7FA37A]/40 bg-[#7FA37A]/10 text-[#7FA37A]"
                  : "border-[#C1614F]/40 bg-[#C1614F]/10 text-[#C1614F]",
              ].join(" ")}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />

              {signal.regime}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-6 py-5">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/[0.12]">
              <TableHead>
                {t("symbol")}
              </TableHead>

              <TableHead numeric>
                {t("shares")}
              </TableHead>

              <TableHead numeric>
                {t("costPrice")}
              </TableHead>

              <TableHead numeric>
                {t("currentPrice")}
              </TableHead>

              <TableHead numeric>
                {t("marketValue")}
              </TableHead>

              <TableHead numeric>
                {t("weight")}
              </TableHead>

              <TableHead numeric>
                {t("pnl")}
              </TableHead>
            </tr>
          </thead>

          <tbody>
            {/* Real visible holdings */}
            {visibleHoldings.map((holding) => (
              <tr
                key={holding.symbol}
                className="border-b border-white/[0.08] last:border-b-0"
              >
                <td className="py-4 font-mono font-semibold text-[#E4BC7A]">
                  {holding.symbol}
                </td>

                <TableNumber>
                  {formatShares(holding.shares)}
                </TableNumber>

                <TableNumber>
                  {formatPrice(holding.cost_price)}
                </TableNumber>

                <TableNumber>
                  {formatPrice(holding.current_price)}
                </TableNumber>

                <TableNumber>
                  {formatMoney(holding.market_value)}
                </TableNumber>

                <TableNumber>
                  {holding.weight_pct.toFixed(1)}%
                </TableNumber>

                <td
                  className={[
                    "py-4 text-right font-mono",
                    holding.pnl_pct >= 0
                      ? "text-[#7FA37A]"
                      : "text-[#C1614F]",
                  ].join(" ")}
                >
                  {formatPct(holding.pnl_pct)}
                </td>
              </tr>
            ))}

            {/* Locked placeholder rows */}
            {!loading &&
              !isAuthenticated &&
              holdings.length > 2 &&
              [0, 1, 2].map((index) => (
                <tr
                  key={`locked-${index}`}
                  aria-hidden="true"
                  className="pointer-events-none border-b border-white/[0.08] select-none opacity-30 blur-[5px]"
                >
                  <td className="py-4 font-mono font-semibold text-[#E4BC7A]">
                    XXXX
                  </td>

                  <TableNumber>1,234</TableNumber>
                  <TableNumber>$123.45</TableNumber>
                  <TableNumber>$156.78</TableNumber>
                  <TableNumber>$12,345</TableNumber>
                  <TableNumber>12.3%</TableNumber>

                  <td className="py-4 text-right font-mono text-[#7FA37A]">
                    +23.4%
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading &&
          !isAuthenticated &&
          holdings.length > 2 && (
            <div className="mt-5 flex flex-col items-center justify-center gap-3 border-t border-white/[0.08] pt-5 sm:flex-row">
              <span className="text-sm">
                🔒
              </span>

              <p className="text-center text-xs text-[#8B92A6]">
                {t("loginToViewAll")}
              </p>

              <Link
                href="/login?redirect=/"
                className="text-xs font-medium text-[#E4BC7A] transition hover:text-[#F0CC8E]"
              >
                {t("loginToView")}
              </Link>
            </div>
          )}
      </div>
    </div>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
};

function SummaryItem({
  label,
  value,
}: SummaryItemProps) {
  return (
    <div className="px-6 py-5">
      <p className="text-[10px] uppercase tracking-[0.08em] text-[#5A6178]">
        {label}
      </p>

      <p className="mt-2 font-mono text-lg font-medium text-[#EDEAE1]">
        {value}
      </p>
    </div>
  );
}

type TableHeadProps = {
  children: React.ReactNode;
  numeric?: boolean;
};

function TableHead({
  children,
  numeric = false,
}: TableHeadProps) {
  return (
    <th
      className={[
        "pb-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[#5A6178]",
        numeric ? "text-right" : "text-left",
      ].join(" ")}
    >
      {children}
    </th>
  );
}

function TableNumber({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="py-4 text-right font-mono text-[#EDEAE1]">
      {children}
    </td>
  );
}

function formatPct(
  value: number,
  digits = 1,
) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(
    digits,
  )}%`;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatMoney(value: number) {
  return `$${Math.round(
    value,
  ).toLocaleString()}`;
}

function formatShares(value: number) {
  return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toLocaleString(undefined, {
        maximumFractionDigits: 4,
      });
}