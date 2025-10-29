import axios from "axios";
import * as cheerio from "cheerio";
import { getFromCache, setInCache } from "../utils/cache";
import { log } from "../utils/logger";

/**
 * Scrape Google Finance page for P/E and latest earnings.
 * symbol example: "RELIANCE.NS" or "AAPL"
 * Google Finance expects tickers without exchange suffix sometimes — adjust if needed.
 */
export const getMetrics = async (symbol: string) => {
  const key = `metrics:${symbol}`;
  const cached = getFromCache(key);
  if (cached) return cached;

  // Google finance url patterns vary. We'll try google finance search page
  const url = `https://www.google.com/finance/quote/${encodeURIComponent(symbol)}`;

  try {
    const headers = {
      "User-Agent": process.env.USER_AGENT || "Mozilla/5.0"
    };

    const resp = await axios.get(url, { headers, timeout: 10000 });
    const html = resp.data as string;
    const $ = cheerio.load(html);

    // Example: P/E might be inside a div with text 'P/E ratio' and the value in adjacent span
    let peRatio: number | null = null;
    let latestEarnings: string | null = null;

    // Search for labels
    $('div').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt.includes("P/E") || txt.includes("P/E ratio")) {
        const val = $(el).find('div').last().text().trim();
        if (val) {
          const n = Number(val.replace(/,/g, ""));
          if (!Number.isNaN(n)) peRatio = n;
        }
      }
    });

    // Alternate: find using attribute selectors or known class patterns
    const possiblePe = $('div:contains("P/E")').next().text().trim();
    if (!peRatio && possiblePe) {
      const n = Number(possiblePe.replace(/,/g, ""));
      if (!Number.isNaN(n)) peRatio = n;
    }

    // Latest earnings: Harder to standardize — attempt to extract "Earnings" block
    const earningsBlock = $('div:contains("Earnings")').first().text().trim();
    if (earningsBlock) {
      latestEarnings = earningsBlock.replace(/\s+/g, " ").trim();
    } else {
      // fallback: look for percent or quarter strings
      const maybe = $('div').filter((i, el) => {
        const t = $(el).text();
        return Boolean(t) && (t.includes("EPS") || t.toLowerCase().includes("earnings"));
      }).first().text().trim();
      if (maybe) latestEarnings = maybe;
    }

    const result = {
      symbol,
      peRatio,
      latestEarnings,
      timestamp: new Date().toISOString(),
      source: "google"
    };

    setInCache(key, result, 30); // cache slightly longer
    return result;
  } catch (err) {
    log("Google fetch error", symbol, (err as any)?.message);
    return { symbol, peRatio: null, latestEarnings: null, timestamp: new Date().toISOString(), error: (err as any)?.message };
  }
};
