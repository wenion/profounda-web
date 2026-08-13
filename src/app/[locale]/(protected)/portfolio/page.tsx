import { AllocationBar } from "@/components/portfolio/AllocationBar";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import { PortfolioStats } from "@/components/portfolio/PortfolioStats";

import type { Portfolio } from "@/types/portfolio";

const portfolio: Portfolio = {
  cash: 22469,

  holdings: [
    {
      ticker: "AAPL",
      name: "Apple",
      shares: 42.5,
      averageCost: 183.21,
      currentPrice: 221.4,
    },
    {
      ticker: "GOOG",
      name: "Alphabet",
      shares: 31.2,
      averageCost: 171.5,
      currentPrice: 195.3,
    },
    {
      ticker: "AMZN",
      name: "Amazon",
      shares: 27,
      averageCost: 192.1,
      currentPrice: 187.6,
    },
    {
      ticker: "META",
      name: "Meta",
      shares: 18.6,
      averageCost: 492.4,
      currentPrice: 530.2,
    },
    {
      ticker: "MSFT",
      name: "Microsoft",
      shares: 16.8,
      averageCost: 402.7,
      currentPrice: 421.8,
    },
    {
      ticker: "NVDA",
      name: "NVIDIA",
      shares: 38,
      averageCost: 108.6,
      currentPrice: 126.4,
    },
  ],
};

export default function PortfolioPage() {
  const metrics =
    calculatePortfolioMetrics(
      portfolio,
    );

  return (
    <div className="space-y-10">
      {/* Page header */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#C9A15C]">
            Portfolio
          </p>

          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#EDEAE1] sm:text-4xl">
            持仓
          </h1>

          <p className="mt-2 text-sm text-[#8B92A6]">
            管理你的投资组合并查看当前表现。
          </p>
        </div>

        <button
          type="button"
          className="self-start rounded-lg border border-[#C9A15C]/40 bg-[#C9A15C]/10 px-4 py-2.5 text-sm font-medium text-[#E4BC7A] transition hover:bg-[#C9A15C]/15 sm:self-auto"
        >
          编辑持仓
        </button>
      </section>

      {/* Portfolio metrics */}
      <PortfolioStats
        totalValue={metrics.totalValue}
        stockValue={metrics.stockValue}
        cash={portfolio.cash}
        totalReturn={metrics.totalReturn}
      />

      {/* Allocation */}
      <AllocationBar
        stockPercentage={
          metrics.stockPercentage
        }
        cashPercentage={
          metrics.cashPercentage
        }
      />

      {/* Holdings */}
      <HoldingsTable
        holdings={portfolio.holdings}
        totalValue={metrics.totalValue}
      />
    </div>
  );
}

function calculatePortfolioMetrics(
  portfolio: Portfolio,
) {
  const stockValue =
    portfolio.holdings.reduce(
      (total, holding) =>
        total +
        holding.shares *
          holding.currentPrice,
      0,
    );

  const stockCostBasis =
    portfolio.holdings.reduce(
      (total, holding) =>
        total +
        holding.shares *
          holding.averageCost,
      0,
    );

  const totalValue =
    stockValue + portfolio.cash;

  const totalReturn =
    stockCostBasis > 0
      ? ((stockValue -
          stockCostBasis) /
          stockCostBasis) *
        100
      : 0;

  const stockPercentage =
    totalValue > 0
      ? (stockValue / totalValue) *
        100
      : 0;

  const cashPercentage =
    totalValue > 0
      ? (portfolio.cash /
          totalValue) *
        100
      : 0;

  return {
    totalValue,
    stockValue,
    totalReturn,
    stockPercentage,
    cashPercentage,
  };
}