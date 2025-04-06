// src/components/expenses/ExpenseCard.tsx
import React from 'react';
import { format } from 'date-fns';
import { Expense } from '../../types';

interface ExpenseCardProps {
	expense: Expense;
	onClick?: () => void;
	compact?: boolean;
	showReceipt?: boolean;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
	expense,
	onClick,
	compact = false,
	showReceipt = false,
}) => {
	// Format date
	const formatDate = (dateString: string | Date): string => {
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

	// Format currency
	const formatCurrency = (amount: number, currency: string = 'USD'): string => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
		}).format(amount);
	};

	// Get category color class
	const getCategoryColorClass = (category: string): string => {
		const categoryColorMap: Record<string, string> = {
			'Food & Drink':
				'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
			Shopping:
				'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
			Housing:
				'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
			Transportation:
				'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
			Entertainment:
				'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
			Health: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
			Travel:
				'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
			Education:
				'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
			Personal: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
			Other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
		};

		return (
			categoryColorMap[category] ||
			'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
		);
	};

	// Get category icon
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

	// Compact version of the card (for dashboards, sidebar lists, etc.)
	if (compact) {
		return (
			<div
				className='flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors duration-150'
				onClick={onClick}>
				<div className='flex items-center'>
					<div
						className={`flex-shrink-0 rounded-full p-2 ${getCategoryColorClass(
							expense.category
						)}`}>
						{getCategoryIcon(expense.category)}
					</div>
					<div className='ml-3'>
						<p className='text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]'>
							{expense.description}
						</p>
						<p className='text-xs text-gray-500 dark:text-gray-400'>
							{formatDate(expense.date)}
						</p>
					</div>
				</div>
				<span className='text-sm font-medium text-gray-900 dark:text-white'>
					{formatCurrency(expense.amount)}
				</span>
			</div>
		);
	}

	// Full card version
	return (
		<div
			className='bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer'
			onClick={onClick}>
			<div className='p-4'>
				<div className='flex justify-between items-start'>
					<div className='flex items-center'>
						<div
							className={`flex-shrink-0 rounded-full p-2 ${getCategoryColorClass(
								expense.category
							)}`}>
							{getCategoryIcon(expense.category)}
						</div>
						<div className='ml-3'>
							<h3 className='text-base font-medium text-gray-900 dark:text-white'>
								{expense.description}
							</h3>
							<div className='flex items-center mt-1'>
								<span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
									{formatDate(expense.date)}
								</span>
								<span className='mx-2 text-gray-300 dark:text-gray-600'>•</span>
								<span
									className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColorClass(
										expense.category
									)}`}>
									{expense.category}
								</span>
							</div>
						</div>
					</div>
					<span className='text-lg font-semibold text-gray-900 dark:text-white'>
						{formatCurrency(expense.amount)}
					</span>
				</div>

				{showReceipt && expense.receiptUrl && (
					<div className='mt-4 border-t border-gray-200 dark:border-gray-700 pt-3'>
						<div className='flex items-center text-sm text-blue-600 dark:text-blue-400'>
							<svg
								className='h-4 w-4 mr-1'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 7v5m4 8l-4-4m0 0l-4 4m4-4V7'
								/>
							</svg>
							<span>Receipt attached</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ExpenseCard;
