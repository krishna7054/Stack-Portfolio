import axios from "axios";
import * as cheerio from "cheerio";
import { getFromCache, setInCache } from "../utils/cache";
import { log } from "../utils/logger";

/**
 * Fetch price, PE ratio, and earnings (EPS) from Yahoo Finance
 */
export const getCMP = async (symbol: string) => {
  const key = `cmp:${symbol}`;
  const cached = getFromCache(key);
  if (cached) return cached;

  const url = `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`;

  try {
    const headers = {
      "User-Agent": process.env.USER_AGENT || "Mozilla/5.0",
      "Accept-Language": "en-US,en;q=0.9",
    };

    const resp = await axios.get(url, { headers, timeout: 10000 });
    const html = resp.data as string;
    const $ = cheerio.load(html);

    // --- Current Market Price ---
    const priceText =
      $('fin-streamer[data-field="regularMarketPrice"]').first().text().trim() ||
      $('div#quote-header-info fin-streamer').first().text().trim();
    const price = priceText ? Number(priceText.replace(/,/g, "")) : null;

    // --- PE Ratio (TTM) ---
    const peText = $('fin-streamer[data-field="trailingPE"]').first().text().trim();
    const peRatio = peText ? Number(peText.replace(/,/g, "")) : null;

    // --- EPS (TTM) ---
    const epsText = $('fin-streamer[data-field="epsTrailingTwelveMonths"]').first().text().trim();
    const latestEarnings = epsText ? Number(epsText.replace(/,/g, "")) : null;

    const result = {
      symbol,
      price,
      peRatio,
      latestEarnings,
      timestamp: new Date().toISOString(),
      source: "yahoo",
    };

    setInCache(key, result);
    return result;
  } catch (err) {
    log("Yahoo fetch error", symbol, (err as any)?.message);
    return {
      symbol,
      price: null,
      peRatio: null,
      latestEarnings: null,
      timestamp: new Date().toISOString(),
      source: "yahoo",
      error: (err as any)?.message,
    };
  }
};
