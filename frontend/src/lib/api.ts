import { PortfolioItem } from "@/types/portfolio";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ExpandedPortfolioResponse {
  portfolio: PortfolioItem[];
}

export async function fetchExpandedPortfolio(): Promise<PortfolioItem[]> {
  const res = await fetch(`${API_URL}/finance/portfolio/expanded`, {
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch portfolio');
  const data: ExpandedPortfolioResponse = await res.json();
  return data.portfolio;
}