type PortfolioStatsProps = {
  totalValue: number;
  stockValue: number;
  cash: number;
  totalReturn: number;
};

export function PortfolioStats({
  totalValue,
  stockValue,
  cash,
  totalReturn,
}: PortfolioStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="账户总值"
        value={formatCurrency(totalValue)}
        helper="股票 + 现金"
      />

      <StatCard
        label="股票市值"
        value={formatCurrency(stockValue)}
        helper="当前持仓市值"
      />

      <StatCard
        label="现金"
        value={formatCurrency(cash)}
        helper="可用现金"
      />

      <StatCard
        label="总收益"
        value={formatPercentage(totalReturn)}
        helper="基于当前持仓成本"
        valueClassName={
          totalReturn >= 0
            ? "text-[#7FA37A]"
            : "text-[#C1614F]"
        }
      />
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  valueClassName?: string;
};

function StatCard({
  label,
  value,
  helper,
  valueClassName = "text-[#EDEAE1]",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#6F768A]">
        {label}
      </p>

      <p
        className={[
          "mt-4 font-mono text-2xl font-semibold tracking-tight",
          valueClassName,
        ].join(" ")}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-[#5A6178]">
        {helper}
      </p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercentage(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}