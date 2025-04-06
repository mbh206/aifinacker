import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
	selectAccounts,
	selectCurrentAccount,
	setCurrentAccount,
} from '../../slices/accountsSlice';

interface AccountSwitcherProps {
	onClose: () => void;
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({ onClose }) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const accounts = useSelector(selectAccounts);
	const currentAccount = useSelector(selectCurrentAccount);

	const handleAccountSelect = (accountId: string) => {
		dispatch(setCurrentAccount(accountId));
		onClose();
		navigate('/');
	};

	const handleCreateAccount = () => {
		onClose();
		navigate('/accounts/new');
	};

	return (
		<div
			className='absolute w-64 mt-2 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700'
			onClick={(e) => e.stopPropagation()}>
			<div className='py-1'>
				<div className='px-4 py-2 border-b border-gray-200 dark:border-gray-700'>
					<h3 className='text-sm font-medium text-gray-900 dark:text-white'>
						Your Accounts
					</h3>
				</div>

				{accounts && accounts.length > 0 ? (
					<div className='max-h-60 overflow-y-auto'>
						{accounts.map((account) => (
							<button
								key={account.id}
								onClick={() => handleAccountSelect(account.id)}
								className={`block w-full text-left px-4 py-2 text-sm ${
									currentAccount?.id === account.id
										? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
										: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
								}`}>
								<div className='flex items-center'>
									<div className='flex-shrink-0'>
										<div className='h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'>
											<span className='text-sm font-medium text-blue-800 dark:text-blue-300'>
												{account.name.charAt(0)}
											</span>
										</div>
									</div>
									<div className='ml-3'>
										<p className='font-medium'>{account.name}</p>
										<p className='text-xs text-gray-500 dark:text-gray-400'>
											{account.type} · {account.baseCurrency}
										</p>
									</div>
								</div>
							</button>
						))}
					</div>
				) : (
					<div className='px-4 py-3 text-sm text-gray-500 dark:text-gray-400'>
						No accounts found.
					</div>
				)}

				<div className='border-t border-gray-200 dark:border-gray-700'>
					<button
						onClick={handleCreateAccount}
						className='block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'>
						<div className='flex items-center'>
							<svg
								className='h-5 w-5 mr-2'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 6v6m0 0v6m0-6h6m-6 0H6'
								/>
							</svg>
							Create New Account
						</div>
					</button>
				</div>
			</div>
		</div>
	);
};

export default AccountSwitcher;
