// src/components/expenses/ExpenseForm.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import { addExpense, editExpense } from '../../features/expenses/expensesSlice';
import { addNotification } from '../../features/ui/uiSlice';
import {
	getAccountCategories,
	getSystemCategories,
	getExchangeRates,
	getSupportedCurrencies,
} from '../../services/api';
import { Expense, ExpenseCategory } from '../../models/types';

interface ExpenseFormProps {
	existingExpense?: Expense;
	isEditMode?: boolean;
}

interface Currency {
	code: string;
	name: string;
	symbol: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
	existingExpense,
	isEditMode = false,
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const { currentAccount } = useSelector((state: RootState) => state.accounts);
	const { user } = useSelector((state: RootState) => state.auth);
	const { isLoading } = useSelector((state: RootState) => state.expenses);

	// Form state
	const [amount, setAmount] = useState(
		existingExpense?.amount?.toString() || ''
	);
	const [category, setCategory] = useState(existingExpense?.category || '');
	const [subcategory, setSubcategory] = useState(
		existingExpense?.subcategory || ''
	);
	const [description, setDescription] = useState(
		existingExpense?.description || ''
	);
	const [date, setDate] = useState(
		existingExpense?.date
			? new Date(existingExpense.date).toISOString().split('T')[0]
			: new Date().toISOString().split('T')[0]
	);
	const [notes, setNotes] = useState(existingExpense?.notes || '');
	const [currency, setCurrency] = useState(
		existingExpense?.originalCurrency || currentAccount?.baseCurrency || 'USD'
	);
	const [isRecurring, setIsRecurring] = useState(
		existingExpense?.isRecurring || false
	);
	const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
	const [receiptUrls, setReceiptUrls] = useState<string[]>(
		existingExpense?.receiptUrls || []
	);

	// Supporting data
	const [categories, setCategories] = useState<ExpenseCategory[]>([]);
	const [subcategories, setSubcategories] = useState<ExpenseCategory[]>([]);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
		{}
	);

	// Loading states
	const [isLoadingCategories, setIsLoadingCategories] = useState(false);
	const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);
	const [isLoadingRates, setIsLoadingRates] = useState(false);
	const [isUploadingReceipts, setIsUploadingReceipts] = useState(false);

	// Fetch categories
	useEffect(() => {
		const fetchCategories = async () => {
			if (!currentAccount) return;

			setIsLoadingCategories(true);
			try {
				// Get system categories and account-specific categories
				const systemCats = await getSystemCategories();
				const accountCats = await getAccountCategories(currentAccount.id);

				// Combine and sort categories
				const allCategories = [...systemCats, ...accountCats].sort((a, b) =>
					a.name.localeCompare(b.name)
				);

				// Separate top-level categories and subcategories
				const mainCategories = allCategories.filter((cat) => !cat.parentId);
				const subs = allCategories.filter((cat) => cat.parentId);

				setCategories(mainCategories);

				// If editing and category is set, load relevant subcategories
				if (isEditMode && existingExpense?.category) {
					const parentCategory = mainCategories.find(
						(cat) => cat.id === existingExpense.category
					);
					if (parentCategory) {
						const relevantSubs = subs.filter(
							(sub) => sub.parentId === parentCategory.id
						);
						setSubcategories(relevantSubs);
					}
				}
			} catch (error) {
				console.error('Error fetching categories:', error);
				dispatch(
					addNotification({
						type: 'error',
						message: 'Failed to load expense categories',
					})
				);
			} finally {
				setIsLoadingCategories(false);
			}
		};

		fetchCategories();
	}, [currentAccount, dispatch, isEditMode, existingExpense]);

	// Fetch currencies and exchange rates
	useEffect(() => {
		const fetchCurrencyData = async () => {
			if (!currentAccount) return;

			setIsLoadingCurrencies(true);
			setIsLoadingRates(true);

			try {
				// Get supported currencies
				const currencyData = await getSupportedCurrencies();
				setCurrencies(currencyData);

				// Get exchange rates for the account's base currency
				const rates = await getExchangeRates(currentAccount.baseCurrency);
				setExchangeRates(rates);
			} catch (error) {
				console.error('Error fetching currency data:', error);

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
				setIsLoadingRates(false);
			}
		};

		fetchCurrencyData();
	}, [currentAccount, dispatch]);

	// Update subcategories when category changes
	const handleCategoryChange = (categoryId: string) => {
		setCategory(categoryId);
		setSubcategory(''); // Reset subcategory when parent category changes

		// Find subcategories for the selected category
		const parentCategory = categories.find((cat) => cat.id === categoryId);
		if (parentCategory) {
			const relevantSubs = categories.filter(
				(cat) => cat.parentId === parentCategory.id
			);
			setSubcategories(relevantSubs);
		} else {
			setSubcategories([]);
		}
	};

	// Handle receipt file uploads
	const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files);
			setReceiptFiles((prevFiles) => [...prevFiles, ...files]);
		}
	};

	// Remove a receipt file before upload
	const handleRemoveReceiptFile = (index: number) => {
		setReceiptFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
	};

	// Remove an already uploaded receipt
	const handleRemoveReceiptUrl = (index: number) => {
		setReceiptUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
	};

	// Calculate the converted amount based on exchange rate
	const calculateConvertedAmount = (): number => {
		if (!amount || !currency || !currentAccount) return 0;

		const numericAmount = parseFloat(amount);
		if (isNaN(numericAmount)) return 0;

		// If currency is the same as base currency, no conversion needed
		if (currency === currentAccount.baseCurrency) return numericAmount;

		// Get exchange rate - if not available use 1 (no conversion)
		const exchangeRate = exchangeRates[currency] || 1;
		// Convert to base currency
		return numericAmount / exchangeRate;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!currentAccount || !user) return;

		// Validate form
		if (!amount || !category || !description || !date) {
			dispatch(
				addNotification({
					type: 'error',
					message: 'Please fill in all required fields',
				})
			);
			return;
		}

		try {
			// Upload receipts if any
			setIsUploadingReceipts(true);
			let allReceiptUrls = [...receiptUrls];

			if (receiptFiles.length > 0) {
				// This would be implemented to handle file uploads to storage
				// For now, we'll just pretend the upload was successful
				// In a real implementation, we'd use Firebase Storage or similar
				const mockUploadedUrls = receiptFiles.map(
					(file) => `https://storage.example.com/receipts/${file.name}`
				);
				allReceiptUrls = [...allReceiptUrls, ...mockUploadedUrls];
			}
			setIsUploadingReceipts(false);

			// Prepare expense data
			const numericAmount = parseFloat(amount);
			const convertedAmount = calculateConvertedAmount();
			const exchangeRate =
				currency !== currentAccount.baseCurrency
					? exchangeRates[currency] || 1
					: 1;

			const expenseData: Partial<Expense> = {
				accountId: currentAccount.id,
				amount: convertedAmount, // Amount in base currency
				originalAmount: numericAmount, // Original amount in selected currency
				originalCurrency: currency,
				exchangeRate,
				category,
				subcategory: subcategory || undefined,
				date: new Date(date),
				description,
				notes: notes || undefined,
				isRecurring,
				receiptUrls: allReceiptUrls.length > 0 ? allReceiptUrls : undefined,
				createdBy: user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				status: 'approved', // Auto-approve for now
			};

			if (isEditMode && existingExpense) {
				// Update existing expense
				await dispatch(
					editExpense({
						expenseId: existingExpense.id,
						updates: expenseData,
					})
				).unwrap();

				dispatch(
					addNotification({
						type: 'success',
						message: 'Expense updated successfully',
					})
				);
			} else {
				// Create new expense
				await dispatch(addExpense(expenseData)).unwrap();

				dispatch(
					addNotification({
						type: 'success',
						message: 'Expense added successfully',
					})
				);
			}

			// Navigate back to expenses list
			navigate('/expenses');
		} catch (error) {
			console.error('Error saving expense:', error);
			dispatch(
				addNotification({
					type: 'error',
					message: `Failed to ${
						isEditMode ? 'update' : 'add'
					} expense. Please try again.`,
				})
			);
		}
	};

	if (!currentAccount) {
		return (
			<div className='bg-white dark:bg-gray-800 shadow rounded-lg p-6'>
				<p className='text-gray-500 dark:text-gray-400'>
					Please select an account first or create a new one.
				</p>
			</div>
		);
	}

	return (
		<div className='bg-white dark:bg-gray-800 shadow rounded-lg'>
			<div className='px-4 py-5 sm:p-6'>
				<h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-white'>
					{isEditMode ? 'Edit Expense' : 'Add New Expense'}
				</h3>

				<form
					className='mt-5 space-y-6'
					onSubmit={handleSubmit}>
					<div className='grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6'>
						{/* Amount and Currency */}
						<div className='sm:col-span-3'>
							<label
								htmlFor='amount'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Amount*
							</label>
							<div className='mt-1 flex rounded-md shadow-sm'>
								<div className='relative flex items-stretch flex-grow focus-within:z-10'>
									<input
										type='number'
										id='amount'
										name='amount'
										required
										step='0.01'
										min='0'
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										className='focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
										placeholder='0.00'
									/>
								</div>
								<select
									id='currency'
									name='currency'
									value={currency}
									onChange={(e) => setCurrency(e.target.value)}
									disabled={isLoadingCurrencies}
									className='-ml-px relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 disabled:opacity-70'>
									{isLoadingCurrencies ? (
										<option>Loading...</option>
									) : (
										currencies.map((curr) => (
											<option
												key={curr.code}
												value={curr.code}>
												{curr.code} ({curr.symbol})
											</option>
										))
									)}
								</select>
							</div>
							{currency !== currentAccount.baseCurrency && (
								<p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
									Converted: {calculateConvertedAmount().toFixed(2)}{' '}
									{currentAccount.baseCurrency}
									{isLoadingRates && ' (updating rates...)'}
								</p>
							)}
						</div>

						{/* Date */}
						<div className='sm:col-span-3'>
							<label
								htmlFor='date'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Date*
							</label>
							<div className='mt-1'>
								<input
									type='date'
									id='date'
									name='date'
									required
									value={date}
									onChange={(e) => setDate(e.target.value)}
									className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white'
								/>
							</div>
						</div>

						{/* Description */}
						<div className='sm:col-span-6'>
							<label
								htmlFor='description'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Description*
							</label>
							<div className='mt-1'>
								<input
									type='text'
									id='description'
									name='description'
									required
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white'
									placeholder='e.g., Grocery shopping at Whole Foods'
								/>
							</div>
						</div>

						{/* Category */}
						<div className='sm:col-span-3'>
							<label
								htmlFor='category'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Category*
							</label>
							<div className='mt-1'>
								<select
									id='category'
									name='category'
									required
									value={category}
									onChange={(e) => handleCategoryChange(e.target.value)}
									disabled={isLoadingCategories}
									className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70'>
									<option value=''>Select a category</option>
									{isLoadingCategories ? (
										<option disabled>Loading categories...</option>
									) : (
										categories
											.filter((cat) => !cat.parentId) // Only top-level categories
											.map((cat) => (
												<option
													key={cat.id}
													value={cat.id}>
													{cat.name}
												</option>
											))
									)}
								</select>
							</div>
						</div>

						{/* Subcategory - Only show if there are subcategories for the selected category */}
						{subcategories.length > 0 && (
							<div className='sm:col-span-3'>
								<label
									htmlFor='subcategory'
									className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
									Subcategory
								</label>
								<div className='mt-1'>
									<select
										id='subcategory'
										name='subcategory'
										value={subcategory}
										onChange={(e) => setSubcategory(e.target.value)}
										className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white'>
										<option value=''>None</option>
										{subcategories.map((sub) => (
											<option
												key={sub.id}
												value={sub.id}>
												{sub.name}
											</option>
										))}
									</select>
								</div>
							</div>
						)}

						{/* Notes */}
						<div className='sm:col-span-6'>
							<label
								htmlFor='notes'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Notes (Optional)
							</label>
							<div className='mt-1'>
								<textarea
									id='notes'
									name='notes'
									rows={3}
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white'
									placeholder='Add any additional details about this expense'
								/>
							</div>
						</div>

						{/* Is Recurring Checkbox */}
						<div className='sm:col-span-6'>
							<div className='flex items-start'>
								<div className='flex items-center h-5'>
									<input
										id='is-recurring'
										name='is-recurring'
										type='checkbox'
										checked={isRecurring}
										onChange={(e) => setIsRecurring(e.target.checked)}
										className='focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600'
									/>
								</div>
								<div className='ml-3 text-sm'>
									<label
										htmlFor='is-recurring'
										className='font-medium text-gray-700 dark:text-gray-300'>
										This is a recurring expense
									</label>
									<p className='text-gray-500 dark:text-gray-400'>
										Mark this if the expense repeats regularly and you want to
										track it separately.
									</p>
								</div>
							</div>
						</div>

						{/* Receipt Upload */}
						<div className='sm:col-span-6'>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Receipts (Optional)
							</label>

							{/* Existing receipts */}
							{receiptUrls.length > 0 && (
								<div className='mt-2'>
									<p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
										Uploaded receipts:
									</p>
									<ul className='space-y-2'>
										{receiptUrls.map((url, index) => (
											<li
												key={index}
												className='flex items-center justify-between'>
												<div className='flex items-center'>
													<svg
														className='h-5 w-5 text-gray-400 dark:text-gray-500'
														xmlns='http://www.w3.org/2000/svg'
														viewBox='0 0 20 20'
														fill='currentColor'>
														<path
															fillRule='evenodd'
															d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z'
															clipRule='evenodd'
														/>
													</svg>
													<a
														href={url}
														target='_blank'
														rel='noopener noreferrer'
														className='ml-2 text-sm text-blue-600 hover:underline dark:text-blue-400'>
														Receipt {index + 1}
													</a>
												</div>
												<button
													type='button'
													onClick={() => handleRemoveReceiptUrl(index)}
													className='text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'>
													<svg
														className='h-5 w-5'
														xmlns='http://www.w3.org/2000/svg'
														viewBox='0 0 20 20'
														fill='currentColor'>
														<path
															fillRule='evenodd'
															d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
															clipRule='evenodd'
														/>
													</svg>
												</button>
											</li>
										))}
									</ul>
								</div>
							)}

							{/* New receipt files */}
							{receiptFiles.length > 0 && (
								<div className='mt-2'>
									<p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
										Files to upload:
									</p>
									<ul className='space-y-2'>
										{receiptFiles.map((file, index) => (
											<li
												key={index}
												className='flex items-center justify-between'>
												<div className='flex items-center'>
													<svg
														className='h-5 w-5 text-gray-400 dark:text-gray-500'
														xmlns='http://www.w3.org/2000/svg'
														viewBox='0 0 20 20'
														fill='currentColor'>
														<path
															fillRule='evenodd'
															d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z'
															clipRule='evenodd'
														/>
													</svg>
													<span className='ml-2 text-sm text-gray-700 dark:text-gray-300'>
														{file.name}
													</span>
												</div>
												<button
													type='button'
													onClick={() => handleRemoveReceiptFile(index)}
													className='text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'>
													<svg
														className='h-5 w-5'
														xmlns='http://www.w3.org/2000/svg'
														viewBox='0 0 20 20'
														fill='currentColor'>
														<path
															fillRule='evenodd'
															d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
															clipRule='evenodd'
														/>
													</svg>
												</button>
											</li>
										))}
									</ul>
								</div>
							)}

							<div className='mt-2'>
								<label
									htmlFor='receipt-upload'
									className='cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5 mr-2 text-gray-400 dark:text-gray-500'
										viewBox='0 0 20 20'
										fill='currentColor'>
										<path
											fillRule='evenodd'
											d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z'
											clipRule='evenodd'
										/>
									</svg>
									Upload Receipt
								</label>
								<input
									id='receipt-upload'
									name='receipt-upload'
									type='file'
									accept='image/*,.pdf'
									multiple
									onChange={handleReceiptUpload}
									className='sr-only'
								/>
								<p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
									Supported formats: JPG, PNG, PDF. Max size: 10MB per file.
								</p>
							</div>
						</div>
					</div>

					<div className='pt-5'>
						<div className='flex justify-end'>
							<button
								type='button'
								onClick={() => navigate('/expenses')}
								className='bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'>
								Cancel
							</button>
							<button
								type='submit'
								disabled={isLoading || isUploadingReceipts}
								className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800'>
								{(isLoading || isUploadingReceipts) && (
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
								)}
								{isEditMode ? 'Update Expense' : 'Add Expense'}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ExpenseForm;
