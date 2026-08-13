export type Holding = {
  ticker: string;
  name: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
};

export type Portfolio = {
  cash: number;
  holdings: Holding[];
};