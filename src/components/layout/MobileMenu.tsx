import React, { Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { setMobileMenuOpen } from '../../store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '../../store';

const navigation = [
	{
		name: 'Dashboard',
		href: '/dashboard',
		icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
	},
	{
		name: 'Expenses',
		href: '/expenses',
		icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
	},
	{
		name: 'Budgets',
		href: '/budgets',
		icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
	},
	{
		name: 'Insights',
		href: '/insights',
		icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
	},
	{
		name: 'Accounts',
		href: '/accounts',
		icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
	},
	{
		name: 'Settings',
		href: '/settings',
		icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
	},
	{
		name: 'Help',
		href: '/help',
		icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
	},
];

const MobileMenu: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { mobileMenuOpen } = useAppSelector((state) => state.ui);
	const { currentAccount } = useAppSelector((state) => state.accounts);

	const closeMobileMenu = () => {
		dispatch(setMobileMenuOpen(false));
	};

	return (
		<Transition.Root
			show={mobileMenuOpen}
			as={Fragment}>
			<Dialog
				as='div'
				static
				className='fixed inset-0 flex z-40 md:hidden'
				open={mobileMenuOpen}
				onClose={closeMobileMenu}>
				<Transition.Child
					as={Fragment}
					enter='transition-opacity ease-linear duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='transition-opacity ease-linear duration-300'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'>
					<Dialog.Overlay className='fixed inset-0 bg-gray-600 bg-opacity-75' />
				</Transition.Child>

				<Transition.Child
					as={Fragment}
					enter='transition ease-in-out duration-300 transform'
					enterFrom='-translate-x-full'
					enterTo='translate-x-0'
					leave='transition ease-in-out duration-300 transform'
					leaveFrom='translate-x-0'
					leaveTo='-translate-x-full'>
					<div className='relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800'>
						<Transition.Child
							as={Fragment}
							enter='ease-in-out duration-300'
							enterFrom='opacity-0'
							enterTo='opacity-100'
							leave='ease-in-out duration-300'
							leaveFrom='opacity-100'
							leaveTo='opacity-0'>
							<div className='absolute top-0 right-0 -mr-12 pt-2'>
								<button
									type='button'
									className='ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
									onClick={closeMobileMenu}>
									<span className='sr-only'>Close sidebar</span>
									<svg
										className='h-6 w-6 text-white'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								</button>
							</div>
						</Transition.Child>

						<div className='flex-1 h-0 pt-5 pb-4 overflow-y-auto'>
							<div className='flex-shrink-0 flex items-center px-4'>
								<div className='flex items-center space-x-2'>
									<div className='relative h-8 w-8'>
										<Image
											src='/images/logo.svg'
											alt='Financial Tracker Logo'
											layout='fill'
										/>
									</div>
									<span className='text-lg font-semibold text-gray-900 dark:text-white'>
										Financial Tracker
									</span>
								</div>
							</div>

							{currentAccount && (
								<div className='mt-4 px-4'>
									<div className='bg-primary-50 dark:bg-gray-700 p-3 rounded-md'>
										<h3 className='text-sm font-medium text-primary-800 dark:text-primary-200'>
											Current Account
										</h3>
										<p className='text-sm text-primary-600 dark:text-primary-300 mt-1 truncate'>
											{currentAccount.name}
										</p>
									</div>
								</div>
							)}

							<nav className='mt-5 px-2 space-y-1'>
								{navigation.map((item) => {
									const isActive = router.pathname.startsWith(item.href);
									return (
										<Link
											key={item.name}
											href={item.href}
											className={`
                        group flex items-center px-2 py-2 text-base font-medium rounded-md
                        ${
													isActive
														? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
														: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
												}
                      `}
											onClick={closeMobileMenu}>
											<svg
												className={`mr-4 flex-shrink-0 h-6 w-6 ${
													isActive
														? 'text-primary-600 dark:text-primary-400'
														: 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
												}`}
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth='2'
													d={item.icon}
												/>
											</svg>
											{item.name}
										</Link>
									);
								})}
							</nav>
						</div>

						<div className='flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4'>
							<div className='flex-shrink-0 group block'>
								<div className='flex items-center'>
									<div>
										<div className='h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 dark:bg-primary-700 dark:text-primary-200 text-lg font-semibold'>
											{/* Display first letter of user name */}
											{useAppSelector(
												(state) =>
													state.auth.user?.displayName?.charAt(0) || 'U'
											)}
										</div>
									</div>
									<div className='ml-3'>
										<p className='text-base font-medium text-gray-700 dark:text-white'>
											{useAppSelector(
												(state) => state.auth.user?.displayName || 'User'
											)}
										</p>
										<p className='text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'>
											View profile
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Transition.Child>

				<div
					className='flex-shrink-0 w-14'
					aria-hidden='true'>
					{/* Force sidebar to shrink to fit close icon */}
				</div>
			</Dialog>
		</Transition.Root>
	);
};

export default MobileMenu;
