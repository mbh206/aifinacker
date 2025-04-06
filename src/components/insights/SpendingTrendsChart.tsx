// src/components/insights/SpendingTrendsChart.tsx
import React, { useState, useMemo } from 'react';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Area,
	ComposedChart,
} from 'recharts';
import { Expense } from '../../types';

interface SpendingTrendsChartProps {
	expenses: Expense[];
}

const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({
	expenses,
}) => {
	const [timeRange, setTimeRange] = useState<'6m' | '1y' | 'all'>('6m');
	const [groupBy, setGroupBy] = useState<'month' | 'category'>('month');

	// Process expenses to get monthly spending data
	const monthlyData = useMemo(() => {
		// Filter expenses based on selected time range
		const now = new Date();
		let filteredExpenses = [...expenses];

		if (timeRange === '6m') {
			const sixMonthsAgo = new Date(now);
			sixMonthsAgo.setMonth(now.getMonth() - 6);
			filteredExpenses = expenses.filter(
				(exp) => new Date(exp.date) >= sixMonthsAgo
			);
		} else if (timeRange === '1y') {
			const oneYearAgo = new Date(now);
			oneYearAgo.setFullYear(now.getFullYear() - 1);
			filteredExpenses = expenses.filter(
				(exp) => new Date(exp.date) >= oneYearAgo
			);
		}

		// Group expenses by month
		const monthlyTotals: Record<string, number> = {};

		filteredExpenses.forEach((expense) => {
			const date = new Date(expense.date);
			const monthKey = `${date.getFullYear()}-${String(
				date.getMonth() + 1
			).padStart(2, '0')}`;

			if (!monthlyTotals[monthKey]) {
				monthlyTotals[monthKey] = 0;
			}

			monthlyTotals[monthKey] += expense.amount;
		});

		// Convert to array and sort chronologically
		return Object.entries(monthlyTotals)
			.map(([key, value]) => {
				const [year, month] = key.split('-').map((num) => parseInt(num));
				return {
					monthKey: key,
					month: new Date(year, month - 1, 1).toLocaleDateString('en-US', {
						month: 'short',
						year: 'numeric',
					}),
					amount: value,
				};
			})
			.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
	}, [expenses, timeRange]);

	// Process expenses to get category trend data
	const categoryData = useMemo(() => {
		// Filter expenses based on selected time range
		const now = new Date();
		let filteredExpenses = [...expenses];

		if (timeRange === '6m') {
			const sixMonthsAgo = new Date(now);
			sixMonthsAgo.setMonth(now.getMonth() - 6);
			filteredExpenses = expenses.filter(
				(exp) => new Date(exp.date) >= sixMonthsAgo
			);
		} else if (timeRange === '1y') {
			const oneYearAgo = new Date(now);
			oneYearAgo.setFullYear(now.getFullYear() - 1);
			filteredExpenses = expenses.filter(
				(exp) => new Date(exp.date) >= oneYearAgo
			);
		}

		// Get unique months
		const monthsSet = new Set<string>();
		filteredExpenses.forEach((expense) => {
			const date = new Date(expense.date);
			const monthKey = `${date.getFullYear()}-${String(
				date.getMonth() + 1
			).padStart(2, '0')}`;
			monthsSet.add(monthKey);
		});

		const months = Array.from(monthsSet).sort();

		// Get top 5 categories
		const categoryTotals: Record<string, number> = {};
		filteredExpenses.forEach((expense) => {
			if (!categoryTotals[expense.category]) {
				categoryTotals[expense.category] = 0;
			}
			categoryTotals[expense.category] += expense.amount;
		});

		const topCategories = Object.entries(categoryTotals)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([category]) => category);

		// Build monthly data by category
		const monthlyByCategory: Record<string, Record<string, number>> = {};

		months.forEach((monthKey) => {
			const [year, month] = monthKey.split('-').map((num) => parseInt(num));
			const monthStart = new Date(year, month - 1, 1);
			const monthEnd = new Date(year, month, 0);

			// Initialize data for this month
			monthlyByCategory[monthKey] = {
				month: new Date(year, month - 1, 1).toLocaleDateString('en-US', {
					month: 'short',
					year: 'numeric',
				}),
			};

			// Add data for each top category
			topCategories.forEach((category) => {
				const categoryTotal = filteredExpenses
					.filter(
						(expense) =>
							expense.category === category &&
							new Date(expense.date) >= monthStart &&
							new Date(expense.date) <= monthEnd
					)
					.reduce((sum, expense) => sum + expense.amount, 0);

				monthlyByCategory[monthKey][category] = categoryTotal;
			});
		});

		// Convert to array format for chart
		return Object.values(monthlyByCategory).sort((a, b) => {
			return new Date(a.month).getTime() - new Date(b.month).getTime();
		});
	}, [expenses, timeRange]);

	// Calculate moving average for trend line (3-month)
	const trendData = useMemo(() => {
		if (monthlyData.length < 2) return monthlyData;

		return monthlyData.map((item, index) => {
			// Calculate 3-month moving average
			if (index >= 2) {
				const movingAvg =
					(monthlyData[index].amount +
						monthlyData[index - 1].amount +
						monthlyData[index - 2].amount) /
					3;

				return {
					...item,
					trend: movingAvg,
				};
			}
			return {
				...item,
				trend: item.amount, // For first two points, trend equals the actual amount
			};
		});
	}, [monthlyData]);

	// Format currency
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
		}).format(value);
	};

	// Custom tooltip
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className='bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow'>
					<p className='font-semibold'>{label}</p>
					<div className='mt-2'>
						{payload.map((entry: any, index: number) => (
							<p
								key={index}
								className='text-sm'
								style={{ color: entry.color }}>
								<span className='font-medium'>{entry.name}: </span>
								{formatCurrency(entry.value)}
							</p>
						))}
					</div>
				</div>
			);
		}
		return null;
	};

	// Generate category colors
	const CATEGORY_COLORS = [
		'#4F46E5', // indigo-600
		'#10B981', // emerald-500
		'#F59E0B', // amber-500
		'#EF4444', // red-500
		'#8B5CF6', // violet-500
	];

	return (
		<div>
			{/* Controls */}
			<div className='flex flex-col sm:flex-row gap-4 mb-6'>
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Time Range
					</label>
					<div className='inline-flex rounded-md shadow-sm'>
						<button
							onClick={() => setTimeRange('6m')}
							className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
								timeRange === '6m'
									? 'bg-blue-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
							}`}>
							6 Months
						</button>
						<button
							onClick={() => setTimeRange('1y')}
							className={`px-4 py-2 text-sm font-medium ${
								timeRange === '1y'
									? 'bg-blue-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
							}`}>
							1 Year
						</button>
						<button
							onClick={() => setTimeRange('all')}
							className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
								timeRange === 'all'
									? 'bg-blue-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
							}`}>
							All Time
						</button>
					</div>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						View
					</label>
					<div className='inline-flex rounded-md shadow-sm'>
						<button
							onClick={() => setGroupBy('month')}
							className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
								groupBy === 'month'
									? 'bg-blue-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
							}`}>
							Monthly Total
						</button>
						<button
							onClick={() => setGroupBy('category')}
							className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
								groupBy === 'category'
									? 'bg-blue-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
							}`}>
							By Category
						</button>
					</div>
				</div>
			</div>

			{/* Chart */}
			<div className='h-80'>
				{groupBy === 'month' ? (
					<ResponsiveContainer
						width='100%'
						height='100%'>
						<ComposedChart
							data={trendData}
							margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
							<CartesianGrid
								strokeDasharray='3 3'
								vertical={false}
							/>
							<XAxis dataKey='month' />
							<YAxis
								tickFormatter={(value) =>
									formatCurrency(value).replace('.00', '')
								}
								width={80}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Area
								type='monotone'
								dataKey='amount'
								name='Monthly Spending'
								fill='#3B82F6'
								fillOpacity={0.2}
								stroke='#3B82F6'
							/>
							{trendData.length > 2 && (
								<Line
									type='monotone'
									dataKey='trend'
									name='3-Month Trend'
									stroke='#EF4444'
									strokeWidth={2}
									dot={false}
								/>
							)}
						</ComposedChart>
					</ResponsiveContainer>
				) : (
					<ResponsiveContainer
						width='100%'
						height='100%'>
						<LineChart
							data={categoryData}
							margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
							<CartesianGrid
								strokeDasharray='3 3'
								vertical={false}
							/>
							<XAxis dataKey='month' />
							<YAxis
								tickFormatter={(value) =>
									formatCurrency(value).replace('.00', '')
								}
								width={80}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							{categoryData.length > 0 &&
								Object.keys(categoryData[0])
									.filter((key) => key !== 'month')
									.map((category, index) => (
										<Line
											key={category}
											type='monotone'
											dataKey={category}
											name={category}
											stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
											activeDot={{ r: 8 }}
										/>
									))}
						</LineChart>
					</ResponsiveContainer>
				)}
			</div>

			{/* Insights */}
			{monthlyData.length > 1 && (
				<div className='mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
					<h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						Spending Insights
					</h3>
					<div className='space-y-2'>
						{/* Average Monthly Spending */}
						<p className='text-sm text-gray-600 dark:text-gray-400'>
							<span className='font-medium'>Average Monthly Spending: </span>
							{formatCurrency(
								monthlyData.reduce((sum, item) => sum + item.amount, 0) /
									monthlyData.length
							)}
						</p>

						{/* Monthly Change */}
						{monthlyData.length >= 2 && (
							<p className='text-sm text-gray-600 dark:text-gray-400'>
								<span className='font-medium'>Latest Month Change: </span>
								{(() => {
									const currentMonth =
										monthlyData[monthlyData.length - 1].amount;
									const prevMonth = monthlyData[monthlyData.length - 2].amount;
									const change = currentMonth - prevMonth;
									const percentChange = (change / prevMonth) * 100;

									const isIncrease = change > 0;
									const absChange = Math.abs(change);
									const absPercentChange = Math.abs(percentChange).toFixed(1);

									return (
										<span
											className={
												isIncrease
													? 'text-red-600 dark:text-red-400'
													: 'text-green-600 dark:text-green-400'
											}>
											{isIncrease ? '+' : '-'}
											{formatCurrency(absChange)} ({absPercentChange}%)
											{isIncrease ? ' increase' : ' decrease'}
										</span>
									);
								})()}
							</p>
						)}

						{/* Highest Spending Month */}
						<p className='text-sm text-gray-600 dark:text-gray-400'>
							<span className='font-medium'>Highest Spending: </span>
							{(() => {
								const highestMonth = monthlyData.reduce(
									(max, item) => (item.amount > max.amount ? item : max),
									monthlyData[0]
								);

								return `${highestMonth.month} (${formatCurrency(
									highestMonth.amount
								)})`;
							})()}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default SpendingTrendsChart;
