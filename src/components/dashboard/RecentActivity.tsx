// src/components/dashboard/RecentActivity.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Expense } from '../../types';

interface RecentActivityProps {
	expenses: Expense[];
	baseCurrency: string;
	loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
	expenses,
	baseCurrency,
	loading = false,
}) => {
	const navigate = useNavigate();

	// Get at most 5 most recent expenses
	const recentExpenses = [...expenses]
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 5);

	// Format currency
	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: baseCurrency,
			maximumFractionDigits: 2,
		}).format(amount);
	};

	// Format date
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return 'Today';
		} else if (date.toDateString() === yesterday.toDateString()) {
			return 'Yesterday';
		} else {
			return format(date, 'MMM d, yyyy');
		}
	};

	// Get category color class
	const getCategoryColorClass = (category: string): string => {
		const categoryColorMap: Record<string, string> = {
			'Food & Drink':
				'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
			Shopping: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
			Housing:
				'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
			Transportation:
				'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
			Entertainment:
				'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
			Health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
			Travel:
				'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
			Education:
				'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
			Personal: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
			Other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
		};

		return (
			categoryColorMap[category] ||
			'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
		);
	};

	// Loading skeleton
	if (loading) {
		return (
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
				<div className='px-4 py-5 border-b border-gray-200 dark:border-gray-700'>
					<div className='flex justify-between items-center'>
						<h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-white'>
							Recent Activity
						</h3>
						<div className='animate-pulse h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded'></div>
					</div>
				</div>
				<div className='px-4 py-4'>
					{[...Array(3)].map((_, index) => (
						<div
							key={index}
							className='animate-pulse py-3'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center'>
									<div className='h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700'></div>
									<div className='ml-3'>
										<div className='h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded'></div>
										<div className='h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-2'></div>
									</div>
								</div>
								<div className='h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded'></div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Empty state
	if (expenses.length === 0) {
		return (
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
				<div className='px-4 py-5 border-b border-gray-200 dark:border-gray-700'>
					<h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-white'>
						Recent Activity
					</h3>
				</div>
				<div className='px-4 py-10 flex flex-col items-center justify-center text-center'>
					<svg
						className='h-16 w-16 text-gray-400 dark:text-gray-500 mb-4'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={1}
							d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
						/>
					</svg>
					<p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
						You don't have any expenses yet
					</p>
					<button
						onClick={() => navigate('/expenses/new')}
						className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
						Add Your First Expense
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
			<div className='px-4 py-5 border-b border-gray-200 dark:border-gray-700'>
				<div className='flex justify-between items-center'>
					<h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-white'>
						Recent Activity
					</h3>
					<button
						onClick={() => navigate('/expenses')}
						className='text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'>
						View All
					</button>
				</div>
			</div>
			<div className='px-4 divide-y divide-gray-200 dark:divide-gray-700'>
				{recentExpenses.map((expense) => (
					<div
						key={expense.id}
						className='py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750'
						onClick={() => navigate(`/expenses/${expense.id}`)}>
						<div className='flex items-center justify-between'>
							<div className='flex items-center'>
								<div className='flex-shrink-0'>
									<span
										className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${getCategoryColorClass(
											expense.category
										)}`}>
										{getCategoryIcon(expense.category)}
									</span>
								</div>
								<div className='ml-3'>
									<p className='text-sm font-medium text-gray-900 dark:text-white'>
										{expense.description}
									</p>
									<div className='flex items-center mt-1'>
										<p className='text-xs text-gray-500 dark:text-gray-400'>
											{formatDate(expense.date)}
										</p>
										<span className='mx-2 text-gray-400 dark:text-gray-600'>
											•
										</span>
										<p className='text-xs text-gray-500 dark:text-gray-400'>
											{expense.category}
										</p>
									</div>
								</div>
							</div>
							<div className='text-sm font-medium text-gray-900 dark:text-white'>
								{formatCurrency(expense.amount)}
							</div>
						</div>
					</div>
				))}
			</div>
			{recentExpenses.length > 0 && (
				<div className='px-4 py-4 border-t border-gray-200 dark:border-gray-700'>
					<button
						onClick={() => navigate('/expenses')}
						className='w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'>
						View All Expenses
					</button>
				</div>
			)}
		</div>
	);
};

// Helper function to get category icon
const getCategoryIcon = (category: string): JSX.Element => {
	switch (category) {
		case 'Food & Drink':
			return (
				<svg
					className='h-5 w-5'
					fill='currentColor'
					viewBox='0 0 20 20'>
					<path
						fillRule='evenodd'
						d='M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm1-7a1 1 0 011 1v3a1 1 0 11-2 0V5a1 1 0 011-1z'
						clipRule='evenodd'
					/>
				</svg>
			);
		case 'Shopping':
			return (
				<svg
					className='h-5 w-5'
					fill='currentColor'
					viewBox='0 0 20 20'>
					<path d='M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' />
				</svg>
			);
		case 'Housing':
			return (
				<svg
					className='h-5 w-5'
					fill='currentColor'
					viewBox='0 0 20 20'>
					<path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
				</svg>
			);
		case 'Transportation':
			return (
				<svg
					className='h-5 w-5'
					fill='currentColor'
					viewBox='0 0 20 20'>
					<path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
					<path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 00.9-.5.5.5 0 01.9 0A1 1 0 0014 17h.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1V9.414a1 1 0 00-.293-.707l-4-4A1 1 0 0016 4H3zm11 4.586V7H9v2h-.542A1 1 0 008 10v.5h3.25a.75.75 0 110 1.5H8V13h3.25a.75.75 0 110 1.5H8v.5a1 1 0 001 1h.458a2.5 2.5 0 014.9 0H15a1 1 0 001-1v-7.586l-2-2z' />
				</svg>
			);
		case 'Entertainment':
			return (
				<svg
					className='h-5 w-5'
					fill='currentColor'
					viewBox='0 0 20 20'>
					<path
						fillRule='evenodd'
						d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
						clipRule='evenodd'
					/>
				</svg>
			);
		case 'Health':
			return (
				<svg
					className='h-5 w-5'
					fill='currentColor'
					viewBox='0 0 20 20'>
					<path
						fillRule='evenodd'
						d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z'
						clipRule='evenodd'
					/>
				</svg>
			);
		case 'Travel':
			return (
				<svg
					className='h-5 w-5'
					fill='currentColor'
					viewBox='0 0 20 20'>
					<path
						fillRule='evenodd'
						d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
						clipRule='evenodd'
					/>
				</svg>
			);
		case 'Education':
			return (
				<svg
					className='h-5 w-5'
					fill='currentColor'
					viewBox='0 0 20 20'>
					<path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z' />
				</svg>
			);
		default:
			return (
				<svg
					className='h-5 w-5'
					fill='currentColor'
					viewBox='0 0 20 20'>
					<path
						fillRule='evenodd'
						d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z'
						clipRule='evenodd'
					/>
				</svg>
			);
	}
};

export default RecentActivity;
