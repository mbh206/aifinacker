import React from 'react';

// Interface for EmptyState component props
interface EmptyStateProps {
	title: string;
	description: string;
	actionText?: string;
	onAction?: () => void;
	compact?: boolean;
}

/**
 * EmptyState Component
 * Renders a consistent empty state view with optional action button
 * Used when no data is available in various sections of the app
 */
const EmptyState: React.FC<EmptyStateProps> = ({
	title,
	description,
	actionText,
	onAction,
	compact = false,
}) => {
	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${
				compact
					? 'p-4'
					: 'p-8 flex flex-col items-center justify-center text-center'
			}`}>
			{!compact && (
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
			)}
			<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
				{title}
			</h2>
			<p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
				{description}
			</p>
			{actionText && onAction && (
				<button
					onClick={onAction}
					className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800'>
					{actionText}
				</button>
			)}
		</div>
	);
};

export default EmptyState;
