import React from 'react';

interface InsightCardProps {
	type: 'success' | 'warning' | 'info' | 'tip';
	title: string;
	message: string;
	actionText?: string;
	onAction?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({
	type,
	title,
	message,
	actionText,
	onAction,
}) => {
	// Determine style based on insight type
	const getTypeStyles = () => {
		switch (type) {
			case 'success':
				return {
					icon: (
						<svg
							className='h-5 w-5 text-green-500'
							fill='currentColor'
							viewBox='0 0 20 20'>
							<path
								fillRule='evenodd'
								d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
								clipRule='evenodd'
							/>
						</svg>
					),
					bgColor: 'bg-green-50 dark:bg-green-900/20',
					borderColor: 'border-green-200 dark:border-green-800',
					textColor: 'text-green-800 dark:text-green-200',
					buttonClass:
						'text-green-600 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-800/30 dark:hover:bg-green-700/40',
				};
			case 'warning':
				return {
					icon: (
						<svg
							className='h-5 w-5 text-yellow-500'
							fill='currentColor'
							viewBox='0 0 20 20'>
							<path
								fillRule='evenodd'
								d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
								clipRule='evenodd'
							/>
						</svg>
					),
					bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
					borderColor: 'border-yellow-200 dark:border-yellow-800',
					textColor: 'text-yellow-800 dark:text-yellow-200',
					buttonClass:
						'text-yellow-600 bg-yellow-100 hover:bg-yellow-200 dark:text-yellow-300 dark:bg-yellow-800/30 dark:hover:bg-yellow-700/40',
				};
			case 'info':
				return {
					icon: (
						<svg
							className='h-5 w-5 text-blue-500'
							fill='currentColor'
							viewBox='0 0 20 20'>
							<path
								fillRule='evenodd'
								d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
								clipRule='evenodd'
							/>
						</svg>
					),
					bgColor: 'bg-blue-50 dark:bg-blue-900/20',
					borderColor: 'border-blue-200 dark:border-blue-800',
					textColor: 'text-blue-800 dark:text-blue-200',
					buttonClass:
						'text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-800/30 dark:hover:bg-blue-700/40',
				};
			case 'tip':
				return {
					icon: (
						<svg
							className='h-5 w-5 text-purple-500'
							fill='currentColor'
							viewBox='0 0 20 20'>
							<path
								fillRule='evenodd'
								d='M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z'
								clipRule='evenodd'
							/>
						</svg>
					),
					bgColor: 'bg-purple-50 dark:bg-purple-900/20',
					borderColor: 'border-purple-200 dark:border-purple-800',
					textColor: 'text-purple-800 dark:text-purple-200',
					buttonClass:
						'text-purple-600 bg-purple-100 hover:bg-purple-200 dark:text-purple-300 dark:bg-purple-800/30 dark:hover:bg-purple-700/40',
				};
			default:
				return {
					icon: (
						<svg
							className='h-5 w-5 text-gray-500'
							fill='currentColor'
							viewBox='0 0 20 20'>
							<path
								fillRule='evenodd'
								d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
								clipRule='evenodd'
							/>
						</svg>
					),
					bgColor: 'bg-gray-50 dark:bg-gray-800',
					borderColor: 'border-gray-200 dark:border-gray-700',
					textColor: 'text-gray-800 dark:text-gray-200',
					buttonClass:
						'text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600',
				};
		}
	};

	const styles = getTypeStyles();

	return (
		<div
			className={`rounded-lg border ${styles.borderColor} ${styles.bgColor} p-4`}>
			<div className='flex'>
				<div className='flex-shrink-0'>{styles.icon}</div>
				<div className='ml-3 w-full'>
					<h3 className={`text-sm font-medium ${styles.textColor}`}>{title}</h3>
					<div className='mt-2 text-sm'>
						<p className={styles.textColor}>{message}</p>
					</div>
					{actionText && onAction && (
						<div className='mt-3'>
							<button
								type='button'
								onClick={onAction}
								className={`rounded-md px-3 py-1.5 text-sm font-medium ${styles.buttonClass} transition-colors duration-200`}>
								{actionText}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default InsightCard;
