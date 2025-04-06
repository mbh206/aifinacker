// src/components/layout/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import { toggleSidebar, toggleDarkMode } from '../../features/ui/uiSlice';
import { logoutUser } from '../../features/auth/authSlice';
import { searchAccountExpenses } from '../../features/expenses/expensesSlice';

const Header: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { user } = useSelector((state: RootState) => state.auth);
	const { currentAccount } = useSelector((state: RootState) => state.accounts);
	const { sidebarOpen, darkMode, isMobile } = useSelector(
		(state: RootState) => state.ui
	);
	const [searchTerm, setSearchTerm] = useState('');
	const [showUserMenu, setShowUserMenu] = useState(false);
	const userMenuRef = useRef<HTMLDivElement>(null);

	// Handle clicks outside of the user menu to close it
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(event.target as Node)
			) {
				setShowUserMenu(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();

		if (!searchTerm.trim() || !currentAccount) return;

		dispatch(
			searchAccountExpenses({
				accountId: currentAccount.id,
				query: searchTerm,
			})
		);
	};

	const handleLogout = () => {
		dispatch(logoutUser());
	};

	return (
		<header className='bg-white dark:bg-gray-800 shadow-sm z-20'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between h-16'>
					<div className='flex'>
						{/* Sidebar toggle button (visible on desktop) */}
						{!isMobile && (
							<button
								onClick={() => dispatch(toggleSidebar())}
								className='px-4 text-gray-500 dark:text-gray-400 focus:outline-none'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-6 w-6'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4 6h16M4 12h16M4 18h16'
									/>
								</svg>
							</button>
						)}

						{/* Logo */}
						<div className='flex-shrink-0 flex items-center'>
							<Link
								to='/'
								className='text-xl font-bold text-blue-600 dark:text-blue-400'>
								FinanceTracker
							</Link>
						</div>
					</div>

					{/* Search (shown if we have an active account) */}
					{currentAccount && (
						<div className='flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end'>
							<div className='max-w-lg w-full lg:max-w-xs'>
								<form
									onSubmit={handleSearch}
									className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
										<svg
											className='h-5 w-5 text-gray-400'
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 20 20'
											fill='currentColor'>
											<path
												fillRule='evenodd'
												d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
												clipRule='evenodd'
											/>
										</svg>
									</div>
									<input
										type='text'
										className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
										placeholder='Search expenses...'
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</form>
							</div>
						</div>
					)}

					{/* Right side buttons */}
					<div className='flex items-center'>
						{/* Dark mode toggle */}
						<button
							onClick={() => dispatch(toggleDarkMode())}
							className='ml-3 p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none'>
							{darkMode ? (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-6 w-6'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
									/>
								</svg>
							) : (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-6 w-6'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
									/>
								</svg>
							)}
						</button>

						{/* Notifications */}
						<button className='ml-3 p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none relative'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-6 w-6'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
								/>
							</svg>
							<span className='absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500'></span>
						</button>

						{/* Profile dropdown */}
						<div
							className='ml-3 relative'
							ref={userMenuRef}>
							<div>
								<button
									onClick={() => setShowUserMenu(!showUserMenu)}
									className='flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
									{user?.photoURL ? (
										<img
											className='h-8 w-8 rounded-full'
											src={user.photoURL}
											alt='User avatar'
										/>
									) : (
										<div className='h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white'>
											{user?.displayName?.charAt(0).toUpperCase() || 'U'}
										</div>
									)}
								</button>
							</div>

							{/* Profile dropdown menu */}
							{showUserMenu && (
								<div className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50'>
									<div className='py-1'>
										<div className='px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700'>
											<p className='font-medium'>{user?.displayName}</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
												{user?.email}
											</p>
										</div>

										<Link
											to='/profile'
											className='block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
											onClick={() => setShowUserMenu(false)}>
											Your Profile
										</Link>
										<Link
											to='/settings'
											className='block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
											onClick={() => setShowUserMenu(false)}>
											Settings
										</Link>
										<button
											onClick={handleLogout}
											className='block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'>
											Sign out
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
