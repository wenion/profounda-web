type AllocationBarProps = {
  stockPercentage: number;
  cashPercentage: number;
};

export function AllocationBar({
  stockPercentage,
  cashPercentage,
}: AllocationBarProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.025] p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#EDEAE1]">
            资产配置
          </h2>

          <p className="mt-1 text-xs text-[#6F768A]">
            当前账户股票与现金比例
          </p>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#C9A15C]" />

            <span className="text-[#EDEAE1]">
              股票 {stockPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#5A6178]" />

            <span className="text-[#8B92A6]">
              现金 {cashPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="bg-[#C9A15C]"
          style={{
            width: `${stockPercentage}%`,
          }}
        />

        <div
          className="bg-[#5A6178]"
          style={{
            width: `${cashPercentage}%`,
          }}
        />
      </div>
    </section>
  );
}