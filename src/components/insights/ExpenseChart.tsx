import React, { useState } from 'react';
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
} from 'recharts';
import { Expense } from '../../types';

interface ExpenseChartProps {
	expenses: Expense[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
	const [chartType, setChartType] = useState<'category' | 'monthly'>(
		'category'
	);

	// Process data for category breakdown
	const getCategoryData = () => {
		// Group expenses by category
		const categoryMap: Record<string, number> = {};

		expenses.forEach((expense) => {
			categoryMap[expense.category] =
				(categoryMap[expense.category] || 0) + expense.amount;
		});

		// Convert to array and sort by amount (descending)
		const categoryData = Object.entries(categoryMap)
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value);

		// Take top 7 categories and group the rest as "Other"
		if (categoryData.length > 7) {
			const topCategories = categoryData.slice(0, 6);
			const otherValue = categoryData
				.slice(6)
				.reduce((sum, item) => sum + item.value, 0);

			return [...topCategories, { name: 'Other', value: otherValue }];
		}

		return categoryData;
	};

	// Process data for monthly breakdown
	const getMonthlyData = () => {
		// Group expenses by month
		const monthMap: Record<string, number> = {};

		expenses.forEach((expense) => {
			const date = new Date(expense.date);
			const monthKey = `${date.getFullYear()}-${String(
				date.getMonth() + 1
			).padStart(2, '0')}`;
			const monthLabel = date.toLocaleDateString('en-US', {
				month: 'short',
				year: 'numeric',
			});

			if (!monthMap[monthKey]) {
				monthMap[monthKey] = {
					monthKey,
					monthLabel,
					amount: 0,
				};
			}

			monthMap[monthKey].amount += expense.amount;
		});

		// Convert to array and sort by date
		return Object.values(monthMap).sort((a, b) =>
			a.monthKey.localeCompare(b.monthKey)
		);
	};

	const categoryData = getCategoryData();
	const monthlyData = getMonthlyData();

	// Define colors for pie chart
	const COLORS = [
		'#4299E1', // blue-500
		'#48BB78', // green-500
		'#F6AD55', // orange-400
		'#9F7AEA', // purple-500
		'#F56565', // red-500
		'#38B2AC', // teal-500
		'#ED8936', // orange-500
		'#667EEA', // indigo-500
	];

	// Custom tooltip for pie chart
	const PieTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className='bg-white dark:bg-gray-800 p-2 shadow rounded border border-gray-200 dark:border-gray-700'>
					<p className='font-medium'>{data.name}</p>
					<p className='text-sm'>
						<span className='font-medium'>
							{new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD',
							}).format(data.value)}
						</span>{' '}
						(
						{(
							(data.value /
								categoryData.reduce((sum, item) => sum + item.value, 0)) *
							100
						).toFixed(1)}
						%)
					</p>
				</div>
			);
		}
		return null;
	};

	// Custom tooltip for bar chart
	const BarTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className='bg-white dark:bg-gray-800 p-2 shadow rounded border border-gray-200 dark:border-gray-700'>
					<p className='font-medium'>{data.monthLabel}</p>
					<p className='text-sm font-medium'>
						{new Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: 'USD',
						}).format(data.amount)}
					</p>
				</div>
			);
		}
		return null;
	};

	// Format tick labels on the Y axis of bar chart
	const formatYAxisTick = (value: number) => {
		if (value >= 1000) {
			return `$${value / 1000}k`;
		}
		return `$${value}`;
	};

	return (
		<div>
			{/* Chart Type Toggle */}
			<div className='flex justify-center mb-4'>
				<div className='inline-flex rounded-md shadow-sm'>
					<button
						onClick={() => setChartType('category')}
						className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
							chartType === 'category'
								? 'bg-blue-600 text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
						}`}>
						By Category
					</button>
					<button
						onClick={() => setChartType('monthly')}
						className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
							chartType === 'monthly'
								? 'bg-blue-600 text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
						}`}>
						By Month
					</button>
				</div>
			</div>

			{/* Chart Display */}
			<div className='h-80'>
				{chartType === 'category' ? (
					// Category Pie Chart
					<ResponsiveContainer
						width='100%'
						height='100%'>
						<PieChart>
							<Pie
								data={categoryData}
								cx='50%'
								cy='50%'
								labelLine={false}
								outerRadius={80}
								innerRadius={40}
								dataKey='value'>
								{categoryData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip content={<PieTooltip />} />
							<Legend
								layout='vertical'
								verticalAlign='middle'
								align='right'
							/>
						</PieChart>
					</ResponsiveContainer>
				) : (
					// Monthly Bar Chart
					<ResponsiveContainer
						width='100%'
						height='100%'>
						<BarChart
							data={monthlyData}
							margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
							<CartesianGrid
								strokeDasharray='3 3'
								vertical={false}
							/>
							<XAxis
								dataKey='monthLabel'
								tick={{ fontSize: 12 }}
								interval={0}
								angle={-45}
								textAnchor='end'
								height={50}
							/>
							<YAxis tickFormatter={formatYAxisTick} />
							<Tooltip content={<BarTooltip />} />
							<Bar
								dataKey='amount'
								fill='#4299E1'
								name='Expenses'
							/>
						</BarChart>
					</ResponsiveContainer>
				)}
			</div>

			{/* Summary Stats */}
			<div className='mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4'>
				<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3'>
					<p className='text-sm text-gray-500 dark:text-gray-400'>
						Total Expenses
					</p>
					<p className='text-lg font-semibold mt-1'>
						{new Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: 'USD',
						}).format(
							expenses.reduce((sum, expense) => sum + expense.amount, 0)
						)}
					</p>
				</div>
				<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3'>
					<p className='text-sm text-gray-500 dark:text-gray-400'>
						Top Category
					</p>
					<p className='text-lg font-semibold mt-1'>
						{categoryData.length > 0 ? categoryData[0].name : 'N/A'}
					</p>
				</div>
				<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3'>
					<p className='text-sm text-gray-500 dark:text-gray-400'>Categories</p>
					<p className='text-lg font-semibold mt-1'>
						{new Set(expenses.map((expense) => expense.category)).size}
					</p>
				</div>
				<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3'>
					<p className='text-sm text-gray-500 dark:text-gray-400'>Time Span</p>
					<p className='text-lg font-semibold mt-1'>
						{monthlyData.length} {monthlyData.length === 1 ? 'month' : 'months'}
					</p>
				</div>
			</div>
		</div>
	);
};

export default ExpenseChart;
