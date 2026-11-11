import { SelectedComponents } from '../types/hardware';
import {
  CPUS_CATALOG,
  GPUS_CATALOG,
  MOTHERBOARDS_CATALOG,
  COOLERS_CATALOG,
  RAM_CATALOG,
  STORAGE_CATALOG,
  PSUS_CATALOG,
  CASES_CATALOG
} from '../data/hardwareCatalog';

// Storage key and TTL (6 hours cache)
const PRICE_CACHE_KEY = 'pc_builder_market_prices_v4_calibrated';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Purge any stale or legacy caches from earlier development sessions
 */
export function purgeLegacyPriceCaches(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pc_builder_market_prices') && key !== PRICE_CACHE_KEY) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Silent failover
  }
}

// Automatically purge legacy caches on module evaluation
purgeLegacyPriceCaches();

interface PriceCachePayload {
  timestamp: number;
  prices: Record<string, number>;
}

/**
 * Baseline price extraction from all catalog items
 */
export function getBaselineCatalogPrices(): Record<string, number> {
  const map: Record<string, number> = {};
  const allCatalogs = [
    CPUS_CATALOG,
    GPUS_CATALOG,
    MOTHERBOARDS_CATALOG,
    COOLERS_CATALOG,
    RAM_CATALOG,
    STORAGE_CATALOG,
    PSUS_CATALOG,
    CASES_CATALOG
  ];

  for (const list of allCatalogs) {
    for (const item of list) {
      if (item && item.id && typeof item.priceUsd === 'number') {
        map[item.id] = item.priceUsd;
      }
    }
  }
  return map;
}

/**
 * Retrieve cached prices if fresh and validated
 */
export function getCachedPrices(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(PRICE_CACHE_KEY);
    if (!raw) return null;
    const parsed: PriceCachePayload = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.prices) {
      // Invalidate if old uncalibrated 50-series MSRP is detected
      if (parsed.prices['gpu-rtx-5060-ti-8gb'] && parsed.prices['gpu-rtx-5060-ti-8gb'] < 500) {
        localStorage.removeItem(PRICE_CACHE_KEY);
        return null;
      }
      return parsed.prices;
    }
  } catch {
    // Silent fallback
  }
  return null;
}

/**
 * Save updated prices to local storage
 */
export function setCachedPrices(prices: Record<string, number>): void {
  try {
    const payload: PriceCachePayload = {
      timestamp: Date.now(),
      prices
    };
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Silent fallback
  }
}

/**
 * Apply a dictionary of updated prices to the in-memory catalogs
 */
export function applyPricesToCatalogs(prices: Record<string, number>): void {
  const allCatalogs = [
    CPUS_CATALOG,
    GPUS_CATALOG,
    MOTHERBOARDS_CATALOG,
    COOLERS_CATALOG,
    RAM_CATALOG,
    STORAGE_CATALOG,
    PSUS_CATALOG,
    CASES_CATALOG
  ];

  for (const list of allCatalogs) {
    for (const item of list) {
      if (item && item.id && prices[item.id] !== undefined) {
        item.priceUsd = prices[item.id];
      }
    }
  }
}

/**
 * Synchronize currently selected components with fresh prices
 */
export function syncComponentPrices(
  components: SelectedComponents,
  prices: Record<string, number>
): SelectedComponents {
  const updated = { ...components };

  if (updated.cpu && prices[updated.cpu.id]) {
    updated.cpu = { ...updated.cpu, priceUsd: prices[updated.cpu.id] };
  }
  if (updated.gpu && prices[updated.gpu.id]) {
    updated.gpu = { ...updated.gpu, priceUsd: prices[updated.gpu.id] };
  }
  if (updated.motherboard && prices[updated.motherboard.id]) {
    updated.motherboard = { ...updated.motherboard, priceUsd: prices[updated.motherboard.id] };
  }
  if (updated.cooler && prices[updated.cooler.id]) {
    updated.cooler = { ...updated.cooler, priceUsd: prices[updated.cooler.id] };
  }
  if (updated.ram && prices[updated.ram.id]) {
    updated.ram = { ...updated.ram, priceUsd: prices[updated.ram.id] };
  }
  if (updated.storage && prices[updated.storage.id]) {
    updated.storage = { ...updated.storage, priceUsd: prices[updated.storage.id] };
  }
  if (updated.psu && prices[updated.psu.id]) {
    updated.psu = { ...updated.psu, priceUsd: prices[updated.psu.id] };
  }
  if (updated.caseItem && prices[updated.caseItem.id]) {
    updated.caseItem = { ...updated.caseItem, priceUsd: prices[updated.caseItem.id] };
  }
  if (updated.storageDrives && updated.storageDrives.length > 0) {
    updated.storageDrives = updated.storageDrives.map((d) =>
      prices[d.id] ? { ...d, priceUsd: prices[d.id] } : d
    );
  }

  return updated;
}

/**
 * Fetch latest dynamic market updates silently.
 * Queries any configured live market proxy / price feeds, applies market updates,
 * and saves into local cache.
 */
export async function fetchLiveMarketPrices(): Promise<Record<string, number>> {
  const basePrices = getBaselineCatalogPrices();
  const updatedPrices: Record<string, number> = { ...basePrices };

  try {
    // Check if an external JSON price endpoint is explicitly provided
    if (typeof window !== 'undefined' && (window as unknown as { __LIVE_PRICES_ENDPOINT__?: string }).__LIVE_PRICES_ENDPOINT__) {
      const endpoint = (window as unknown as { __LIVE_PRICES_ENDPOINT__: string }).__LIVE_PRICES_ENDPOINT__;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(endpoint, {
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          Object.entries(data).forEach(([id, price]) => {
            if (typeof price === 'number' && price > 0) {
              updatedPrices[id] = price;
            }
          });
        }
      }
    }
  } catch {
    // Silent failover to base prices
  }

  // Save to persistent cache
  setCachedPrices(updatedPrices);
  return updatedPrices;
}

/**
 * Initialize silent live pricing engine on application boot
 */
export function initPricingEngine(onPricesUpdated?: (prices: Record<string, number>) => void): void {
  // Purge any stale cache keys from previous sessions
  purgeLegacyPriceCaches();

  // 1. Authoritative baseline calibrated prices from hardwareCatalog
  const basePrices = getBaselineCatalogPrices();
  applyPricesToCatalogs(basePrices);
  if (onPricesUpdated) {
    onPricesUpdated(basePrices);
  }

  // 2. Silently fetch live updates in background if an endpoint is configured
  fetchLiveMarketPrices()
    .then((freshPrices) => {
      applyPricesToCatalogs(freshPrices);
      if (onPricesUpdated) {
        onPricesUpdated(freshPrices);
      }
    })
    .catch(() => {
      // Complete silent failover
    });
}

