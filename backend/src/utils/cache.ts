import NodeCache from "node-cache";

const ttl = Number(process.env.CACHE_TTL_SECONDS ?? 15);
export const cache = new NodeCache({ stdTTL: ttl, checkperiod: Math.max(5, Math.floor(ttl / 2)) });

export const getFromCache = (key: string) => cache.get(key);
export const setInCache = (key: string, val: any, ttlSec?: number) => cache.set(key, val, ttlSec ?? ttl);
