import {
	format,
	parseISO,
	startOfMonth,
	endOfMonth,
	subMonths,
	addMonths,
	differenceInDays,
	isWithinInterval,
} from 'date-fns';

/**
 * Utility class for advanced date operations
 */
export class DateUtils {
	/**
	 * Format a date to a specific string format
	 * @param date - Date to format
	 * @param formatString - Format string (default: 'MM/dd/yyyy')
	 * @returns Formatted date string
	 */
	static formatDate(
		date: Date | string,
		formatString: string = 'MM/dd/yyyy'
	): string {
		const parsedDate = typeof date === 'string' ? parseISO(date) : date;
		return format(parsedDate, formatString);
	}

	/**
	 * Get the start and end dates of the current month
	 * @param referenceDate - Optional reference date (defaults to current date)
	 * @returns Object with start and end dates of the month
	 */
	static getCurrentMonthRange(referenceDate: Date = new Date()): {
		startDate: Date;
		endDate: Date;
	} {
		return {
			startDate: startOfMonth(referenceDate),
			endDate: endOfMonth(referenceDate),
		};
	}

	/**
	 * Calculate the number of days in a month
	 * @param date - Date within the month
	 * @returns Number of days in the month
	 */
	static getDaysInMonth(date: Date = new Date()): number {
		return endOfMonth(date).getDate();
	}

	/**
	 * Get previous month's date range
	 * @param referenceDate - Optional reference date
	 * @returns Object with start and end dates of the previous month
	 */
	static getPreviousMonthRange(referenceDate: Date = new Date()): {
		startDate: Date;
		endDate: Date;
	} {
		const previousMonth = subMonths(referenceDate, 1);
		return {
			startDate: startOfMonth(previousMonth),
			endDate: endOfMonth(previousMonth),
		};
	}

	/**
	 * Check if a date is within a specific month
	 * @param date - Date to check
	 * @param monthDate - Reference month
	 * @returns Boolean indicating if date is in the specified month
	 */
	static isDateInMonth(date: Date, monthDate: Date = new Date()): boolean {
		const { startDate, endDate } = this.getCurrentMonthRange(monthDate);
		return isWithinInterval(date, { start: startDate, end: endDate });
	}

	/**
	 * Calculate days between two dates
	 * @param startDate - Start date
	 * @param endDate - End date
	 * @returns Number of days between dates
	 */
	static daysBetween(startDate: Date, endDate: Date): number {
		return differenceInDays(endDate, startDate);
	}

	/**
	 * Generate an array of dates for a specific month
	 * @param monthDate - Reference month
	 * @returns Array of dates in the month
	 */
	static generateMonthDates(monthDate: Date = new Date()): Date[] {
		const { startDate, endDate } = this.getCurrentMonthRange(monthDate);
		const dates: Date[] = [];

		let currentDate = startDate;
		while (currentDate <= endDate) {
			dates.push(new Date(currentDate));
			currentDate = addMonths(currentDate, 1);
		}

		return dates;
	}

	/**
	 * Get the fiscal quarter for a given date
	 * @param date - Date to check (defaults to current date)
	 * @returns Fiscal quarter number (1-4)
	 */
	static getFiscalQuarter(date: Date = new Date()): number {
		const month = date.getMonth() + 1; // JS months are 0-indexed
		return Math.ceil(month / 3);
	}

	/**
	 * Create a date from year, month, and day
	 * @param year - Year
	 * @param month - Month (1-12)
	 * @param day - Day of the month
	 * @returns Created Date object
	 */
	static createDate(year: number, month: number, day: number): Date {
		return new Date(year, month - 1, day);
	}

	/**
	 * Check if two dates are the same day
	 * @param date1 - First date
	 * @param date2 - Second date
	 * @returns Boolean indicating if dates are the same day
	 */
	static isSameDay(date1: Date, date2: Date): boolean {
		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	}
}

// Convenience exports for direct use
export const {
	formatDate,
	getCurrentMonthRange,
	getDaysInMonth,
	getPreviousMonthRange,
	isDateInMonth,
	daysBetween,
	generateMonthDates,
	getFiscalQuarter,
	createDate,
	isSameDay,
} = DateUtils;
