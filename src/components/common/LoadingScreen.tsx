// src/components/common/LoadingScreen.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const LoadingScreen: React.FC = () => {
	const { darkMode } = useSelector((state: RootState) => state.ui);

	return (
		<div
			className={`min-h-screen flex flex-col items-center justify-center ${
				darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
			}`}>
			<div className='flex flex-col items-center'>
				{/* Animated logo/spinner */}
				<div className='mb-4'>
					<svg
						className='animate-spin h-12 w-12 text-blue-600 dark:text-blue-400'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'>
						<circle
							className='opacity-25'
							cx='12'
							cy='12'
							r='10'
							stroke='currentColor'
							strokeWidth='4'></circle>
						<path
							className='opacity-75'
							fill='currentColor'
							d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
					</svg>
				</div>

				{/* Loading text */}
				<h2 className='text-xl font-semibold text-gray-700 dark:text-gray-200'>
					Loading
				</h2>
				<p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
					Please wait while we set things up
				</p>
			</div>
		</div>
	);
};

export default LoadingScreen;
