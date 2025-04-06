import React from 'react';
import { Link } from 'react-router-dom';
import { Budget } from '../../types';
import BudgetProgressBar from './BudgetProgressBar';

interface BudgetSummaryProps {
	budgets: Budget[];
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ budgets }) => {
	// Filter active budgets (end date is in the future)
	const activeBudgets = budgets.filter(
		(budget) => new Date(budget.endDate) >= new Date()
	);

	// Calculate total budgeted amount
	const totalBudgeted = activeBudgets.reduce(
		(total, budget) => total + budget.amount,
		0
	);

	// Calculate total spent amount
	const totalSpent = activeBudgets.reduce(
		(total, budget) => total + (budget['spent'] || 0),
		0
	);

	// Determine number of budgets over limit
	const overBudgetCount = activeBudgets.filter(
		(budget) => (budget['spent'] || 0) > budget.amount
	).length;

	// Format currency
	const formatCurrency = (amount: number, currency: string = 'USD'): string => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	// If no active budgets, show a minimal message
	if (activeBudgets.length === 0) {
		return (
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
				<div className='flex justify-between items-center mb-4'>
					<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
						Budgets
					</h3>
					<Link
						to='/budgets/new'
						className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm'>
						Create Budget
					</Link>
				</div>
				<div className='text-center py-6'>
					<p className='text-gray-500 dark:text-gray-400 mb-4'>
						No active budgets
					</p>
					<Link
						to='/budgets/new'
						className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800'>
						Create Your First Budget
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
			<div className='flex justify-between items-center mb-4'>
				<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
					Budgets
				</h3>
				<Link
					to='/budgets'
					className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm'>
					View All
				</Link>
			</div>

			{/* Budget Summary Stats */}
			<div className='grid grid-cols-3 gap-4 mb-4'>
				<div>
					<p className='text-xs text-gray-500 dark:text-gray-400'>
						Total Budgeted
					</p>
					<p className='text-sm font-medium text-gray-900 dark:text-white'>
						{formatCurrency(totalBudgeted)}
					</p>
				</div>
				<div>
					<p className='text-xs text-gray-500 dark:text-gray-400'>
						Total Spent
					</p>
					<p className='text-sm font-medium text-gray-900 dark:text-white'>
						{formatCurrency(totalSpent)}
					</p>
				</div>
				<div>
					<p className='text-xs text-gray-500 dark:text-gray-400'>
						Over Budget
					</p>
					<p
						className={`text-sm font-medium ${
							overBudgetCount > 0
								? 'text-red-600 dark:text-red-400'
								: 'text-gray-900 dark:text-white'
						}`}>
						{overBudgetCount}
					</p>
				</div>
			</div>

			{/* Budget Progress Bars */}
			<div className='space-y-4'>
				{activeBudgets.slice(0, 3).map((budget) => (
					<div key={budget.id}>
						<div className='flex justify-between items-center mb-2'>
							<Link
								to={`/budgets/${budget.id}`}
								className='text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'>
								{budget.category === 'All' ? 'All Categories' : budget.category}
							</Link>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								{formatCurrency(budget.amount)}
							</p>
						</div>
						<BudgetProgressBar budget={budget} />
					</div>
				))}
			</div>

			{/* View More Budget Button */}
			{activeBudgets.length > 3 && (
				<div className='mt-4'>
					<Link
						to='/budgets'
						className='w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'>
						{`View ${activeBudgets.length - 3} More Budgets`}
					</Link>
				</div>
			)}
		</div>
	);
};

export default BudgetSummary;
