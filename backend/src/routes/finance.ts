import { Router } from "express";
import path from "path";
import fs from "fs/promises";
import { getCMP } from "../services/yahoo.service"; // Yahoo Finance for all metrics

const router = Router();
const dataPath = path.join(process.cwd(), "src", "data", "portfolio.json");

// Portfolio item type
interface PortfolioItem {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  exchange?: string;
  price?: number;
  timestamp?: string | null;
  peRatio?: number | null;
  latestEarnings?: number | null;
  [key: string]: any;
}

// Yahoo Finance response type
interface CMPResponse {
  price?: number;
  timestamp?: string | null;
  peRatio?: number | null;
  latestEarnings?: number | null;
  exchange?: string | null;
}

// Fetch saved portfolio
router.get("/portfolio", async (_req, res, next) => {
  try {
    const raw = await fs.readFile(dataPath, "utf-8");
    const portfolio = JSON.parse(raw);
    res.json({ portfolio });
  } catch (err) {
    next(err);
  }
});

// Get live Yahoo Finance data for one stock
router.get("/quote/:symbol", async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const result = await getCMP(symbol);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Expanded portfolio — with CMP, PE, earnings, weight %, and exchange info
router.get("/portfolio/expanded", async (_req, res, next) => {
  try {
    const raw = await fs.readFile(dataPath, "utf-8");
    const portfolio = JSON.parse(raw) as Array<PortfolioItem>;

    const expanded = await Promise.all(
      portfolio.map(async (item) => {
        const symbol = item.symbol.toUpperCase();

        // Yahoo Finance data
        const yahooData: CMPResponse = await getCMP(symbol);
        const cmp = yahooData?.price ?? null;
        const peRatio = yahooData?.peRatio ?? null;
        const latestEarnings = yahooData?.latestEarnings ?? null;
        const lastUpdated = yahooData?.timestamp ?? null;
        const exchange = yahooData?.exchange ?? null; // default label

        // Calculations
        const investment = item.purchasePrice * item.quantity;
        const presentValue = cmp !== null ? cmp * item.quantity : null;
        const gainLoss = presentValue !== null ? presentValue - investment : null;

        return {
          ...item,
          cmp,
          investment,
          presentValue,
          gainLoss,
          peRatio,
          latestEarnings,
          exchange,
          lastUpdated,
        };
      })
    );

    // Compute total present value for Portfolio % weight
    const totalValue = expanded.reduce(
      (sum, item) => sum + (item.presentValue ?? 0),
      0
    );

    const finalPortfolio = expanded.map((item) => ({
      ...item,
      portfolioPercent:
        totalValue > 0 && item.presentValue
          ? ((item.presentValue / totalValue) * 100).toFixed(2)
          : "0.00",
    }));

    res.json({ portfolio: finalPortfolio });
  } catch (err) {
    next(err);
  }
});

export default router;
