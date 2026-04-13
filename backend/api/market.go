package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

// fxCache holds cached exchange rates to avoid hammering the free API
var fxCache struct {
	sync.RWMutex
	rates     map[string]float64
	base      string
	fetchedAt time.Time
}

// fetchFXRates fetches live exchange rates from ExchangeRate-API (free, no key)
func fetchFXRates(base string) (map[string]float64, error) {
	fxCache.RLock()
	if time.Since(fxCache.fetchedAt) < 5*time.Minute && fxCache.base == base && fxCache.rates != nil {
		rates := fxCache.rates
		fxCache.RUnlock()
		return rates, nil
	}
	fxCache.RUnlock()

	url := fmt.Sprintf("https://api.exchangerate-api.com/v4/latest/%s", strings.ToUpper(base))
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch rates: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var result struct {
		Rates map[string]float64 `json:"rates"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse rates: %w", err)
	}

	fxCache.Lock()
	fxCache.rates = result.Rates
	fxCache.base = base
	fxCache.fetchedAt = time.Now()
	fxCache.Unlock()

	return result.Rates, nil
}

// HandleFXRates returns live exchange rates for a given base currency
// GET /api/market/fx?base=USD
func HandleFXRates(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	base := r.URL.Query().Get("base")
	if base == "" {
		base = "USD"
	}
	base = strings.ToUpper(base)

	// Validate currency code
	validCurrencies := map[string]bool{
		"USD": true, "EUR": true, "GBP": true, "INR": true, "JPY": true,
		"CAD": true, "AUD": true, "CHF": true, "CNY": true, "SGD": true,
	}
	if !validCurrencies[base] {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "unsupported base currency",
		})
		return
	}

	rates, err := fetchFXRates(base)
	if err != nil {
		// Return fallback rates if API call fails
		rates = fallbackRates(base)
	}

	// Filter to common currencies only
	commonCurrencies := []string{"USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "CHF", "CNY", "SGD", "BRL", "MXN", "KRW", "AED", "SAR"}
	filtered := make(map[string]float64)
	for _, code := range commonCurrencies {
		if rate, ok := rates[code]; ok {
			filtered[code] = rate
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"base":       base,
		"rates":      filtered,
		"fetched_at": fxCache.fetchedAt.Format(time.RFC3339),
	})
}

// HandleCurrencyConvert converts an amount between currencies
// GET /api/market/convert?from=USD&to=INR&amount=100
func HandleCurrencyConvert(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	from := strings.ToUpper(r.URL.Query().Get("from"))
	to := strings.ToUpper(r.URL.Query().Get("to"))

	var amount float64
	if _, err := fmt.Sscanf(r.URL.Query().Get("amount"), "%f", &amount); err != nil || amount <= 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "invalid amount",
		})
		return
	}

	if from == "" || to == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "from and to currency required",
		})
		return
	}

	rates, err := fetchFXRates(from)
	if err != nil {
		rates = fallbackRates(from)
	}

	rate, ok := rates[to]
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   fmt.Sprintf("unsupported target currency: %s", to),
		})
		return
	}

	converted := amount * rate

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":        true,
		"from":           from,
		"to":             to,
		"amount":         amount,
		"converted":      fmt.Sprintf("%.4f", converted),
		"rate":           rate,
		"fetched_at":     fxCache.fetchedAt.Format(time.RFC3339),
	})
}

// HandleCryptoPrices fetches crypto prices from CoinGecko (free, no key)
// GET /api/market/crypto
func HandleCryptoPrices(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	url := "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,usd-coin,tether,solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"
	resp, err := http.Get(url)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    fallbackCryptoPrices(),
			"source":  "fallback",
		})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    fallbackCryptoPrices(),
			"source":  "fallback",
		})
		return
	}

	var prices map[string]interface{}
	if err := json.Unmarshal(body, &prices); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    fallbackCryptoPrices(),
			"source":  "fallback",
		})
		return
	}

	// Rename keys to friendlier names
	friendlyPrices := map[string]interface{}{
		"BTC":  prices["bitcoin"],
		"ETH":  prices["ethereum"],
		"USDC": prices["usd-coin"],
		"USDT": prices["tether"],
		"SOL":  prices["solana"],
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    friendlyPrices,
		"source":  "coingecko",
	})
}

// fallbackRates provides static fallback rates when the API is unavailable
func fallbackRates(base string) map[string]float64 {
	usdRates := map[string]float64{
		"USD": 1.0, "EUR": 0.92, "GBP": 0.79, "INR": 83.12, "JPY": 149.50,
		"CAD": 1.36, "AUD": 1.53, "CHF": 0.90, "CNY": 7.24, "SGD": 1.34,
		"BRL": 4.97, "MXN": 17.15, "KRW": 1325.0, "AED": 3.67, "SAR": 3.75,
	}
	if base == "USD" {
		return usdRates
	}
	// Cross-rate: convert USD rates to base currency
	baseRate, ok := usdRates[base]
	if !ok {
		return usdRates
	}
	result := make(map[string]float64)
	for code, rate := range usdRates {
		result[code] = rate / baseRate
	}
	return result
}

// fallbackCryptoPrices provides static fallback crypto prices
func fallbackCryptoPrices() map[string]interface{} {
	return map[string]interface{}{
		"BTC":  map[string]interface{}{"usd": 65000, "usd_24h_change": 2.5},
		"ETH":  map[string]interface{}{"usd": 3200, "usd_24h_change": 1.8},
		"USDC": map[string]interface{}{"usd": 1.0, "usd_24h_change": 0.01},
		"USDT": map[string]interface{}{"usd": 1.0, "usd_24h_change": 0.02},
		"SOL":  map[string]interface{}{"usd": 140, "usd_24h_change": -1.2},
	}
}
