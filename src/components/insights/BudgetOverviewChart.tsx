// src/components/insights/BudgetOverviewChart.tsx
import React, { useState } from 'react';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell,
} from 'recharts';
import { Budget } from '../../types';

interface BudgetOverviewChartProps {
	budgets: Budget[];
}

const BudgetOverviewChart: React.FC<BudgetOverviewChartProps> = ({
	budgets,
}) => {
	const [showAll, setShowAll] = useState(false);

	// Prepare data for chart
	const processData = () => {
		// Filter active budgets (end date is in the future)
		const activeBudgets = budgets.filter(
			(budget) => new Date(budget.endDate) >= new Date()
		);

		// Sort budgets by percentage used
		const sortedBudgets = [...activeBudgets].sort((a, b) => {
			const percentA = ((a.spent || 0) / a.amount) * 100;
			const percentB = ((b.spent || 0) / b.amount) * 100;
			return percentB - percentA; // Descending order
		});

		// Take only top 5 budgets if not showing all
		const displayBudgets = showAll ? sortedBudgets : sortedBudgets.slice(0, 5);

		// Format data for chart
		return displayBudgets.map((budget) => {
			const spent = budget.spent || 0;
			const remaining = Math.max(budget.amount - spent, 0);
			const percentUsed = (spent / budget.amount) * 100;

			return {
				name: budget.name,
				category:
					budget.category === 'All' ? 'All Categories' : budget.category,
				spent,
				remaining,
				amount: budget.amount,
				percentUsed: Math.min(percentUsed, 100), // Cap at 100% for display
				isOverBudget: percentUsed > 100,
			};
		});
	};

	const chartData = processData();

	// Custom tooltip to show detailed information
	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;

			return (
				<div className='bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow'>
					<p className='font-semibold'>{data.name}</p>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						{data.category}
					</p>
					<div className='mt-2'>
						<p className='text-sm'>
							<span className='font-medium'>Budget: </span>
							{formatCurrency(data.amount)}
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Spent: </span>
							{formatCurrency(data.spent)}{' '}
							<span
								className={`${
									data.isOverBudget ? 'text-red-600 dark:text-red-400' : ''
								}`}>
								({data.percentUsed.toFixed(0)}%)
							</span>
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Remaining: </span>
							{formatCurrency(data.remaining)}
						</p>
					</div>
				</div>
			);
		}
		return null;
	};

	// Format currency numbers
	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD', // Ideally this would come from the account's base currency
			maximumFractionDigits: 0,
		}).format(amount);
	};

	// Format axis ticks to show percentages
	const formatYAxisTick = (value: number) => `${value}%`;

	// Get color based on budget usage percentage
	const getBarColor = (percentUsed: number): string => {
		if (percentUsed >= 100) return '#EF4444'; // red-500
		if (percentUsed >= 85) return '#F59E0B'; // amber-500
		return '#10B981'; // emerald-500
	};

	if (chartData.length === 0) {
		return (
			<div className='flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg'>
				<p className='text-gray-500 dark:text-gray-400'>
					No active budgets to display
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className='flex justify-between items-center mb-4'>
				<h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
					{showAll ? 'All Active Budgets' : 'Top 5 Budgets by Usage'}
				</h3>
				<button
					onClick={() => setShowAll(!showAll)}
					className='text-sm text-blue-600 dark:text-blue-400 hover:underline'>
					{showAll ? 'Show Top 5' : 'Show All'}
				</button>
			</div>

			<div className='h-80'>
				<ResponsiveContainer
					width='100%'
					height='100%'>
					<BarChart
						data={chartData}
						layout='vertical'
						margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
						<CartesianGrid
							strokeDasharray='3 3'
							horizontal={true}
							vertical={false}
						/>
						<XAxis
							type='number'
							domain={[0, 100]}
							tickFormatter={formatYAxisTick}
						/>
						<YAxis
							type='category'
							dataKey='name'
							width={120}
							tick={{ fontSize: 12 }}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend />
						<Bar
							dataKey='percentUsed'
							name='Budget Used (%)'
							radius={[0, 4, 4, 0]}>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={getBarColor(entry.percentUsed)}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Budget Summary Stats */}
			<div className='mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4'>
				<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3'>
					<p className='text-xs text-gray-500 dark:text-gray-400'>
						Total Budgeted
					</p>
					<p className='text-lg font-semibold mt-1'>
						{formatCurrency(
							budgets.reduce((sum, budget) => sum + budget.amount, 0)
						)}
					</p>
				</div>
				<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3'>
					<p className='text-xs text-gray-500 dark:text-gray-400'>
						Total Spent
					</p>
					<p className='text-lg font-semibold mt-1'>
						{formatCurrency(
							budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0)
						)}
					</p>
				</div>
				<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3'>
					<p className='text-xs text-gray-500 dark:text-gray-400'>
						Active Budgets
					</p>
					<p className='text-lg font-semibold mt-1'>
						{
							budgets.filter((budget) => new Date(budget.endDate) >= new Date())
								.length
						}
					</p>
				</div>
				<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3'>
					<p className='text-xs text-gray-500 dark:text-gray-400'>
						Over Budget
					</p>
					<p className='text-lg font-semibold mt-1 text-red-600 dark:text-red-400'>
						{
							budgets.filter((budget) => (budget.spent || 0) > budget.amount)
								.length
						}
					</p>
				</div>
			</div>
		</div>
	);
};

export default BudgetOverviewChart;
