// Market data API client — wraps the backend's free public market endpoints

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';

export interface FXRates {
  success: boolean;
  base: string;
  rates: Record<string, number>;
  fetched_at: string;
}

export interface ConvertResult {
  success: boolean;
  from: string;
  to: string;
  amount: number;
  converted: string;
  rate: number;
  fetched_at: string;
}

export interface CryptoPrice {
  usd: number;
  usd_24h_change?: number;
  usd_market_cap?: number;
}

export interface CryptoPricesResponse {
  success: boolean;
  data: Record<string, CryptoPrice>;
  source: 'coingecko' | 'fallback';
}

export const MarketApi = {
  /**
   * Get live FX rates for a base currency.
   * Supported bases: USD EUR GBP INR JPY CAD AUD CHF CNY SGD
   */
  async getFXRates(base = 'USD'): Promise<FXRates> {
    const res = await fetch(`${API_BASE}/api/market/fx?base=${base.toUpperCase()}`);
    if (!res.ok) throw new Error(`FX rate fetch failed: ${res.status}`);
    return res.json();
  },

  /**
   * Convert an amount from one currency to another.
   */
  async convert(from: string, to: string, amount: number): Promise<ConvertResult> {
    const res = await fetch(
      `${API_BASE}/api/market/convert?from=${from}&to=${to}&amount=${amount}`
    );
    if (!res.ok) throw new Error(`Currency convert failed: ${res.status}`);
    return res.json();
  },

  /**
   * Get live crypto prices (BTC, ETH, USDC, USDT, SOL).
   */
  async getCryptoPrices(): Promise<CryptoPricesResponse> {
    const res = await fetch(`${API_BASE}/api/market/crypto`);
    if (!res.ok) throw new Error(`Crypto price fetch failed: ${res.status}`);
    return res.json();
  },
};
