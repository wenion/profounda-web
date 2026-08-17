import type {
  PerformanceDataType,
} from "@/services/dataService";


export function validatePerformanceData(
  type: PerformanceDataType,
  data: unknown,
): void {
  switch (type) {
    case "headline":
      validateHeadline(data);
      return;

    case "holdings":
      validateHoldings(data);
      return;

    case "signal":
      validateSignal(data);
      return;

    case "rebalance_log":
      validateRebalanceLog(data);
      return;

    case "equity_curve_live":
    case "equity_curve_backtest":
      validateEquityCurve(data);
      return;
  }
}


/* =========================================================
 * Headline
 * ======================================================= */

function validateHeadline(
  data: unknown,
): void {
  const object =
    requireObject(data, "headline");

  const backtest =
    requireObject(
      object.backtest,
      "headline.backtest",
    );

  requireString(
    backtest.start,
    "backtest.start",
  );

  requireString(
    backtest.end,
    "backtest.end",
  );

  requireNumber(
    backtest.initial,
    "backtest.initial",
  );

  requireNumber(
    backtest.final,
    "backtest.final",
  );

  requireNumber(
    backtest.total_return_pct,
    "backtest.total_return_pct",
  );

  requireNumber(
    backtest.spy_return_pct,
    "backtest.spy_return_pct",
  );

  requireNumber(
    backtest.max_dd_pct,
    "backtest.max_dd_pct",
  );

  const live =
    requireObject(
      object.live_account,
      "headline.live_account",
    );

  requireString(
    live.start,
    "live_account.start",
  );

  requireString(
    live.as_of,
    "live_account.as_of",
  );

  requireNumber(
    live.initial,
    "live_account.initial",
  );

  requireNumber(
    live.final,
    "live_account.final",
  );

  requireNumber(
    live.total_return_pct,
    "live_account.total_return_pct",
  );

  requireNumber(
    live.spy_return_pct,
    "live_account.spy_return_pct",
  );

  requireNumber(
    live.max_dd_pct,
    "live_account.max_dd_pct",
  );
}


/* =========================================================
 * Equity Curve
 * ======================================================= */

function validateEquityCurve(
  data: unknown,
): void {
  if (!Array.isArray(data)) {
    throw new Error(
      "Equity curve must be an array.",
    );
  }

  data.forEach(
    (item, index) => {
      const point =
        requireObject(
          item,
          `equityCurve[${index}]`,
        );

      requireString(
        point.date,
        `equityCurve[${index}].date`,
      );

      requireNumber(
        point.equity,
        `equityCurve[${index}].equity`,
      );

      requireNumber(
        point.spy,
        `equityCurve[${index}].spy`,
      );
    },
  );
}


/* =========================================================
 * Rebalance Log
 * ======================================================= */

function validateRebalanceLog(
  data: unknown,
): void {
  if (!Array.isArray(data)) {
    throw new Error(
      "Rebalance log must be an array.",
    );
  }

  data.forEach(
    (item, index) => {
      const entry =
        requireObject(
          item,
          `rebalanceLog[${index}]`,
        );

      requireString(
        entry.quarter,
        `rebalanceLog[${index}].quarter`,
      );

      requireString(
        entry.date,
        `rebalanceLog[${index}].date`,
      );

      requireNumber(
        entry.n_buys,
        `rebalanceLog[${index}].n_buys`,
      );

      requireNumber(
        entry.n_sells,
        `rebalanceLog[${index}].n_sells`,
      );

      requireNumber(
        entry.n_held,
        `rebalanceLog[${index}].n_held`,
      );

      if (
        !Array.isArray(
          entry.actions,
        )
      ) {
        throw new Error(
          `rebalanceLog[${index}].actions must be an array.`,
        );
      }

      entry.actions.forEach(
        (
          actionData,
          actionIndex,
        ) => {
          const action =
            requireObject(
              actionData,
              `rebalanceLog[${index}].actions[${actionIndex}]`,
            );

          requireString(
            action.type,
            `actions[${actionIndex}].type`,
          );

          if (
            action.type !== "buy" &&
            action.type !== "sell"
          ) {
            throw new Error(
              `actions[${actionIndex}].type must be "buy" or "sell".`,
            );
          }

          requireString(
            action.symbol,
            `actions[${actionIndex}].symbol`,
          );

          requireString(
            action.detail,
            `actions[${actionIndex}].detail`,
          );
        },
      );

      if (
        entry.held_note !== undefined
      ) {
        requireString(
          entry.held_note,
          `rebalanceLog[${index}].held_note`,
        );
      }
    },
  );
}


/* =========================================================
 * Holdings
 * ======================================================= */

function validateHoldings(
  data: unknown,
): void {
  const object =
    requireObject(
      data,
      "holdings",
    );

  requireNumber(
    object.total_equity,
    "holdings.total_equity",
  );

  requireNumber(
    object.cash_pct,
    "holdings.cash_pct",
  );

  if (
    !Array.isArray(
      object.holdings,
    )
  ) {
    throw new Error(
      "holdings.holdings must be an array.",
    );
  }

  object.holdings.forEach(
    (holdingData, index) => {
      const holding =
        requireObject(
          holdingData,
          `holdings.holdings[${index}]`,
        );

      requireString(
        holding.symbol,
        `holdings[${index}].symbol`,
      );

      requireNumber(
        holding.shares,
        `holdings[${index}].shares`,
      );

      requireNumber(
        holding.cost_price,
        `holdings[${index}].cost_price`,
      );

      requireNumber(
        holding.current_price,
        `holdings[${index}].current_price`,
      );

      requireNumber(
        holding.market_value,
        `holdings[${index}].market_value`,
      );

      requireNumber(
        holding.weight_pct,
        `holdings[${index}].weight_pct`,
      );

      requireNumber(
        holding.pnl_pct,
        `holdings[${index}].pnl_pct`,
      );
    },
  );
}


/* =========================================================
 * Signal
 * ======================================================= */

function validateSignal(
  data: unknown,
): void {
  const object =
    requireObject(
      data,
      "signal",
    );

  requireString(
    object.as_of,
    "signal.as_of",
  );

  requireString(
    object.regime,
    "signal.regime",
  );

  requireNumber(
    object.stock_pct,
    "signal.stock_pct",
  );

  requireNumber(
    object.cash_pct,
    "signal.cash_pct",
  );

  if (
    !Array.isArray(
      object.picks,
    )
  ) {
    throw new Error(
      "signal.picks must be an array.",
    );
  }

  object.picks.forEach(
    (pickData, index) => {
      const pick =
        requireObject(
          pickData,
          `signal.picks[${index}]`,
        );

      requireString(
        pick.symbol,
        `signal.picks[${index}].symbol`,
      );

      requireString(
        pick.company_name,
        `signal.picks[${index}].company_name`,
      );

      requireNumber(
        pick.price,
        `signal.picks[${index}].price`,
      );

      requireNumber(
        pick.weight_pct,
        `signal.picks[${index}].weight_pct`,
      );
    },
  );
}


/* =========================================================
 * Helpers
 * ======================================================= */

function requireObject(
  value: unknown,
  name: string,
): Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(
      `${name} must be an object.`,
    );
  }

  return value as Record<
    string,
    unknown
  >;
}


function requireString(
  value: unknown,
  name: string,
): asserts value is string {
  if (
    typeof value !== "string"
  ) {
    throw new Error(
      `${name} must be a string.`,
    );
  }
}


function requireNumber(
  value: unknown,
  name: string,
): asserts value is number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    throw new Error(
      `${name} must be a number.`,
    );
  }
}