import type { Holding } from "@/types/portfolio";

type HoldingsTableProps = {
  holdings: Holding[];
  totalValue: number;
};

export function HoldingsTable({
  holdings,
  totalValue,
}: HoldingsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#EDEAE1]">
            当前持仓
          </h2>

          <p className="mt-1 text-xs text-[#6F768A]">
            你的股票持仓和当前表现
          </p>
        </div>

        <p className="font-mono text-xs text-[#6F768A]">
          {holdings.length} 个持仓
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <TableHeader>代码</TableHeader>
              <TableHeader>公司</TableHeader>
              <TableHeader align="right">
                股数
              </TableHeader>
              <TableHeader align="right">
                成本价
              </TableHeader>
              <TableHeader align="right">
                当前价
              </TableHeader>
              <TableHeader align="right">
                市值
              </TableHeader>
              <TableHeader align="right">
                权重
              </TableHeader>
              <TableHeader align="right">
                盈亏
              </TableHeader>
            </tr>
          </thead>

          <tbody>
            {holdings.map((holding) => {
              const marketValue =
                holding.shares *
                holding.currentPrice;

              const costBasis =
                holding.shares *
                holding.averageCost;

              const returnPercentage =
                costBasis > 0
                  ? ((marketValue - costBasis) /
                      costBasis) *
                    100
                  : 0;

              const weight =
                totalValue > 0
                  ? (marketValue / totalValue) *
                    100
                  : 0;

              return (
                <tr
                  key={holding.ticker}
                  className="border-b border-white/[0.06] transition last:border-b-0 hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <span className="font-mono font-semibold text-[#EDEAE1]">
                      {holding.ticker}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-[#8B92A6]">
                      {holding.name}
                    </span>
                  </TableCell>

                  <TableCell align="right">
                    {formatNumber(
                      holding.shares,
                    )}
                  </TableCell>

                  <TableCell align="right">
                    {formatCurrency(
                      holding.averageCost,
                    )}
                  </TableCell>

                  <TableCell align="right">
                    {formatCurrency(
                      holding.currentPrice,
                    )}
                  </TableCell>

                  <TableCell align="right">
                    {formatCurrency(
                      marketValue,
                    )}
                  </TableCell>

                  <TableCell align="right">
                    {weight.toFixed(1)}%
                  </TableCell>

                  <TableCell align="right">
                    <span
                      className={
                        returnPercentage >= 0
                          ? "text-[#7FA37A]"
                          : "text-[#C1614F]"
                      }
                    >
                      {returnPercentage >= 0
                        ? "+"
                        : ""}
                      {returnPercentage.toFixed(
                        1,
                      )}
                      %
                    </span>
                  </TableCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type TableHeaderProps = {
  children: React.ReactNode;
  align?: "left" | "right";
};

function TableHeader({
  children,
  align = "left",
}: TableHeaderProps) {
  return (
    <th
      className={[
        "px-6 py-3 text-xs font-medium uppercase tracking-[0.1em] text-[#5A6178]",
        align === "right"
          ? "text-right"
          : "text-left",
      ].join(" ")}
    >
      {children}
    </th>
  );
}

type TableCellProps = {
  children: React.ReactNode;
  align?: "left" | "right";
};

function TableCell({
  children,
  align = "left",
}: TableCellProps) {
  return (
    <td
      className={[
        "px-6 py-4 font-mono text-sm text-[#B8BDCA]",
        align === "right"
          ? "text-right"
          : "text-left",
      ].join(" ")}
    >
      {children}
    </td>
  );
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  ).format(value);
}