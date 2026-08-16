export interface EquityCurvePoint {
  date: string;
  equity: number;
  spy: number;
}

export type EquityCurveData =
  EquityCurvePoint[];

export interface HeadlineData {
  backtest: {
    strategy: string;
    start: string;
    end: string;
    years: number;
    initial: number;
    final: number;
    total_return_pct: number;
    spy_return_pct: number;
    cagr_pct: number;
    max_dd_pct: number;
    sharpe: number;
    calmar: number;
  };

  live_account: {
    start: string;
    as_of: string;
    initial: number;
    final: number;
    total_return_pct: number;
    spy_return_pct: number;
    max_dd_pct: number;
    n_trades: number;
  };
}

export interface RebalanceAction {
  type: "buy" | "sell";
  symbol: string;
  detail: string;
}

export interface RebalanceEntry {
  quarter: string;
  date: string;
  n_buys: number;
  n_sells: number;
  n_held: number;
  actions: RebalanceAction[];
  held_note?: string;
}

export type RebalanceLog =
  RebalanceEntry[];

export type Holding = {
  symbol: string;
  shares: number;
  cost_price: number;
  current_price: number;
  market_value: number;
  pnl_pct: number;
  weight_pct: number;
};

export type HoldingsData = {
  as_of: string;
  cash: number;
  cash_pct: number;
  total_equity: number;
  holdings: Holding[];
};

export type SignalPick = {
  symbol: string;
  company_name: string;
  price: number;
  weight_pct: number;
};

export type SignalData = {
  as_of: string;
  quarter: string;
  regime: string;
  ma_votes: number;
  ma_total: number;
  ma_detail: string[];
  stock_pct: number;
  cash_pct: number;
  picks: SignalPick[];
  next_signal_date: string;
  score_lag_days: number;
};