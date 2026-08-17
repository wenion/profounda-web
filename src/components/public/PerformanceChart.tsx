"use client";

import {
  useEffect,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/i18n/navigation";
import {
  dataService,
} from "@/services/dataService";

import type {
  EquityCurvePoint,
  HeadlineData,
  RebalanceEntry,
} from "@/types/performance";


type PerformanceMode =
  | "backtest"
  | "live";

type RebalanceAction =
  RebalanceEntry["actions"][number];


export function PerformanceChart() {
  const t = useTranslations("Home");
  const { user, loading } = useAuth();

  const [mode, setMode] =
    useState<PerformanceMode>(
      "backtest",
    );

  const [
    showRebalanceLog,
    setShowRebalanceLog,
  ] = useState(false);

  const [
    equityCurveBacktest,
    setEquityCurveBacktest,
  ] = useState<EquityCurvePoint[]>(
    [],
  );

  const [
    equityCurveLive,
    setEquityCurveLive,
  ] = useState<EquityCurvePoint[]>(
    [],
  );

  const [
    headline,
    setHeadline,
  ] = useState<HeadlineData | null>(
    null,
  );

  const [
    rebalanceLog,
    setRebalanceLog,
  ] = useState<RebalanceEntry[]>(
    [],
  );

  const [
    dataLoading,
    setDataLoading,
  ] = useState(true);


  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          backtest,
          live,
          headlineData,
          rebalanceData,
        ] = await Promise.all([
          dataService
            .getEquityCurveBacktest(),

          dataService
            .getEquityCurveLive(),

          dataService
            .getHeadline(),

          dataService
            .getRebalanceLog(),
        ]);

        setEquityCurveBacktest(
          backtest,
        );

        setEquityCurveLive(
          live,
        );

        setHeadline(
          headlineData,
        );

        setRebalanceLog(
          rebalanceData,
        );
      } catch (error) {
        console.error(
          "Failed to load performance data:",
          error,
        );
      } finally {
        setDataLoading(false);
      }
    };

    void loadData();
  }, []);


  const data =
    mode === "backtest"
      ? equityCurveBacktest
      : equityCurveLive;

  const stats =
    headline
      ? mode === "backtest"
        ? headline.backtest
        : headline.live_account
      : null;


  if (dataLoading) {
    return (
      <div className="mt-12 rounded-xl border border-white/[0.08] bg-[#101521] p-6 text-sm text-[#8B92A6]">
        Loading performance data...
      </div>
    );
  }


  if (!headline || !stats) {
    return (
      <div className="mt-12 rounded-xl border border-white/[0.08] bg-[#101521] p-6 text-sm text-[#8B92A6]">
        Performance data is unavailable.
      </div>
    );
  }


  return (
    <div className="mt-12 overflow-hidden rounded-xl border border-white/[0.08] bg-[#101521]">

      {/* Top controls */}
      <div className="flex flex-col gap-5 border-b border-white/[0.08] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex gap-2">
          <ModeButton
            active={
              mode === "backtest"
            }
            onClick={() =>
              setMode("backtest")
            }
          >
            {t(
              "performance.backtest",
            )}
          </ModeButton>

          <ModeButton
            active={
              mode === "live"
            }
            onClick={() =>
              setMode("live")
            }
          >
            {t(
              "performance.live",
            )}
          </ModeButton>
        </div>


        {/* Legend */}
        <div className="flex items-center gap-6">
          <Legend
            color="#E4BC7A"
            label={t(
              "performance.strategy",
            )}
          />

          <Legend
            color="#4FA9A0"
            label={t(
              "performance.spyBuyHold",
            )}
            dashed
          />
        </div>
      </div>


      {/* Chart */}
      <div className="h-[430px] px-4 pb-4 pt-8 sm:px-7">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 15,
              bottom: 5,
              left: 10,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="rgba(237,234,225,0.06)"
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              minTickGap={70}
              tick={{
                fill: "#5A6178",
                fontSize: 10,
                fontFamily:
                  "IBM Plex Mono, monospace",
              }}
            />

            <YAxis
              scale="log"
              domain={[
                "auto",
                "auto",
              ]}
              allowDataOverflow
              axisLine={false}
              tickLine={false}
              width={65}
              tick={{
                fill: "#5A6178",
                fontSize: 10,
                fontFamily:
                  "IBM Plex Mono, monospace",
              }}
              tickFormatter={(
                value,
              ) =>
                `$${(
                  value / 1000
                ).toFixed(0)}k`
              }
            />

            <Tooltip
              content={
                <CurveTooltip
                  strategyLabel={t(
                    "performance.strategy",
                  )}
                  spyLabel={t(
                    "performance.spyBuyHold",
                  )}
                />
              }
              cursor={{
                stroke:
                  "rgba(237,234,225,0.12)",
                strokeWidth: 1,
              }}
            />

            <Line
              type="monotone"
              dataKey="spy"
              name={t(
                "performance.spyBuyHold",
              )}
              stroke="#4FA9A0"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              activeDot={{
                r: 3,
                fill: "#4FA9A0",
                strokeWidth: 0,
              }}
              isAnimationActive={
                false
              }
            />

            <Line
              type="monotone"
              dataKey="equity"
              name={t(
                "performance.strategy",
              )}
              stroke="#E4BC7A"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 3,
                fill: "#E4BC7A",
                strokeWidth: 0,
              }}
              isAnimationActive={
                false
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>


      {/* Bottom statistics */}
      <div className="grid grid-cols-2 border-t border-white/[0.08] md:grid-cols-4">

        <CurveStat
          label={t(
            "performance.initialToCurrent",
          )}
          value={`${formatMoney(
            stats.initial,
          )} → ${formatMoney(
            stats.final,
          )}`}
        />

        <CurveStat
          label={t(
            "performance.totalReturn",
          )}
          value={formatPct(
            stats.total_return_pct,
          )}
          tone="green"
        />

        <CurveStat
          label={t(
            "performance.spyReturn",
          )}
          value={formatPct(
            stats.spy_return_pct,
          )}
        />

        <CurveStat
          label={t(
            "performance.maxDrawdown",
          )}
          value={`${stats.max_dd_pct}%`}
          tone="red"
        />
      </div>


      {/* Rebalance log */}
      <div className="border-t border-white/[0.08] px-6 py-5">

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() =>
              setShowRebalanceLog(
                current =>
                  !current,
              )
            }
            className="cursor-pointer rounded-md border border-white/[0.12] px-4 py-2 font-mono text-xs text-[#697386] transition hover:border-[#E4BC7A] hover:text-[#E4BC7A]"
          >
            {showRebalanceLog
              ? t(
                  "performance.hideRebalances",
                )
              : t(
                  "performance.recentRebalances",
                )}
          </button>
        </div>


        {showRebalanceLog && (
          <div className="mt-5 border-t border-white/[0.08] pt-5">
            {rebalanceLog.map(
              (log) => (
                <RebalanceLog
                  key={`${log.quarter}-${log.date}`}
                  log={log}
                  isAuthenticated={
                    !loading &&
                    !!user
                  }
                  buyLabel={t(
                    "performance.buy",
                  )}
                  sellLabel={t(
                    "performance.sell",
                  )}
                  summary={t(
                    "performance.rebalanceSummary",
                    {
                      buys:
                        log.n_buys,
                      sells:
                        log.n_sells,
                      held:
                        log.n_held,
                    },
                  )}
                  loginPrompt={t(
                    "performance.loginToViewHoldings",
                  )}
                  loginLabel={t(
                    "performance.login",
                  )}
                />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}


type ModeButtonProps = {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
};


function ModeButton({
  active,
  children,
  onClick,
}: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "cursor-pointer rounded-md border px-4 py-2 font-mono text-xs transition",
        active
          ? "border-[#E4BC7A] bg-[#E4BC7A] text-[#0B0F1A]"
          : "border-white/[0.12] text-[#697386] hover:border-white/[0.22] hover:text-[#EDEAE1]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}


type LegendProps = {
  color: string;
  label: string;
  dashed?: boolean;
};


function Legend({
  color,
  label,
  dashed = false,
}: LegendProps) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="24"
        height="4"
        viewBox="0 0 24 4"
      >
        <line
          x1="0"
          y1="2"
          x2="24"
          y2="2"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={
            dashed
              ? "3 3"
              : undefined
          }
        />
      </svg>

      <span className="font-mono text-[10px] text-[#697386]">
        {label}
      </span>
    </div>
  );
}


type CurveStatProps = {
  label: string;
  value: string;
  tone?: "green" | "red";
};


function CurveStat({
  label,
  value,
  tone,
}: CurveStatProps) {
  const valueColor =
    tone === "green"
      ? "text-[#7FA37A]"
      : tone === "red"
        ? "text-[#C1614F]"
        : "text-[#EDEAE1]";

  return (
    <div className="border-white/[0.08] px-5 py-5 md:border-r md:last:border-r-0">
      <p className="text-[10px] uppercase tracking-[0.08em] text-[#5A6178]">
        {label}
      </p>

      <p
        className={`mt-2 font-mono text-sm font-medium ${valueColor}`}
      >
        {value}
      </p>
    </div>
  );
}


type RebalanceLogProps = {
  log: RebalanceEntry;
  buyLabel: string;
  sellLabel: string;
  summary: string;
  isAuthenticated: boolean;
  loginPrompt: string;
  loginLabel: string;
};


function RebalanceLog({
  log,
  buyLabel,
  sellLabel,
  summary,
  isAuthenticated,
  loginPrompt,
  loginLabel,
}: RebalanceLogProps) {
  const visibleActions =
    isAuthenticated
      ? log.actions
      : log.actions.slice(
          0,
          2,
        );

  const hasHiddenActions =
    !isAuthenticated &&
    log.actions.length > 2;

  return (
    <div className="mb-6 last:mb-0">

      {/* Quarter header */}
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">

        <h3 className="font-serif text-lg font-semibold text-[#EDEAE1]">
          {log.quarter}
        </h3>

        <p className="font-mono text-xs text-[#5A6178]">
          {log.date} · {summary}
        </p>
      </div>


      {/* Visible actions */}
      <div className="flex flex-wrap gap-2">
        {visibleActions.map(
          (
            action,
            index,
          ) => (
            <RebalanceActionChip
              key={`${log.quarter}-${action.symbol}-${action.type}-${index}`}
              action={action}
              label={
                action.type ===
                "buy"
                  ? buyLabel
                  : sellLabel
              }
            />
          ),
        )}
      </div>


      {/* Locked actions */}
      {hasHiddenActions && (
        <div className="relative mt-2 overflow-hidden rounded-lg">

          <div
            className="pointer-events-none flex flex-wrap gap-2 select-none opacity-40 blur-[5px]"
            aria-hidden="true"
          >
            <div className="h-8 w-32 rounded-md bg-white/10" />
            <div className="h-8 w-40 rounded-md bg-white/10" />
            <div className="h-8 w-28 rounded-md bg-white/10" />
            <div className="h-8 w-36 rounded-md bg-white/10" />
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#C9A15C]/15 bg-[#C9A15C]/[0.04] px-4 py-3">

            <span className="text-sm">
              🔒
            </span>

            <p className="flex-1 text-xs text-[#8B92A6]">
              {loginPrompt}
            </p>

            <Link
              href="/login?redirect=/"
              className="shrink-0 text-xs font-medium text-[#E4BC7A] transition hover:text-[#F0CC8E]"
            >
              {loginLabel}
            </Link>
          </div>
        </div>
      )}


      {/* Held note */}
      {isAuthenticated &&
        log.held_note && (
          <p className="mt-3 text-xs leading-6 text-[#5A6178]">
            ℹ️ {log.held_note}
          </p>
        )}
    </div>
  );
}


type RebalanceActionChipProps = {
  action: RebalanceAction;
  label: string;
};


function RebalanceActionChip({
  action,
  label,
}: RebalanceActionChipProps) {
  const isBuy =
    action.type === "buy";

  return (
    <div
      className={[
        "flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-xs",
        isBuy
          ? "border-[#7FA37A]/30 bg-[#7FA37A]/10 text-[#7FA37A]"
          : "border-[#C1614F]/30 bg-[#C1614F]/10 text-[#C1614F]",
      ].join(" ")}
    >
      <span>
        {label}
      </span>

      <span className="font-semibold text-[#E4BC7A]">
        {action.symbol}
      </span>

      <span>
        {action.detail}
      </span>
    </div>
  );
}


type TooltipPayloadItem = {
  dataKey?: string;
  value?: number;
};


type CurveTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
  strategyLabel: string;
  spyLabel: string;
};


function CurveTooltip({
  active,
  label,
  payload,
  strategyLabel,
  spyLabel,
}: CurveTooltipProps) {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const strategy =
    payload.find(
      item =>
        item.dataKey ===
        "equity",
    );

  const spy =
    payload.find(
      item =>
        item.dataKey ===
        "spy",
    );

  return (
    <div className="rounded-md border border-[#1C2438] bg-[#121826] px-4 py-3 shadow-xl">

      <p className="mb-2 font-mono text-[10px] text-[#8B92A6]">
        {label}
      </p>

      {strategy?.value != null && (
        <p className="font-mono text-xs text-[#E4BC7A]">
          {strategyLabel}{" "}
          {formatMoneyDetailed(
            strategy.value,
          )}
        </p>
      )}

      {spy?.value != null && (
        <p className="mt-1 font-mono text-xs text-[#4FA9A0]">
          {spyLabel}{" "}
          {formatMoneyDetailed(
            spy.value,
          )}
        </p>
      )}
    </div>
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


function formatMoney(
  value: number,
) {
  return `$${(
    value / 1000
  ).toFixed(0)}k`;
}


function formatMoneyDetailed(
  value: number,
) {
  return `$${Math.round(
    value,
  ).toLocaleString()}`;
}