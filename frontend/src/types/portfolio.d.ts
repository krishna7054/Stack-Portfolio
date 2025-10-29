export interface PortfolioItem {
  symbol: string;
  particulars: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  lastUpdated: string | null;
  sector: string;
  [key: string]: any;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  stocks: PortfolioItem[];
}