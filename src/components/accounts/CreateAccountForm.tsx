// src/components/accounts/CreateAccountForm.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import { createNewAccount } from '../../features/accounts/accountsSlice';
import { addNotification } from '../../features/ui/uiSlice';
import { getSupportedCurrencies } from '../../services/api';

const accountTypes = [
	{ id: 'personal', name: 'Personal' },
	{ id: 'family', name: 'Family' },
	{ id: 'team', name: 'Team' },
	{ id: 'business', name: 'Business' },
];

interface Currency {
	code: string;
	name: string;
	symbol: string;
}

const CreateAccountForm: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const { user } = useSelector((state: RootState) => state.auth);
	const { isLoading, error } = useSelector(
		(state: RootState) => state.accounts
	);

	const [name, setName] = useState('');
	const [type, setType] = useState<'personal' | 'family' | 'team' | 'business'>(
		'personal'
	);
	const [description, setDescription] = useState('');
	const [baseCurrency, setBaseCurrency] = useState('USD');
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);

	// Fetch supported currencies
	useEffect(() => {
		const fetchCurrencies = async () => {
			setIsLoadingCurrencies(true);
			try {
				const data = await getSupportedCurrencies();
				setCurrencies(data);
			} catch (error) {
				console.error('Error fetching currencies:', error);
				// Fallback to common currencies
				setCurrencies([
					{ code: 'USD', name: 'US Dollar', symbol: '$' },
					{ code: 'EUR', name: 'Euro', symbol: '€' },
					{ code: 'GBP', name: 'British Pound', symbol: '£' },
					{ code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
					{ code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
					{ code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
				]);
			} finally {
				setIsLoadingCurrencies(false);
			}
		};

		fetchCurrencies();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) return;

		try {
			// Create the new account
			const newAccount = {
				name,
				type,
				description,
				baseCurrency,
				ownerId: user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				members: [
					{
						userId: user.id,
						role: 'admin' as const,
						joinedAt: new Date(),
						invitedBy: user.id,
					},
				],
				settings: {
					defaultCategories: [],
					fiscalYearStart: 1, // January
					weekStart: 0, // Sunday
					expenseApprovalRequired: false,
				},
			};

			await dispatch(createNewAccount(newAccount)).unwrap();

			// Show success notification
			dispatch(
				addNotification({
					type: 'success',
					message: 'Account created successfully!',
				})
			);

			// Navigate to dashboard
			navigate('/');
		} catch (error) {
			console.error('Error creating account:', error);

			// Show error notification
			dispatch(
				addNotification({
					type: 'error',
					message: 'Failed to create account. Please try again.',
				})
			);
		}
	};

	return (
		<div className='bg-white dark:bg-gray-800 shadow rounded-lg'>
			<div className='px-4 py-5 sm:p-6'>
				<h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-white'>
					Create a new account
				</h3>
				<div className='mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400'>
					<p>
						Set up a new account to track your finances. You can invite others
						to collaborate later.
					</p>
				</div>

				{error && (
					<div className='mt-4 bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900 dark:border-red-700'>
						<div className='flex'>
							<div className='flex-shrink-0'>
								<svg
									className='h-5 w-5 text-red-400 dark:text-red-300'
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'
									fill='currentColor'>
									<path
										fillRule='evenodd'
										d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
										clipRule='evenodd'
									/>
								</svg>
							</div>
							<div className='ml-3'>
								<p className='text-sm text-red-700 dark:text-red-200'>
									{error}
								</p>
							</div>
						</div>
					</div>
				)}

				<form
					className='mt-5 space-y-6'
					onSubmit={handleSubmit}>
					<div className='grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6'>
						{/* Account Name */}
						<div className='sm:col-span-3'>
							<label
								htmlFor='account-name'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Account Name
							</label>
							<div className='mt-1'>
								<input
									type='text'
									id='account-name'
									name='account-name'
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
									placeholder='My Personal Finances'
								/>
							</div>
						</div>

						{/* Account Type */}
						<div className='sm:col-span-3'>
							<label
								htmlFor='account-type'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Account Type
							</label>
							<div className='mt-1'>
								<select
									id='account-type'
									name='account-type'
									required
									value={type}
									onChange={(e) =>
										setType(
											e.target.value as
												| 'personal'
												| 'family'
												| 'team'
												| 'business'
										)
									}
									className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white'>
									{accountTypes.map((accountType) => (
										<option
											key={accountType.id}
											value={accountType.id}>
											{accountType.name}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Description */}
						<div className='sm:col-span-6'>
							<label
								htmlFor='account-description'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Description (Optional)
							</label>
							<div className='mt-1'>
								<textarea
									id='account-description'
									name='account-description'
									rows={3}
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
									placeholder='Track my personal expenses and budget'
								/>
							</div>
							<p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
								Brief description of this account's purpose.
							</p>
						</div>

						{/* Base Currency */}
						<div className='sm:col-span-3'>
							<label
								htmlFor='base-currency'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Base Currency
							</label>
							<div className='mt-1'>
								<select
									id='base-currency'
									name='base-currency'
									required
									value={baseCurrency}
									onChange={(e) => setBaseCurrency(e.target.value)}
									disabled={isLoadingCurrencies}
									className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70'>
									{isLoadingCurrencies ? (
										<option>Loading currencies...</option>
									) : (
										currencies.map((currency) => (
											<option
												key={currency.code}
												value={currency.code}>
												{currency.code} - {currency.name} ({currency.symbol})
											</option>
										))
									)}
								</select>
							</div>
							<p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
								Primary currency for this account. You'll be able to add
								expenses in other currencies too.
							</p>
						</div>
					</div>

					<div className='pt-5'>
						<div className='flex justify-end'>
							<button
								type='button'
								onClick={() => navigate('/')}
								className='bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'>
								Cancel
							</button>
							<button
								type='submit'
								disabled={isLoading || isLoadingCurrencies}
								className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800'>
								{isLoading ? (
									<svg
										className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
								) : null}
								Create Account
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateAccountForm;
