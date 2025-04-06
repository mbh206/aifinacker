import React from 'react';
import { Budget } from '../../types';

interface BudgetProgressBarProps {
	budget: Budget;
}

const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ budget }) => {
	const spent = budget.spent || 0;
	const percentSpent = Math.min((spent / budget.amount) * 100, 100);
	const remaining = Math.max(budget.amount - spent, 0);

	// Determine the color based on percentage spent
	const getProgressColor = () => {
		if (percentSpent >= 100) {
			return 'bg-red-500';
		} else if (percentSpent >= 75) {
			return 'bg-yellow-500';
		} else {
			return 'bg-green-500';
		}
	};

	// Determine if the budget is active or expired
	const isActive = new Date(budget.endDate) >= new Date();

	return (
		<div className='mt-2'>
			<div className='relative pt-1'>
				<div className='flex items-center justify-between'>
					<div>
						<span
							className={`text-xs font-semibold inline-block ${
								percentSpent >= 100
									? 'text-red-600 dark:text-red-400'
									: 'text-gray-600 dark:text-gray-400'
							}`}>
							{percentSpent.toFixed(0)}% Used
						</span>
					</div>
					<div className='text-right'>
						<span className='text-xs font-semibold inline-block text-gray-600 dark:text-gray-400'>
							{remaining.toFixed(2)} Remaining
						</span>
					</div>
				</div>

				{/* Progress Bar Background */}
				<div className='overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200 dark:bg-gray-700 mt-1'>
					{/* Progress Bar Indicator */}
					<div
						style={{ width: `${percentSpent}%` }}
						className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
							isActive ? getProgressColor() : 'bg-gray-400 dark:bg-gray-500'
						} transition-all duration-300`}
					/>
				</div>

				{/* Show Budget Warning/Status */}
				{isActive ? (
					percentSpent >= 90 && (
						<div className='text-xs text-right mt-1'>
							<span
								className={`font-medium ${
									percentSpent >= 100
										? 'text-red-600 dark:text-red-400'
										: 'text-yellow-600 dark:text-yellow-400'
								}`}>
								{percentSpent >= 100 ? 'Over budget' : 'Near limit'}
							</span>
						</div>
					)
				) : (
					<div className='text-xs text-right mt-1'>
						<span className='font-medium text-gray-500 dark:text-gray-400'>
							Budget period ended
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default BudgetProgressBar;
