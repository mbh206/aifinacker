import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
	createBudget,
	updateBudget,
	fetchBudget,
	selectBudgetById,
	selectBudgetStatus,
	selectBudgetError,
} from '../store/slices/budgetsSlice';
import { selectExpenseCategories } from '../store/slices/expensesSlice';
import { selectCurrentAccount } from '../store/slices/accountsSlice';
import { showNotification } from '../store/slices/uiSlice';

// Components
import LoadingScreen from '../components/common/LoadingScreen';
import EmptyState from '../components/common/EmptyState';

// Types
import { Budget } from '../types';

const BudgetForm = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const isEditMode = !!id;

	const currentAccount = useSelector(selectCurrentAccount);
	const existingBudget = useSelector((state) =>
		isEditMode ? selectBudgetById(state, id!) : null
	);
	const budgetStatus = useSelector(selectBudgetStatus);
	const budgetError = useSelector(selectBudgetError);
	const categories = useSelector(selectExpenseCategories);

	// Form state
	const [name, setName] = useState('');
	const [category, setCategory] = useState('');
	const [amount, setAmount] = useState('');
	const [period, setPeriod] = useState('monthly');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [description, setDescription] = useState('');
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	// Load budget data if in edit mode
	useEffect(() => {
		if (isEditMode && id && currentAccount) {
			dispatch(fetchBudget({ accountId: currentAccount.id, budgetId: id }));
		}
	}, [dispatch, isEditMode, id, currentAccount]);

	// Populate form with existing budget data
	useEffect(() => {
		if (existingBudget) {
			setName(existingBudget.name);
			setCategory(existingBudget.category);
			setAmount(existingBudget.amount.toString());
			setPeriod(existingBudget.period);
			setStartDate(existingBudget.startDate);
			setEndDate(existingBudget.endDate || '');
			setDescription(existingBudget.description || '');
		}
	}, [existingBudget]);

	// Set default dates if not set
	useEffect(() => {
		if (!startDate) {
			const today = new Date();
			setStartDate(today.toISOString().split('T')[0]);

			// Set default end date based on period
			if (!endDate) {
				const endDateVal = new Date(today);
				switch (period) {
					case 'weekly':
						endDateVal.setDate(today.getDate() + 7);
						break;
					case 'monthly':
						endDateVal.setMonth(today.getMonth() + 1);
						break;
					case 'quarterly':
						endDateVal.setMonth(today.getMonth() + 3);
						break;
					case 'yearly':
						endDateVal.setFullYear(today.getFullYear() + 1);
						break;
					default:
						break;
				}
				setEndDate(endDateVal.toISOString().split('T')[0]);
			}
		}
	}, [startDate, endDate, period]);

	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		if (!name.trim()) {
			errors.name = 'Budget name is required';
		}

		if (!category) {
			errors.category = 'Category is required';
		}

		if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
			errors.amount = 'Amount must be a positive number';
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm() || !currentAccount) {
			return;
		}

		const budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'spent'> =
			{
				name: name.trim(),
				category,
				amount: Number(amount),
				period,
				startDate,
				endDate,
				description: description.trim(),
				accountId: currentAccount.id,
			};

		try {
			if (isEditMode && id) {
				await dispatch(
					updateBudget({
						accountId: currentAccount.id,
						budgetId: id,
						budgetData,
					})
				);
				dispatch(
					showNotification({
						type: 'success',
						message: 'Budget updated successfully',
					})
				);
			} else {
				await dispatch(
					createBudget({
						accountId: currentAccount.id,
						budgetData,
					})
				);
				dispatch(
					showNotification({
						type: 'success',
						message: 'Budget created successfully',
					})
				);
			}
			navigate('/budgets');
		} catch (error) {
			console.error('Failed to save budget:', error);
		}
	};

	if (budgetStatus === 'loading' && isEditMode) {
		return <LoadingScreen />;
	}

	if (budgetError && isEditMode) {
		return (
			<div className='p-6 bg-red-50 dark:bg-red-900/20 rounded-lg'>
				<h2 className='text-red-800 dark:text-red-200 text-lg font-semibold'>
					Error loading budget
				</h2>
				<p className='text-red-600 dark:text-red-300 mt-2'>{budgetError}</p>
			</div>
		);
	}

	if (!currentAccount) {
		return (
			<EmptyState
				title='No Account Selected'
				description='Please select or create an account to manage budgets.'
				actionText='Go to Accounts'
				onAction={() => navigate('/accounts')}
			/>
		);
	}

	return (
		<div className='container mx-auto px-4 py-6'>
			<div className='max-w-2xl mx-auto'>
				<h1 className='text-2xl font-bold mb-6'>
					{isEditMode ? 'Edit Budget' : 'Create New Budget'}
				</h1>

				<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
					<form onSubmit={handleSubmit}>
						{/* Budget Name */}
						<div className='mb-4'>
							<label
								htmlFor='name'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
								Budget Name*
							</label>
							<input
								type='text'
								id='name'
								value={name}
								onChange={(e) => setName(e.target.value)}
								className={`w-full px-3 py-2 rounded-lg border ${
									formErrors.name
										? 'border-red-500'
										: 'border-gray-300 dark:border-gray-600'
								} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
								placeholder='e.g. Monthly Grocery Budget'
							/>
							{formErrors.name && (
								<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
									{formErrors.name}
								</p>
							)}
						</div>

						{/* Category */}
						<div className='mb-4'>
							<label
								htmlFor='category'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
								Category*
							</label>
							<select
								id='category'
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								className={`w-full px-3 py-2 rounded-lg border ${
									formErrors.category
										? 'border-red-500'
										: 'border-gray-300 dark:border-gray-600'
								} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}>
								<option value=''>Select a Category</option>
								{categories.map((cat) => (
									<option
										key={cat}
										value={cat}>
										{cat}
									</option>
								))}
								<option value='All'>All Categories</option>
							</select>
							{formErrors.category && (
								<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
									{formErrors.category}
								</p>
							)}
						</div>

						{/* Amount */}
						<div className='mb-4'>
							<label
								htmlFor='amount'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
								Budget Amount* ({currentAccount.baseCurrency})
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
									<span className='text-gray-500 dark:text-gray-400'>
										{getCurrencySymbol(currentAccount.baseCurrency)}
									</span>
								</div>
								<input
									type='number'
									id='amount'
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									step='0.01'
									min='0'
									className={`w-full pl-8 px-3 py-2 rounded-lg border ${
										formErrors.amount
											? 'border-red-500'
											: 'border-gray-300 dark:border-gray-600'
									} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
									placeholder='0.00'
								/>
							</div>
							{formErrors.amount && (
								<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
									{formErrors.amount}
								</p>
							)}
						</div>

						{/* Budget Period */}
						<div className='mb-4'>
							<label
								htmlFor='period'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
								Budget Period
							</label>
							<select
								id='period'
								value={period}
								onChange={(e) => setPeriod(e.target.value)}
								className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'>
								<option value='weekly'>Weekly</option>
								<option value='monthly'>Monthly</option>
								<option value='quarterly'>Quarterly</option>
								<option value='yearly'>Yearly</option>
								<option value='custom'>Custom Period</option>
							</select>
						</div>

						{/* Date Range */}
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
							<div>
								<label
									htmlFor='startDate'
									className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
									Start Date*
								</label>
								<input
									type='date'
									id='startDate'
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className={`w-full px-3 py-2 rounded-lg border ${
										formErrors.startDate
											? 'border-red-500'
											: 'border-gray-300 dark:border-gray-600'
									} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
								/>
								{formErrors.startDate && (
									<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
										{formErrors.startDate}
									</p>
								)}
							</div>
							<div>
								<label
									htmlFor='endDate'
									className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
									End Date*
								</label>
								<input
									type='date'
									id='endDate'
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className={`w-full px-3 py-2 rounded-lg border ${
										formErrors.endDate
											? 'border-red-500'
											: 'border-gray-300 dark:border-gray-600'
									} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
								/>
								{formErrors.endDate && (
									<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
										{formErrors.endDate}
									</p>
								)}
							</div>
						</div>

						{/* Description */}
						<div className='mb-6'>
							<label
								htmlFor='description'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
								Description (Optional)
							</label>
							<textarea
								id='description'
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={3}
								className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
								placeholder='Add notes or details about this budget...'
							/>
						</div>

						{/* Form Actions */}
						<div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3'>
							<button
								type='submit'
								className='w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200'>
								{isEditMode ? 'Update Budget' : 'Create Budget'}
							</button>
							<button
								type='button'
								onClick={() => navigate('/budgets')}
								className='w-full sm:w-auto px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition duration-200'>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

// Helper function to get currency symbol
const getCurrencySymbol = (currency: string): string => {
	const symbols: Record<string, string> = {
		USD: '$',
		EUR: '€',
		GBP: '£',
		JPY: '¥',
		CAD: 'C$',
		AUD: 'A$',
		INR: '₹',
		CNY: '¥',
		// Add more currencies as needed
	};

	return symbols[currency] || currency;
};

export default BudgetForm;
