import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
	return (
		<div className='min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8 text-center'>
				<div>
					<h1 className='text-9xl font-extrabold text-blue-600 dark:text-blue-400'>
						404
					</h1>
					<h2 className='mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100'>
						Page Not Found
					</h2>
					<p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
						The page you're looking for doesn't exist or has been moved.
					</p>
				</div>
				<div className='mt-8 space-y-4'>
					<Link
						to='/'
						className='inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'>
						<svg
							className='h-5 w-5 mr-2'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
							/>
						</svg>
						Back to Dashboard
					</Link>
				</div>
				<div className='mt-6'>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						If you believe this is an error, please contact support.
					</p>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
