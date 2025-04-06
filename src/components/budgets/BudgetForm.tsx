// src/components/budgets/BudgetForm.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
	addBudget,
	editBudget,
	fetchBudget,
} from '../../features/budgets/budgetsSlice';
import { selectExpenseCategories } from '../../features/expenses/expensesSlice';
import { selectCurrentAccount } from '../../features/accounts/accountsSlice';
import { addNotification } from '../../features/ui/uiSlice';
import { RootState, AppDispatch } from '../../store';

// Components
import LoadingScreen from '../common/LoadingScreen';

interface BudgetFormProps {
	isEditMode?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ isEditMode = false }) => {
	const { id } = useParams<{ id: string }>();
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const { isLoading, error } = useSelector((state: RootState) => state.budgets);
	const budget = useSelector((state: RootState) =>
		isEditMode && id ? state.budgets.budgets.find((b) => b.id === id) : null
	);
	const currentAccount = useSelector(selectCurrentAccount);
	const categories = useSelector(selectExpenseCategories);

	// Form state
	const [name, setName] = useState('');
	const [amount, setAmount] = useState('');
	const [category, setCategory] = useState('all');
	const [period, setPeriod] = useState('monthly');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [notes, setNotes] = useState('');
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	// Load budget data if in edit mode
	useEffect(() => {
		if (isEditMode && id && currentAccount) {
			dispatch(fetchBudget(id));
		}
	}, [dispatch, isEditMode, id, currentAccount]);

	// Populate form with existing budget data
	useEffect(() => {
		if (budget) {
			setName(budget.name);
			setAmount(budget.amount.toString());
			setCategory(budget.category || 'all');
			setPeriod(budget.period || 'monthly');

			if (budget.startDate) {
				// Convert to YYYY-MM-DD format for input
				setStartDate(format(new Date(budget.startDate), 'yyyy-MM-dd'));
			}

			if (budget.endDate) {
				// Convert to YYYY-MM-DD format for input
				setEndDate(format(new Date(budget.endDate), 'yyyy-MM-dd'));
			}

			setNotes(budget.notes || '');
		}
	}, [budget]);

	// Set default dates if not set
	useEffect(() => {
		if (!startDate && !isEditMode) {
			// Default to today
			setStartDate(format(new Date(), 'yyyy-MM-dd'));
		}

		// Calculate end date based on period if not set and start date is available
		if (startDate && !endDate && !isEditMode) {
			const start = new Date(startDate);
			let end = new Date(start);

			switch (period) {
				case 'weekly':
					end.setDate(start.getDate() + 7);
					break;
				case 'monthly':
					end.setMonth(start.getMonth() + 1);
					break;
				case 'quarterly':
					end.setMonth(start.getMonth() + 3);
					break;
				case 'yearly':
					end.setFullYear(start.getFullYear() + 1);
					break;
				default:
					end.setMonth(start.getMonth() + 1); // Default to monthly
			}

			setEndDate(format(end, 'yyyy-MM-dd'));
		}
	}, [startDate, endDate, period, isEditMode]);

	// Handle period change
	const handlePeriodChange = (newPeriod: string) => {
		setPeriod(newPeriod);

		// Update end date when period changes
		if (startDate) {
			const start = new Date(startDate);
			let end = new Date(start);

			switch (newPeriod) {
				case 'weekly':
					end.setDate(start.getDate() + 7);
					break;
				case 'monthly':
					end.setMonth(start.getMonth() + 1);
					break;
				case 'quarterly':
					end.setMonth(start.getMonth() + 3);
					break;
				case 'yearly':
					end.setFullYear(start.getFullYear() + 1);
					break;
				case 'custom':
					// Don't change the end date for custom
					return;
				default:
					end.setMonth(start.getMonth() + 1);
			}

			setEndDate(format(end, 'yyyy-MM-dd'));
		}
	};

	// Form validation
	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		if (!name.trim()) {
			errors.name = 'Budget name is required';
		}

		if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
			errors.amount = 'Budget amount must be a positive number';
		}

		if (!startDate) {
			errors.startDate = 'Start date is required';
		}

		if (!endDate) {
			errors.endDate = 'End date is required';
		} else if (
			startDate &&
			endDate &&
			new Date(endDate) <= new Date(startDate)
		) {
			errors.endDate = 'End date must be after start date';
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm() || !currentAccount) {
			return;
		}

		const budgetData = {
			name: name.trim(),
			amount: Number(amount),
			category: category === 'all' ? 'All' : category,
			period,
			startDate: new Date(startDate).toISOString(),
			endDate: new Date(endDate).toISOString(),
			notes: notes.trim() || undefined,
			accountId: currentAccount.id,
			isRecurring: false,
		};

		try {
			if (isEditMode && id) {
				await dispatch(
					editBudget({ budgetId: id, updates: budgetData })
				).unwrap();
				dispatch(
					addNotification({
						type: 'success',
						message: 'Budget updated successfully',
					})
				);
			} else {
				await dispatch(addBudget(budgetData)).unwrap();
				dispatch(
					addNotification({
						type: 'success',
						message: 'Budget created successfully',
					})
				);
			}
			navigate('/budgets');
		} catch (err) {
			dispatch(
				addNotification({
					type: 'error',
					message: `Failed to ${isEditMode ? 'update' : 'create'} budget`,
				})
			);
		}
	};

	// Format currency input
	const formatCurrency = (value: string): string => {
		// Remove non-numeric characters except decimal point
		const numericValue = value.replace(/[^0-9.]/g, '');

		// Ensure only one decimal point
		const parts = numericValue.split('.');
		if (parts.length > 2) {
			return parts[0] + '.' + parts.slice(1).join('');
		}

		return numericValue;
	};

	// If loading in edit mode
	if (isEditMode && isLoading && !budget) {
		return <LoadingScreen />;
	}

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6'>
			<div className='pb-5 border-b border-gray-200 dark:border-gray-700 sm:flex sm:items-center sm:justify-between'>
				<h3 className='text-lg leading-6 font-medium text-gray-900 dark:text-white'>
					{isEditMode ? 'Edit Budget' : 'Create New Budget'}
				</h3>
			</div>

			{error && (
				<div className='mt-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-md'>
					<div className='flex'>
						<div className='flex-shrink-0'>
							<svg
								className='h-5 w-5 text-red-400'
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
							<h3 className='text-sm font-medium text-red-800 dark:text-red-200'>
								{error}
							</h3>
						</div>
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className='mt-6 space-y-6'>
				{/* Budget Name */}
				<div>
					<label
						htmlFor='name'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Budget Name*
					</label>
					<div className='mt-1'>
						<input
							type='text'
							id='name'
							value={name}
							onChange={(e) => setName(e.target.value)}
							className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${
								formErrors.name
									? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
									: ''
							}`}
							placeholder='e.g., Monthly Groceries'
						/>
						{formErrors.name && (
							<p className='mt-2 text-sm text-red-600 dark:text-red-400'>
								{formErrors.name}
							</p>
						)}
					</div>
				</div>

				{/* Budget Amount */}
				<div>
					<label
						htmlFor='amount'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Budget Amount* ({currentAccount?.baseCurrency || 'USD'})
					</label>
					<div className='mt-1 relative rounded-md shadow-sm'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<span className='text-gray-500 dark:text-gray-400 sm:text-sm'>
								{currentAccount?.baseCurrency === 'USD'
									? '$'
									: currentAccount?.baseCurrency === 'EUR'
									? '€'
									: currentAccount?.baseCurrency === 'GBP'
									? '£'
									: ''}
							</span>
						</div>
						<input
							type='text'
							id='amount'
							value={amount}
							onChange={(e) => setAmount(formatCurrency(e.target.value))}
							className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${
								formErrors.amount
									? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
									: ''
							}`}
							placeholder='0.00'
							aria-describedby='amount-currency'
						/>
						<div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
							<span
								className='text-gray-500 dark:text-gray-400 sm:text-sm'
								id='amount-currency'>
								{currentAccount?.baseCurrency || 'USD'}
							</span>
						</div>
					</div>
					{formErrors.amount && (
						<p className='mt-2 text-sm text-red-600 dark:text-red-400'>
							{formErrors.amount}
						</p>
					)}
				</div>

				{/* Category */}
				<div>
					<label
						htmlFor='category'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Category
					</label>
					<div className='mt-1'>
						<select
							id='category'
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md'>
							<option value='all'>All Categories</option>
							{categories.map((cat) => (
								<option
									key={cat}
									value={cat}>
									{cat}
								</option>
							))}
						</select>
					</div>
					<p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
						Select "All Categories" to track total spending or choose a specific
						category.
					</p>
				</div>

				{/* Budget Period */}
				<div>
					<label
						htmlFor='period'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Budget Period
					</label>
					<div className='mt-1'>
						<select
							id='period'
							value={period}
							onChange={(e) => handlePeriodChange(e.target.value)}
							className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md'>
							<option value='weekly'>Weekly</option>
							<option value='monthly'>Monthly</option>
							<option value='quarterly'>Quarterly</option>
							<option value='yearly'>Yearly</option>
							<option value='custom'>Custom Period</option>
						</select>
					</div>
				</div>

				{/* Date Range */}
				<div className='grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2'>
					<div>
						<label
							htmlFor='startDate'
							className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
							Start Date*
						</label>
						<div className='mt-1'>
							<input
								type='date'
								id='startDate'
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${
									formErrors.startDate
										? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
										: ''
								}`}
							/>
							{formErrors.startDate && (
								<p className='mt-2 text-sm text-red-600 dark:text-red-400'>
									{formErrors.startDate}
								</p>
							)}
						</div>
					</div>

					<div>
						<label
							htmlFor='endDate'
							className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
							End Date*
						</label>
						<div className='mt-1'>
							<input
								type='date'
								id='endDate'
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${
									formErrors.endDate
										? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
										: ''
								}`}
							/>
							{formErrors.endDate && (
								<p className='mt-2 text-sm text-red-600 dark:text-red-400'>
									{formErrors.endDate}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Notes */}
				<div>
					<label
						htmlFor='notes'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Notes (Optional)
					</label>
					<div className='mt-1'>
						<textarea
							id='notes'
							rows={3}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md'
							placeholder='Add any additional notes about this budget...'></textarea>
					</div>
				</div>

				{/* Form Actions */}
				<div className='flex justify-end space-x-3'>
					<button
						type='button'
						onClick={() => navigate('/budgets')}
						className='inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
						Cancel
					</button>
					<button
						type='submit'
						disabled={isLoading}
						className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'>
						{isLoading ? (
							<>
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
								{isEditMode ? 'Updating...' : 'Creating...'}
							</>
						) : isEditMode ? (
							'Update Budget'
						) : (
							'Create Budget'
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default BudgetForm;
