// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Footer: React.FC = () => {
	const { isMobile } = useSelector((state: RootState) => state.ui);

	// Don't show footer on mobile as we have the bottom nav bar
	if (isMobile) {
		return null;
	}

	return (
		<footer className='bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700'>
			<div className='max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between'>
					<div className='text-sm text-gray-500 dark:text-gray-400'>
						<span>
							© {new Date().getFullYear()} FinanceTracker. All rights reserved.
						</span>
					</div>

					<div className='flex space-x-4 text-sm text-gray-500 dark:text-gray-400'>
						<Link
							to='/privacy'
							className='hover:text-gray-700 dark:hover:text-gray-300'>
							Privacy Policy
						</Link>
						<Link
							to='/terms'
							className='hover:text-gray-700 dark:hover:text-gray-300'>
							Terms of Service
						</Link>
						<Link
							to='/help'
							className='hover:text-gray-700 dark:hover:text-gray-300'>
							Help
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
