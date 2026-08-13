type MarketRegime =
  | "BULL"
  | "BEAR";

type MarketRegimeBadgeProps = {
  regime: MarketRegime;
};

export function MarketRegimeBadge({
  regime,
}: MarketRegimeBadgeProps) {
  const bullish = regime === "BULL";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs font-semibold",
        bullish
          ? "border-[#7FA37A]/40 bg-[#7FA37A]/10 text-[#7FA37A]"
          : "border-[#C1614F]/40 bg-[#C1614F]/10 text-[#C1614F]",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          bullish
            ? "bg-[#7FA37A]"
            : "bg-[#C1614F]",
        ].join(" ")}
      />

      {regime}
    </span>
  );
}