/**
 * Utility functions for advanced currency operations
 */
export class CurrencyUtils {
	/**
	 * Remove currency symbol and commas from a currency string
	 * @param currencyString - Formatted currency string
	 * @returns Numeric value
	 */
	static parseNumericValue(currencyString: string): number {
		if (!currencyString) return 0;

		// Remove currency symbol, commas, and trim whitespace
		const numericString = currencyString.replace(/[^\d.-]/g, '').trim();

		return parseFloat(numericString) || 0;
	}

	/**
	 * Round currency value to specified decimal places
	 * @param value - Numeric value to round
	 * @param decimalPlaces - Number of decimal places (default 2)
	 * @returns Rounded currency value
	 */
	static roundCurrency(value: number, decimalPlaces: number = 2): number {
		const multiplier = Math.pow(10, decimalPlaces);
		return Math.round(value * multiplier) / multiplier;
	}

	/**
	 * Calculate percentage change between two currency values
	 * @param originalValue - Initial value
	 * @param newValue - Updated value
	 * @returns Percentage change (e.g., 10.5 for 10.5% increase)
	 */
	static calculatePercentageChange(
		originalValue: number,
		newValue: number
	): number {
		if (originalValue === 0) return newValue !== 0 ? 100 : 0;

		return this.roundCurrency(
			((newValue - originalValue) / originalValue) * 100
		);
	}

	/**
	 * Generate a random currency value within a specified range
	 * @param min - Minimum value
	 * @param max - Maximum value
	 * @param decimalPlaces - Number of decimal places (default 2)
	 * @returns Randomly generated currency value
	 */
	static generateRandomAmount(
		min: number,
		max: number,
		decimalPlaces: number = 2
	): number {
		const randomValue = Math.random() * (max - min) + min;
		return this.roundCurrency(randomValue, decimalPlaces);
	}

	/**
	 * Check if a value is a valid currency amount
	 * @param value - Value to validate
	 * @returns Boolean indicating if value is a valid currency amount
	 */
	static isValidCurrencyAmount(value: any): boolean {
		// Check if value is a number and not NaN
		if (typeof value !== 'number' || isNaN(value)) return false;

		// Ensure value is not negative
		if (value < 0) return false;

		// Optional: Add more specific validation if needed
		return true;
	}

	/**
	 * Aggregate multiple currency values
	 * @param values - Array of currency values
	 * @returns Total sum of values
	 */
	static aggregateCurrencyValues(values: number[]): number {
		return this.roundCurrency(values.reduce((sum, value) => sum + value, 0));
	}

	/**
	 * Compare two currency values with a tolerance
	 * @param value1 - First currency value
	 * @param value2 - Second currency value
	 * @param tolerance - Allowed difference (default 0.01)
	 * @returns Boolean indicating if values are approximately equal
	 */
	static approximatelyEqual(
		value1: number,
		value2: number,
		tolerance: number = 0.01
	): boolean {
		return Math.abs(value1 - value2) < tolerance;
	}
}

// Convenience functions for direct use
export const {
	parseNumericValue,
	roundCurrency,
	calculatePercentageChange,
	generateRandomAmount,
	isValidCurrencyAmount,
	aggregateCurrencyValues,
	approximatelyEqual,
} = CurrencyUtils;
