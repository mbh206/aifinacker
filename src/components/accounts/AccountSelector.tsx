// src/components/accounts/AccountSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import { setCurrentAccount } from '../../features/accounts/accountsSlice';
import { clearExpenses } from '../../features/expenses/expensesSlice';

const AccountSelector: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const { accounts, currentAccount } = useSelector(
		(state: RootState) => state.accounts
	);
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Handle account selection
	const handleAccountSelect = (accountId: string) => {
		const selectedAccount = accounts.find(
			(account) => account.id === accountId
		);

		if (selectedAccount) {
			// Set the new current account
			dispatch(setCurrentAccount(selectedAccount));

			// Clear expenses to reload for the new account
			dispatch(clearExpenses());

			// Navigate to dashboard
			navigate('/');
		}

		// Close the dropdown
		setIsOpen(false);
	};

	// If no accounts yet, show a button to create one
	if (accounts.length === 0) {
		return (
			<div className='py-3 flex justify-center'>
				<Link
					to='/accounts/new'
					className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-5 w-5 mr-2'
						viewBox='0 0 20 20'
						fill='currentColor'>
						<path
							fillRule='evenodd'
							d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
							clipRule='evenodd'
						/>
					</svg>
					Create Account
				</Link>
			</div>
		);
	}

	return (
		<div
			className='py-3 px-3 flex items-center justify-between'
			ref={dropdownRef}>
			<div className='flex items-center'>
				{/* Account type badge */}
				{currentAccount && (
					<div className='mr-3'>
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                ${
									currentAccount.type === 'personal'
										? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
										: currentAccount.type === 'family'
										? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
										: currentAccount.type === 'team'
										? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
										: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
								}
              `}>
							{currentAccount.type}
						</span>
					</div>
				)}

				{/* Account selector dropdown */}
				<div className='relative inline-block text-left'>
					<div>
						<button
							type='button'
							className='inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
							onClick={() => setIsOpen(!isOpen)}>
							{currentAccount?.name || 'Select Account'}
							<svg
								className='-mr-1 ml-2 h-5 w-5'
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'>
								<path
									fillRule='evenodd'
									d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
									clipRule='evenodd'
								/>
							</svg>
						</button>
					</div>

					{/* Dropdown menu */}
					{isOpen && (
						<div className='origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 dark:bg-gray-800 dark:ring-gray-700'>
							<div
								className='py-1'
								role='menu'
								aria-orientation='vertical'
								aria-labelledby='options-menu'>
								{accounts.map((account) => (
									<button
										key={account.id}
										onClick={() => handleAccountSelect(account.id)}
										className={`w-full text-left block px-4 py-2 text-sm ${
											currentAccount?.id === account.id
												? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
												: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700'
										}`}
										role='menuitem'>
										<div className='flex items-center'>
											<span
												className={`inline-flex items-center justify-center h-8 w-8 rounded-full mr-3
                          ${
														account.type === 'personal'
															? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
															: account.type === 'family'
															? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
															: account.type === 'team'
															? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
															: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
													}
                        `}>
												{account.name.charAt(0).toUpperCase()}
											</span>
											<div>
												<div className='font-medium'>{account.name}</div>
												<div className='text-xs text-gray-500 dark:text-gray-400 capitalize'>
													{account.type} • {account.baseCurrency}
												</div>
											</div>
										</div>
									</button>
								))}
								<div className='border-t border-gray-100 dark:border-gray-700 mt-1 pt-1'>
									<Link
										to='/accounts/new'
										className='block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 dark:text-blue-400 dark:hover:bg-gray-700'
										role='menuitem'
										onClick={() => setIsOpen(false)}>
										<div className='flex items-center'>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-5 w-5 mr-2'
												viewBox='0 0 20 20'
												fill='currentColor'>
												<path
													fillRule='evenodd'
													d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
													clipRule='evenodd'
												/>
											</svg>
											Create New Account
										</div>
									</Link>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Account settings button */}
			{currentAccount && (
				<Link
					to={`/accounts/${currentAccount.id}`}
					className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-5 w-5'
						viewBox='0 0 20 20'
						fill='currentColor'>
						<path
							fillRule='evenodd'
							d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z'
							clipRule='evenodd'
						/>
					</svg>
				</Link>
			)}
		</div>
	);
};

export default AccountSelector;
