import axios from "axios";
import * as cheerio from "cheerio";
import { cache, getFromCache, setInCache } from "../utils/cache";
import { log } from "../utils/logger";

/**
 * Scrape Yahoo Finance quote page for CMP (current price).
 * symbol example: "RELIANCE.NS" or "AAPL"
 */
export const getCMP = async (symbol: string) => {
  const key = `cmp:${symbol}`;
  const cached = getFromCache(key);
  if (cached) {
    return cached;
  }

  // Map symbol to Yahoo quote URL
  const url = `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`;

  try {
    const headers = {
      "User-Agent": process.env.USER_AGENT || "Mozilla/5.0"
    };

    const resp = await axios.get(url, { headers, timeout: 10000 });
    const html = resp.data as string;
    const $ = cheerio.load(html);

    // Yahoo places current price inside <fin-streamer data-field="regularMarketPrice"> or other tags
    // We try a few fallbacks.
    const priceEl = $('fin-streamer[data-field="regularMarketPrice"]').first();
    let priceText = priceEl.text().trim();

    if (!priceText) {
      // fallback: look for span with data-reactid or other selectors
      priceText = $('div#quote-header-info').find('fin-streamer').first().text().trim();
    }

    const price = priceText ? Number(priceText.replace(/,/g, "")) : null;
    const result = {
      symbol,
      price,
      timestamp: new Date().toISOString(),
      source: "yahoo"
    };

    setInCache(key, result); // cached with default TTL
    return result;
  } catch (err) {
    log("Yahoo fetch error", symbol, (err as any)?.message);
    return { symbol, price: null, timestamp: new Date().toISOString(), source: "yahoo", error: (err as any)?.message };
  }
};
