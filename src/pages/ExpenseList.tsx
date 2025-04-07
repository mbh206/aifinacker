import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
	fetchExpenses,
	selectAllExpenses,
	selectExpenseStatus,
	selectExpenseError,
	deleteExpense,
} from '../store/slices/expensesSlice';
import { selectCurrentAccount } from '../store/slices/accountsSlice';
import {
	setCategoryFilter,
	setDateFilter,
	setSearchQuery,
	selectFilters,
} from '../store/slices/uiSlice';

// Components
import LoadingScreen from '../components/common/LoadingScreen';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';

// Types
import { Expense } from '../types';

const ExpenseList = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const expenses = useSelector(selectAllExpenses);
	const status = useSelector(selectExpenseStatus);
	const error = useSelector(selectExpenseError);
	const currentAccount = useSelector(selectCurrentAccount);
	const filters = useSelector(selectFilters);

	const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

	// Load expenses when component mounts
	useEffect(() => {
		if (currentAccount) {
			dispatch(fetchExpenses(currentAccount.id));
		}
	}, [dispatch, currentAccount]);

	// Apply filters when expenses or filters change
	useEffect(() => {
		if (!expenses) return;

		let filtered = [...expenses];

		// Apply category filter
		if (filters.category && filters.category !== 'all') {
			filtered = filtered.filter(
				(expense) => expense.category === filters.category
			);
		}

		// Apply date filter
		if (filters.dateRange) {
			const { startDate, endDate } = filters.dateRange;
			if (startDate) {
				filtered = filtered.filter(
					(expense) => new Date(expense.date) >= new Date(startDate)
				);
			}
			if (endDate) {
				filtered = filtered.filter(
					(expense) => new Date(expense.date) <= new Date(endDate)
				);
			}
		}

		// Apply search query
		if (filters.searchQuery) {
			const query = filters.searchQuery.toLowerCase();
			filtered = filtered.filter(
				(expense) =>
					expense.description.toLowerCase().includes(query) ||
					expense.category.toLowerCase().includes(query) ||
					expense.amount.toString().includes(query)
			);
		}

		// Sort by date (newest first)
		filtered.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);

		setFilteredExpenses(filtered);
	}, [expenses, filters]);

	const handleDeleteClick = (expense: Expense) => {
		setSelectedExpense(expense);
		setShowDeleteConfirm(true);
	};

	const confirmDelete = async () => {
		if (selectedExpense && currentAccount) {
			await dispatch(
				deleteExpense({
					accountId: currentAccount.id,
					expenseId: selectedExpense.id,
				})
			);
			setShowDeleteConfirm(false);
			setSelectedExpense(null);
		}
	};

	if (status === 'loading') {
		return <LoadingScreen />;
	}

	if (error) {
		return (
			<div className='p-6 bg-red-50 dark:bg-red-900/20 rounded-lg'>
				<h2 className='text-red-800 dark:text-red-200 text-lg font-semibold'>
					Error loading expenses
				</h2>
				<p className='text-red-600 dark:text-red-300 mt-2'>{error}</p>
			</div>
		);
	}

	if (!currentAccount) {
		return (
			<EmptyState
				title='No Account Selected'
				description='Please select or create an account to view expenses.'
				actionText='Go to Accounts'
				onAction={() => navigate('/accounts')}
			/>
		);
	}

	return (
		<div className='container mx-auto px-4 py-6'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
				<h1 className='text-2xl font-bold mb-4 md:mb-0'>Expenses</h1>
				<button
					onClick={() => navigate('/expenses/new')}
					className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200'>
					+ Add New Expense
				</button>
			</div>

			<ExpenseFilters
				onCategoryChange={(category) => dispatch(setCategoryFilter(category))}
				onDateRangeChange={(dateRange) => dispatch(setDateFilter(dateRange))}
				onSearchChange={(query) => dispatch(setSearchQuery(query))}
				selectedCategory={filters.category}
				selectedDateRange={filters.dateRange}
				searchQuery={filters.searchQuery}
			/>

			{filteredExpenses.length === 0 ? (
				<EmptyState
					title='No Expenses Found'
					description={
						expenses.length === 0
							? "You don't have any expenses yet. Add your first expense to get started."
							: 'No expenses match your current filters. Try adjusting your search criteria.'
					}
					actionText={expenses.length === 0 ? 'Add Expense' : 'Clear Filters'}
					onAction={() => {
						if (expenses.length === 0) {
							navigate('/expenses/new');
						} else {
							dispatch(setCategoryFilter('all'));
							dispatch(setDateFilter(null));
							dispatch(setSearchQuery(''));
						}
					}}
				/>
			) : (
				<div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
							<thead className='bg-gray-50 dark:bg-gray-700'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
										Date
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
										Description
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
										Category
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
										Amount
									</th>
									<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
								{filteredExpenses.map((expense) => (
									<tr
										key={expense.id}
										className='hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
										onClick={() => navigate(`/expenses/${expense.id}`)}>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>
											{format(new Date(expense.date), 'MMM d, yyyy')}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>
											{expense.description}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm'>
											<span
												className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getCategoryColor(
													expense.category
												)}-100 text-${getCategoryColor(
													expense.category
												)}-800 dark:bg-${getCategoryColor(
													expense.category
												)}-800/30 dark:text-${getCategoryColor(
													expense.category
												)}-300`}>
												{expense.category}
											</span>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>
											<CurrencyDisplay
												amount={expense.amount}
												currency={expense.currency}
												baseCurrency={currentAccount.baseCurrency}
											/>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
											<button
												onClick={(e) => {
													e.stopPropagation();
													navigate(`/expenses/${expense.id}/edit`);
												}}
												className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4'>
												Edit
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteClick(expense);
												}}
												className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Confirmation Dialog for Delete */}
			<ConfirmDialog
				isOpen={showDeleteConfirm}
				title='Delete Expense'
				message={`Are you sure you want to delete the expense "${selectedExpense?.description}"? This action cannot be undone.`}
				confirmText='Delete'
				cancelText='Cancel'
				confirmButtonClass='bg-red-600 hover:bg-red-700'
				onConfirm={confirmDelete}
				onCancel={() => setShowDeleteConfirm(false)}
			/>
		</div>
	);
};

// Helper Components

interface CurrencyDisplayProps {
	amount: number;
	currency: string;
	baseCurrency: string;
}

const CurrencyDisplay = ({
	amount,
	currency,
	baseCurrency,
}: CurrencyDisplayProps) => {
	// In a real app, you would implement currency conversion here
	// For now, we'll just format with the currency symbol
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency || baseCurrency,
	});

	return <span>{formatter.format(amount)}</span>;
};

// Helper function to get color for category
const getCategoryColor = (category: string): string => {
	const colorMap: Record<string, string> = {
		Food: 'green',
		Housing: 'blue',
		Transportation: 'yellow',
		Entertainment: 'purple',
		Utilities: 'indigo',
		Shopping: 'pink',
		Healthcare: 'red',
		Travel: 'amber',
		Education: 'teal',
		Personal: 'gray',
		Business: 'cyan',
		Gifts: 'rose',
		Other: 'gray',
	};

	return colorMap[category] || 'gray';
};

export default ExpenseList;
