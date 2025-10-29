export interface StockItem {
  symbol: string;
  name: string;
  purchasePrice: number;
  quantity: number;
  exchange: "NSE" | "BSE" | string;
  sector?: string;
}
