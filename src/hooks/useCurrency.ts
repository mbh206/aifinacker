import { useState, useEffect } from 'react';
import axios from 'axios';

// Interface for exchange rate data
interface ExchangeRates {
	[currencyCode: string]: number;
}

// Configuration for currency formatting
interface CurrencyConfig {
	locale: string;
	currency: string;
}

/**
 * Custom hook for managing currency conversion and formatting
 */
export const useCurrency = (baseCurrency: string = 'USD') => {
	const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Default currency configuration (can be customized)
	const defaultConfig: CurrencyConfig = {
		locale: 'en-US',
		currency: baseCurrency,
	};

	// Fetch exchange rates from an API
	useEffect(() => {
		const fetchExchangeRates = async () => {
			try {
				// Note: Replace with your preferred exchange rate API
				const response = await axios.get(
					`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
				);
				setExchangeRates(response.data.rates);
				setIsLoading(false);
			} catch (err) {
				setError('Failed to fetch exchange rates');
				setIsLoading(false);
				console.error('Exchange rate fetch error:', err);
			}
		};

		fetchExchangeRates();
	}, [baseCurrency]);

	/**
	 * Convert amount from one currency to another
	 * @param amount - Amount to convert
	 * @param fromCurrency - Source currency code
	 * @param toCurrency - Target currency code
	 * @returns Converted amount
	 */
	const convertCurrency = (
		amount: number,
		fromCurrency: string,
		toCurrency: string
	): number => {
		if (isLoading || error) return amount;

		// If converting to the same currency
		if (fromCurrency === toCurrency) return amount;

		// Use base currency as intermediary if direct conversion isn't available
		const baseAmount = amount / (exchangeRates[fromCurrency] || 1);
		return baseAmount * (exchangeRates[toCurrency] || 1);
	};

	/**
	 * Format currency with localization
	 * @param amount - Amount to format
	 * @param config - Optional currency configuration
	 * @returns Formatted currency string
	 */
	const formatCurrency = (
		amount: number,
		config: Partial<CurrencyConfig> = {}
	): string => {
		const mergedConfig = { ...defaultConfig, ...config };

		return new Intl.NumberFormat(mergedConfig.locale, {
			style: 'currency',
			currency: mergedConfig.currency,
		}).format(amount);
	};

	return {
		convertCurrency,
		formatCurrency,
		exchangeRates,
		isLoading,
		error,
	};
};
