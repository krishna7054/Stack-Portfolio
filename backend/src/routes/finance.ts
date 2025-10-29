import { Router } from "express";
import path from "path";
import fs from "fs/promises";
import { getCMP } from "../services/yahoo.service";
import { getMetrics } from "../services/google.service";

const router = Router();

const dataPath = path.join(process.cwd(), "src", "data", "portfolio.json");

// Define expected response types
interface CMPResponse {
  price: number;
  timestamp: string | null;
}

interface MetricsResponse {
  peRatio: number | null;
  latestEarnings: number | null;
}

// Define portfolio item type
interface PortfolioItem {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  [key: string]: any;
}

router.get("/portfolio", async (_req, res, next) => {
  try {
    const raw = await fs.readFile(dataPath, "utf-8");
    const portfolio = JSON.parse(raw);
    res.json({ portfolio });
  } catch (err) {
    next(err);
  }
});

// GET live CMP only
router.get("/quote/:symbol", async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const result = await getCMP(symbol);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET P/E and latest earnings (Google Finance)
router.get("/metrics/:symbol", async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const result = await getMetrics(symbol);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Expanded portfolio with live values
router.get("/portfolio/expanded", async (req, res, next) => {
  try {
    const raw = await fs.readFile(dataPath, "utf-8");
    const portfolio = JSON.parse(raw) as Array<any>;

    // fetch CMP and metrics in parallel for each item - but use caching inside services
    const expanded = await Promise.all(
      portfolio.map(async (item) => {
        const symbol = item.symbol.toUpperCase();
        const cmpPromise = getCMP(symbol);
        const metricsPromise = getMetrics(symbol);

        const [cmpRes, metricsRes] = await Promise.all([cmpPromise, metricsPromise]) as [CMPResponse, MetricsResponse];

        const cmp = cmpRes?.price ?? null;
        const presentValue = cmp !== null ? cmp * item.quantity : null;
        const investment = item.purchasePrice * item.quantity;
        const gainLoss = presentValue !== null ? presentValue - investment : null;
        return {
          ...item,
          cmp,
          presentValue,
          investment,
          gainLoss,
          peRatio: metricsRes?.peRatio ?? null,
          latestEarnings: metricsRes?.latestEarnings ?? null,
          lastUpdated: cmpRes?.timestamp ?? null
        };
      })
    );

    res.json({ portfolio: expanded });
  } catch (err) {
    next(err);
  }
});

export default router;
