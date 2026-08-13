"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import equityCurveBacktest from "@/data/performance/equity_curve_backtest.json";
import equityCurveLive from "@/data/performance/equity_curve_live.json";
import headline from "@/data/performance/headline.json";

type PerformanceMode =
  | "backtest"
  | "live";

type EquityPoint = {
  date: string;
  equity: number;
  spy: number;
};

export function PerformanceChart() {
  const [mode, setMode] =
    useState<PerformanceMode>("backtest");

  const data: EquityPoint[] =
    mode === "backtest"
      ? equityCurveBacktest
      : equityCurveLive;

  const stats =
    mode === "backtest"
      ? headline.backtest
      : headline.live_account;

  return (
    <div className="mt-12 overflow-hidden rounded-xl border border-white/[0.08] bg-[#101521]">
      {/* Top controls */}
      <div className="flex flex-col gap-5 border-b border-white/[0.08] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <ModeButton
            active={mode === "backtest"}
            onClick={() =>
              setMode("backtest")
            }
          >
            20 年回测
          </ModeButton>

          <ModeButton
            active={mode === "live"}
            onClick={() =>
              setMode("live")
            }
          >
            实盘 (2026 至今)
          </ModeButton>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6">
          <Legend
            color="#E4BC7A"
            label="策略"
          />

          <Legend
            color="#4FA9A0"
            label="SPY"
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
              scale={
                mode === "backtest"
                  ? "log"
                  : "auto"
              }
              domain={
                mode === "backtest"
                  ? ["auto", "auto"]
                  : ["auto", "auto"]
              }
              allowDataOverflow={
                mode === "backtest"
              }
              axisLine={false}
              tickLine={false}
              width={65}
              tick={{
                fill: "#5A6178",
                fontSize: 10,
                fontFamily:
                  "IBM Plex Mono, monospace",
              }}
              tickFormatter={(value) =>
                `$${(value / 1000).toFixed(
                  0,
                )}k`
              }
            />

            <Tooltip
              content={<CurveTooltip />}
              cursor={{
                stroke:
                  "rgba(237,234,225,0.12)",
                strokeWidth: 1,
              }}
            />

            {/* SPY first so strategy appears above it */}
            <Line
              type="monotone"
              dataKey="spy"
              name="SPY"
              stroke="#4FA9A0"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              activeDot={{
                r: 3,
                fill: "#4FA9A0",
                strokeWidth: 0,
              }}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="equity"
              name="策略"
              stroke="#E4BC7A"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 3,
                fill: "#E4BC7A",
                strokeWidth: 0,
              }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom statistics */}
      <div className="grid grid-cols-2 border-t border-white/[0.08] md:grid-cols-4">
        <CurveStat
          label="起始 → 现值"
          value={`${formatMoney(
            stats.initial,
          )} → ${formatMoney(stats.final)}`}
        />

        <CurveStat
          label="总收益"
          value={formatPct(
            stats.total_return_pct,
          )}
          tone="green"
        />

        <CurveStat
          label="同期 SPY"
          value={formatPct(
            stats.spy_return_pct,
          )}
        />

        <CurveStat
          label="最大回撤"
          value={`${stats.max_dd_pct}%`}
          tone="red"
        />
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
        "rounded-md border px-4 py-2 font-mono text-xs transition",
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
            dashed ? "3 3" : undefined
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

type TooltipPayloadItem = {
  dataKey?: string;
  value?: number;
};

type CurveTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
};

function CurveTooltip({
  active,
  label,
  payload,
}: CurveTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const strategy = payload.find(
    (item) =>
      item.dataKey === "equity",
  );

  const spy = payload.find(
    (item) => item.dataKey === "spy",
  );

  return (
    <div className="rounded-md border border-[#1C2438] bg-[#121826] px-4 py-3 shadow-xl">
      <p className="mb-2 font-mono text-[10px] text-[#8B92A6]">
        {label}
      </p>

      {strategy?.value != null && (
        <p className="font-mono text-xs text-[#E4BC7A]">
          策略{" "}
          {formatMoneyDetailed(
            strategy.value,
          )}
        </p>
      )}

      {spy?.value != null && (
        <p className="mt-1 font-mono text-xs text-[#4FA9A0]">
          SPY{" "}
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

function formatMoney(value: number) {
  return `$${(value / 1000).toFixed(
    0,
  )}k`;
}

function formatMoneyDetailed(
  value: number,
) {
  return `$${Math.round(
    value,
  ).toLocaleString()}`;
}