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

     // --- Extract metrics by label (PE Ratio, EPS) ---
    let peRatio: number | null = null;
    let latestEarnings: number | null = null;

    $("li.yf-1qull9i").each((_, el) => {
      const label = $(el).find("span.label").text().trim();
      const value = $(el).find("fin-streamer").attr("data-value");

      if (label.includes("PE Ratio")) {
        peRatio = value ? Number(value.replace(/,/g, "")) : null;
      } else if (label.includes("EPS")) {
        latestEarnings = value ? Number(value.replace(/,/g, "")) : null;
      }
    });

    // --- Exchange (NSE/BSE/NASDAQ etc.) ---
    const exchangeText = $('span.exchange.yf-15jhhmp').first().text().trim();
    const exchange = exchangeText || "N/A";

    const result = {
      symbol,
      price,
      peRatio,
      latestEarnings,
      exchange,
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
      exchange: null,
      timestamp: new Date().toISOString(),
      source: "yahoo",
      error: (err as any)?.message,
    };
  }
};
