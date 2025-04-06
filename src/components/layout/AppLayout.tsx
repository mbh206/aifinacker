import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
	selectCurrentAccount,
	selectAccounts,
} from '../../store/slices/accountsSlice';
import { selectUser, logout } from '../../store/slices/authSlice';
import {
	toggleSidebar,
	selectIsSidebarOpen,
	toggleDarkMode,
	selectIsDarkMode,
} from '../../store/slices/uiSlice';

// Components
import AccountSwitcher from '../accounts/AccountSwitcher';
import LoadingScreen from '../common/LoadingScreen';

const AppLayout = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const currentUser = useSelector(selectUser);
	const currentAccount = useSelector(selectCurrentAccount);
	const accounts = useSelector(selectAccounts);
	const isSidebarOpen = useSelector(selectIsSidebarOpen);
	const isDarkMode = useSelector(selectIsDarkMode);

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);

	// Close sidebar on mobile when location changes
	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, [location]);

	// Handle logout
	const handleLogout = () => {
		dispatch(logout());
	};

	// Handle dark mode toggle
	const handleToggleDarkMode = () => {
		dispatch(toggleDarkMode());
	};

	// Show loading screen while accounts are being loaded
	if (!accounts) {
		return <LoadingScreen />;
	}

	return (
		<div className='min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200'>
			{/* Mobile Header */}
			<div className='lg:hidden'>
				<div className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
					<div className='px-4 h-16 flex items-center justify-between'>
						<div className='flex items-center'>
							<button
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								className='text-gray-500 dark:text-gray-400 focus:outline-none'>
								<svg
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

							<div className='ml-4'>
								<h1 className='text-lg font-bold text-gray-900 dark:text-white'>
									Finance Tracker
								</h1>
							</div>
						</div>

						<div className='flex items-center'>
							{/* Account Switcher */}
							<div className='relative mr-4'>
								<button
									onClick={() =>
										setIsAccountSwitcherOpen(!isAccountSwitcherOpen)
									}
									className='flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none'>
									<span className='mr-1'>
										{currentAccount?.name || 'Select Account'}
									</span>
									<svg
										className='h-5 w-5'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M19 9l-7 7-7-7'
										/>
									</svg>
								</button>

								{isAccountSwitcherOpen && (
									<AccountSwitcher
										onClose={() => setIsAccountSwitcherOpen(false)}
									/>
								)}
							</div>

							{/* Profile Dropdown */}
							<div className='relative'>
								<button
									onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
									className='flex items-center focus:outline-none'>
									<div className='h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center'>
										{currentUser?.displayName ? (
											<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
												{currentUser.displayName.charAt(0)}
											</span>
										) : (
											<svg
												className='h-5 w-5 text-gray-500 dark:text-gray-400'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
												/>
											</svg>
										)}
									</div>
								</button>

								{isProfileMenuOpen && (
									<div className='absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 border border-gray-200 dark:border-gray-700'>
										<div className='px-4 py-2 border-b border-gray-200 dark:border-gray-700'>
											<p className='text-sm font-medium text-gray-900 dark:text-white'>
												{currentUser?.displayName || 'User'}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
												{currentUser?.email}
											</p>
										</div>
										<Link
											to='/profile'
											className='block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
											onClick={() => setIsProfileMenuOpen(false)}>
											Your Profile
										</Link>
										<Link
											to='/settings'
											className='block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
											onClick={() => setIsProfileMenuOpen(false)}>
											Settings
										</Link>
										<button
											onClick={handleToggleDarkMode}
											className='block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'>
											{isDarkMode ? 'Light Mode' : 'Dark Mode'}
										</button>
										<button
											onClick={handleLogout}
											className='block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'>
											Sign out
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className='flex'>
				{/* Sidebar for desktop */}
				<aside
					className={`fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 shadow transform ${
						isSidebarOpen
							? 'translate-x-0'
							: '-translate-x-full lg:translate-x-0'
					} transition-transform duration-300 lg:relative lg:translate-x-0`}>
					<div className='h-full flex flex-col'>
						{/* Sidebar Header */}
						<div className='h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700'>
							<h1 className='text-lg font-bold text-gray-900 dark:text-white'>
								Finance Tracker
							</h1>
							<button
								onClick={() => dispatch(toggleSidebar())}
								className='lg:hidden text-gray-500 dark:text-gray-400 focus:outline-none'>
								<svg
									className='h-6 w-6'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>

						{/* Account Selector */}
						<div className='px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
							<p className='text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-1'>
								Current Account
							</p>
							<button
								onClick={() => setIsAccountSwitcherOpen(!isAccountSwitcherOpen)}
								className='w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none'>
								<span className='truncate'>
									{currentAccount?.name || 'Select Account'}
								</span>
								<svg
									className='h-5 w-5'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M19 9l-7 7-7-7'
									/>
								</svg>
							</button>

							{isAccountSwitcherOpen && (
								<div className='mt-2'>
									<AccountSwitcher
										onClose={() => setIsAccountSwitcherOpen(false)}
									/>
								</div>
							)}
						</div>

						{/* Navigation Links */}
						<nav className='flex-1 overflow-y-auto py-4'>
							<div className='px-2 space-y-1'>
								<NavLink
									to='/'
									icon='home'
									label='Dashboard'
								/>
								<NavLink
									to='/expenses'
									icon='dollar'
									label='Expenses'
								/>
								<NavLink
									to='/budgets'
									icon='chart-pie'
									label='Budgets'
								/>
								<NavLink
									to='/insights'
									icon='chart-bar'
									label='Insights'
								/>
								<NavLink
									to='/accounts'
									icon='user-group'
									label='Accounts'
								/>
								<NavLink
									to='/settings'
									icon='cog'
									label='Settings'
								/>
							</div>
						</nav>

						{/* User Profile */}
						<div className='border-t border-gray-200 dark:border-gray-700 p-4'>
							<div className='flex items-center'>
								<div className='flex-shrink-0'>
									<div className='h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center'>
										{currentUser?.displayName ? (
											<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
												{currentUser.displayName.charAt(0)}
											</span>
										) : (
											<svg
												className='h-6 w-6 text-gray-500 dark:text-gray-400'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
												/>
											</svg>
										)}
									</div>
								</div>
								<div className='ml-3'>
									<p className='text-sm font-medium text-gray-900 dark:text-white'>
										{currentUser?.displayName || 'User'}
									</p>
									<p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
										{currentUser?.email}
									</p>
								</div>
							</div>
							<div className='mt-3 space-y-1'>
								<button
									onClick={handleToggleDarkMode}
									className='flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full'>
									{isDarkMode ? (
										<svg
											className='mr-3 h-5 w-5 text-gray-500 dark:text-gray-400'
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
											className='mr-3 h-5 w-5 text-gray-500 dark:text-gray-400'
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
									{isDarkMode ? 'Light Mode' : 'Dark Mode'}
								</button>
								<button
									onClick={handleLogout}
									className='flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full'>
									<svg
										className='mr-3 h-5 w-5 text-gray-500 dark:text-gray-400'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
										/>
									</svg>
									Sign out
								</button>
							</div>
						</div>
					</div>
				</aside>

				{/* Mobile Navigation */}
				{isMobileMenuOpen && (
					<div
						className='fixed inset-0 z-40 lg:hidden'
						onClick={() => setIsMobileMenuOpen(false)}>
						<div className='fixed inset-0 bg-gray-600 bg-opacity-75'></div>
						<div className='fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 z-50'>
							{/* Content same as sidebar, but for mobile */}
							{/* This is a simplified version; you would typically have the same content as the desktop sidebar */}
							<div className='h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700'>
								<h1 className='text-lg font-bold text-gray-900 dark:text-white'>
									Finance Tracker
								</h1>
								<button
									onClick={() => setIsMobileMenuOpen(false)}
									className='text-gray-500 dark:text-gray-400 focus:outline-none'>
									<svg
										className='h-6 w-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								</button>
							</div>
							<nav className='mt-4 px-2'>
								<div className='space-y-1'>
									<NavLink
										to='/'
										icon='home'
										label='Dashboard'
									/>
									<NavLink
										to='/expenses'
										icon='dollar'
										label='Expenses'
									/>
									<NavLink
										to='/budgets'
										icon='chart-pie'
										label='Budgets'
									/>
									<NavLink
										to='/insights'
										icon='chart-bar'
										label='Insights'
									/>
									<NavLink
										to='/accounts'
										icon='user-group'
										label='Accounts'
									/>
									<NavLink
										to='/settings'
										icon='cog'
										label='Settings'
									/>
								</div>
							</nav>
						</div>
					</div>
				)}

				{/* Main Content */}
				<main className='flex-1 overflow-y-auto'>
					{/* Desktop Header */}
					<header className='hidden lg:block bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
						<div className='px-6 h-16 flex items-center justify-between'>
							<button
								onClick={() => dispatch(toggleSidebar())}
								className='text-gray-500 dark:text-gray-400 focus:outline-none'>
								<svg
									className='h-6 w-6'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4 6h16M4 12h16M4 18h7'
									/>
								</svg>
							</button>

							<div className='flex items-center'>
								{/* Dark Mode Toggle */}
								<button
									onClick={handleToggleDarkMode}
									className='ml-4 flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none'>
									{isDarkMode ? (
										<svg
											className='h-6 w-6 text-gray-500 dark:text-gray-400'
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
											className='h-6 w-6 text-gray-500 dark:text-gray-400'
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

								{/* Profile Dropdown */}
								<div className='relative ml-4'>
									<button
										onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
										className='flex items-center focus:outline-none'>
										<div className='h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center'>
											{currentUser?.displayName ? (
												<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
													{currentUser.displayName.charAt(0)}
												</span>
											) : (
												<svg
													className='h-6 w-6 text-gray-500 dark:text-gray-400'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
													/>
												</svg>
											)}
										</div>
									</button>

									{isProfileMenuOpen && (
										<div className='absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 border border-gray-200 dark:border-gray-700'>
											<div className='px-4 py-2 border-b border-gray-200 dark:border-gray-700'>
												<p className='text-sm font-medium text-gray-900 dark:text-white'>
													{currentUser?.displayName || 'User'}
												</p>
												<p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
													{currentUser?.email}
												</p>
											</div>
											<Link
												to='/profile'
												className='block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
												onClick={() => setIsProfileMenuOpen(false)}>
												Your Profile
											</Link>
											<Link
												to='/settings'
												className='block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
												onClick={() => setIsProfileMenuOpen(false)}>
												Settings
											</Link>
											<button
												onClick={handleLogout}
												className='block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'>
												Sign out
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					</header>

					<div className='py-6'>
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
};

// Navigation Link Component
interface NavLinkProps {
	to: string;
	icon: string;
	label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label }) => {
	const location = useLocation();
	const isActive =
		location.pathname === to ||
		(to !== '/' && location.pathname.startsWith(to));

	const getIcon = () => {
		switch (icon) {
			case 'home':
				return (
					<svg
						className='h-5 w-5'
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
				);
			case 'dollar':
				return (
					<svg
						className='h-5 w-5'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
						/>
					</svg>
				);
			case 'chart-pie':
				return (
					<svg
						className='h-5 w-5'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z'
						/>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z'
						/>
					</svg>
				);
			case 'chart-bar':
				return (
					<svg
						className='h-5 w-5'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
						/>
					</svg>
				);
			case 'user-group':
				return (
					<svg
						className='h-5 w-5'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857'
						/>
					</svg>
				);
			case 'cog':
				return (
					<svg
						className='h-5 w-5'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
						/>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
						/>
					</svg>
				);
			default:
				return (
					<svg
						className='h-5 w-5'
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
				);
		}
	};

	return (
		<Link
			to={to}
			className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors duration-200 ${
				isActive
					? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
					: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
			}`}>
			<span
				className={`mr-3 ${
					isActive
						? 'text-blue-600 dark:text-blue-400'
						: 'text-gray-500 dark:text-gray-400'
				}`}>
				{getIcon()}
			</span>
			{label}
		</Link>
	);
};

export default AppLayout;
