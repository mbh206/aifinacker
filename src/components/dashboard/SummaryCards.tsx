// src/components/dashboard/SummaryCards.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Expense, Budget } from '../../types';

interface SummaryCardsProps {
	expenses: Expense[];
	budgets: Budget[];
	accountId: string;
	baseCurrency: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
	expenses,
	budgets,
	accountId,
	baseCurrency,
}) => {
	const navigate = useNavigate();

	// Calculate total expenses for current month
	const getCurrentMonthExpenses = () => {
		const now = new Date();
		const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		return expenses
			.filter((expense) => new Date(expense.date) >= firstDayOfMonth)
			.reduce((total, expense) => total + expense.amount, 0);
	};

	// Calculate total expenses for previous month
	const getPreviousMonthExpenses = () => {
		const now = new Date();
		const firstDayOfCurrentMonth = new Date(
			now.getFullYear(),
			now.getMonth(),
			1
		);
		const firstDayOfPreviousMonth = new Date(
			now.getFullYear(),
			now.getMonth() - 1,
			1
		);

		return expenses
			.filter((expense) => {
				const expenseDate = new Date(expense.date);
				return (
					expenseDate >= firstDayOfPreviousMonth &&
					expenseDate < firstDayOfCurrentMonth
				);
			})
			.reduce((total, expense) => total + expense.amount, 0);
	};

	// Get remaining budget for the current month
	const getRemainingBudget = () => {
		// Find active budgets
		const activeBudgets = budgets.filter((budget) => {
			const endDate = new Date(budget.endDate);
			return endDate >= new Date();
		});

		// Calculate total budget amount and total spent
		const totalBudget = activeBudgets.reduce(
			(sum, budget) => sum + budget.amount,
			0
		);
		const totalSpent = activeBudgets.reduce(
			(sum, budget) => sum + (budget.spent || 0),
			0
		);

		return Math.max(totalBudget - totalSpent, 0);
	};

	// Calculate average daily spending for current month
	const getDailyAverage = () => {
		const now = new Date();
		const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const daysSoFar = Math.max(1, now.getDate()); // At least 1 to avoid division by zero

		const totalThisMonth = expenses
			.filter((expense) => new Date(expense.date) >= firstDayOfMonth)
			.reduce((total, expense) => total + expense.amount, 0);

		return totalThisMonth / daysSoFar;
	};

	// Calculate month-over-month percentage change
	const getMonthOverMonthChange = () => {
		const currentMonth = getCurrentMonthExpenses();
		const previousMonth = getPreviousMonthExpenses();

		if (previousMonth === 0) return 0;
		return ((currentMonth - previousMonth) / previousMonth) * 100;
	};

	// Format currency amounts
	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: baseCurrency,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
			{/* Current Month Spending Card */}
			<div
				className='bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-all hover:shadow-md cursor-pointer'
				onClick={() => navigate('/expenses')}>
				<h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
					This Month
				</h3>
				<p className='text-2xl font-bold text-gray-900 dark:text-white'>
					{formatCurrency(getCurrentMonthExpenses())}
				</p>
				<div className='mt-1'>
					{getMonthOverMonthChange() === 0 ? (
						<span className='text-sm text-gray-500 dark:text-gray-400'>
							No change from last month
						</span>
					) : (
						<span
							className={`text-sm flex items-center ${
								getMonthOverMonthChange() > 0
									? 'text-red-600 dark:text-red-400'
									: 'text-green-600 dark:text-green-400'
							}`}>
							{getMonthOverMonthChange() > 0 ? (
								<svg
									className='w-4 h-4 mr-1'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
									/>
								</svg>
							) : (
								<svg
									className='w-4 h-4 mr-1'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
									/>
								</svg>
							)}
							{Math.abs(getMonthOverMonthChange()).toFixed(1)}% from last month
						</span>
					)}
				</div>
			</div>

			{/* Remaining Budget Card */}
			<div
				className='bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-all hover:shadow-md cursor-pointer'
				onClick={() => navigate('/budgets')}>
				<h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
					Remaining Budget
				</h3>
				<p className='text-2xl font-bold text-gray-900 dark:text-white'>
					{formatCurrency(getRemainingBudget())}
				</p>
				<div className='mt-1'>
					<span className='text-sm text-gray-500 dark:text-gray-400'>
						{
							budgets.filter((budget) => new Date(budget.endDate) >= new Date())
								.length
						}{' '}
						active {budgets.length === 1 ? 'budget' : 'budgets'}
					</span>
				</div>
			</div>

			{/* Daily Average Card */}
			<div
				className='bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-all hover:shadow-md cursor-pointer'
				onClick={() => navigate('/insights')}>
				<h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
					Daily Average
				</h3>
				<p className='text-2xl font-bold text-gray-900 dark:text-white'>
					{formatCurrency(getDailyAverage())}
				</p>
				<div className='mt-1'>
					<span className='text-sm text-gray-500 dark:text-gray-400'>
						This month's daily spending
					</span>
				</div>
			</div>

			{/* Recent Activity Card */}
			<div
				className='bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-all hover:shadow-md cursor-pointer'
				onClick={() => navigate('/expenses')}>
				<h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
					Recent Activity
				</h3>
				<p className='text-2xl font-bold text-gray-900 dark:text-white'>
					{expenses.length > 0 ? expenses.length : 0}
				</p>
				<div className='mt-1'>
					<span className='text-sm text-gray-500 dark:text-gray-400'>
						Total transactions
					</span>
				</div>
			</div>
		</div>
	);
};

export default SummaryCards;
