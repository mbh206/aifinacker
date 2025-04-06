import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
						Financial Tracker
					</h2>
					<p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
						Manage your finances with ease
					</p>
				</div>
				<Outlet />
			</div>
		</div>
	);
};

export default AuthLayout;
