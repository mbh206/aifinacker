import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
	fetchBudgets,
	deleteBudget,
	selectBudgets,
	selectBudgetStatus,
	selectBudgetError,
} from '../store/slices/budgetsSlice';
import { selectCurrentAccount } from '../store/slices/accountsSlice';
import { showNotification } from '../store/slices/uiSlice';

// Components
import LoadingScreen from '../components/common/LoadingScreen';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BudgetProgressBar from '../components/budgets/BudgetProgressBar';

// Types
import { Budget } from '../types';

const BudgetList = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const budgets = useSelector(selectBudgets);
	const status = useSelector(selectBudgetStatus);
	const error = useSelector(selectBudgetError);
	const currentAccount = useSelector(selectCurrentAccount);

	const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>(
		'active'
	);

	// Load budgets when component mounts
	useEffect(() => {
		if (currentAccount) {
			dispatch(fetchBudgets(currentAccount.id));
		}
	}, [dispatch, currentAccount]);

	// Filter budgets based on active tab
	const getFilteredBudgets = () => {
		if (!budgets) return [];

		const today = new Date();

		switch (activeTab) {
			case 'active':
				return budgets.filter((budget) => new Date(budget.endDate) >= today);
			case 'completed':
				return budgets.filter((budget) => new Date(budget.endDate) < today);
			case 'all':
			default:
				return budgets;
		}
	};

	const filteredBudgets = getFilteredBudgets();

	const handleDeleteClick = (budget: Budget) => {
		setSelectedBudget(budget);
		setShowDeleteConfirm(true);
	};

	const confirmDelete = async () => {
		if (selectedBudget && currentAccount) {
			try {
				await dispatch(
					deleteBudget({
						accountId: currentAccount.id,
						budgetId: selectedBudget.id,
					})
				);
				dispatch(
					showNotification({
						type: 'success',
						message: 'Budget deleted successfully',
					})
				);
				setShowDeleteConfirm(false);
				setSelectedBudget(null);
			} catch (error) {
				console.error('Failed to delete budget:', error);
				dispatch(
					showNotification({
						type: 'error',
						message: 'Failed to delete budget',
					})
				);
			}
		}
	};

	if (status === 'loading') {
		return <LoadingScreen />;
	}

	if (error) {
		return (
			<div className='p-6 bg-red-50 dark:bg-red-900/20 rounded-lg'>
				<h2 className='text-red-800 dark:text-red-200 text-lg font-semibold'>
					Error loading budgets
				</h2>
				<p className='text-red-600 dark:text-red-300 mt-2'>{error}</p>
			</div>
		);
	}

	if (!currentAccount) {
		return (
			<EmptyState
				title='No Account Selected'
				description='Please select or create an account to view budgets.'
				actionText='Go to Accounts'
				onAction={() => navigate('/accounts')}
			/>
		);
	}

	return (
		<div className='container mx-auto px-4 py-6'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
				<h1 className='text-2xl font-bold mb-4 md:mb-0'>Budgets</h1>
				<button
					onClick={() => navigate('/budgets/new')}
					className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200'>
					+ Add New Budget
				</button>
			</div>

			{/* Tab Navigation */}
			<div className='mb-6 border-b border-gray-200 dark:border-gray-700'>
				<nav className='flex space-x-4'>
					<button
						onClick={() => setActiveTab('active')}
						className={`py-2 px-1 ${
							activeTab === 'active'
								? 'border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400'
								: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
						}`}>
						Active
					</button>
					<button
						onClick={() => setActiveTab('completed')}
						className={`py-2 px-1 ${
							activeTab === 'completed'
								? 'border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400'
								: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
						}`}>
						Completed
					</button>
					<button
						onClick={() => setActiveTab('all')}
						className={`py-2 px-1 ${
							activeTab === 'all'
								? 'border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400'
								: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
						}`}>
						All Budgets
					</button>
				</nav>
			</div>

			{filteredBudgets.length === 0 ? (
				<EmptyState
					title={
						budgets.length === 0
							? 'No Budgets Found'
							: `No ${
									activeTab === 'active'
										? 'active'
										: activeTab === 'completed'
										? 'completed'
										: ''
							  } budgets`
					}
					description={
						budgets.length === 0
							? "You don't have any budgets yet. Create your first budget to track your spending."
							: `You don't have any ${
									activeTab === 'active'
										? 'active'
										: activeTab === 'completed'
										? 'completed'
										: ''
							  } budgets.`
					}
					actionText={
						budgets.length === 0 ? 'Create Budget' : 'View All Budgets'
					}
					onAction={() => {
						if (budgets.length === 0) {
							navigate('/budgets/new');
						} else {
							setActiveTab('all');
						}
					}}
				/>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{filteredBudgets.map((budget) => (
						<div
							key={budget.id}
							className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200'
							onClick={() => navigate(`/budgets/${budget.id}`)}>
							<div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
								<div className='flex justify-between items-start'>
									<div>
										<h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
											{budget.name}
										</h2>
										<p className='text-sm text-gray-500 dark:text-gray-400'>
											{budget.category === 'All'
												? 'All Categories'
												: budget.category}
										</p>
									</div>
									<div className='flex space-x-2'>
										<button
											onClick={(e) => {
												e.stopPropagation();
												navigate(`/budgets/${budget.id}/edit`);
											}}
											className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'>
											<svg
												className='h-5 w-5'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
												/>
											</svg>
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteClick(budget);
											}}
											className='text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'>
											<svg
												className='h-5 w-5'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
												/>
											</svg>
										</button>
									</div>
								</div>
							</div>

							<div className='px-6 py-4'>
								<div className='flex justify-between items-center mb-2'>
									<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Budget
									</span>
									<span className='text-lg font-bold text-gray-900 dark:text-gray-100'>
										{formatCurrency(budget.amount, currentAccount.baseCurrency)}
									</span>
								</div>

								<div className='flex justify-between items-center mb-1'>
									<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Spent
									</span>
									<span className='text-md text-gray-900 dark:text-gray-100'>
										{formatCurrency(
											budget.spent || 0,
											currentAccount.baseCurrency
										)}
									</span>
								</div>

								<BudgetProgressBar budget={budget} />

								<div className='flex justify-between items-center mt-4 text-sm'>
									<span className='text-gray-600 dark:text-gray-400'>
										{formatDate(budget.startDate)} -{' '}
										{formatDate(budget.endDate)}
									</span>
									<span
										className={`font-medium ${getBudgetStatusColor(budget)}`}>
										{getBudgetStatusText(budget)}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Confirmation Dialog for Delete */}
			<ConfirmDialog
				isOpen={showDeleteConfirm}
				title='Delete Budget'
				message={`Are you sure you want to delete the budget "${selectedBudget?.name}"? This action cannot be undone.`}
				confirmText='Delete'
				cancelText='Cancel'
				confirmButtonClass='bg-red-600 hover:bg-red-700'
				onConfirm={confirmDelete}
				onCancel={() => setShowDeleteConfirm(false)}
			/>
		</div>
	);
};

// Helper Functions

const formatCurrency = (amount: number, currency: string): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency,
	}).format(amount);
};

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

const getBudgetStatusText = (budget: Budget): string => {
	const today = new Date();
	const endDate = new Date(budget.endDate);

	if (endDate < today) {
		return 'Completed';
	}

	const percentSpent = ((budget.spent || 0) / budget.amount) * 100;

	if (percentSpent >= 100) {
		return 'Over Budget';
	} else if (percentSpent >= 90) {
		return 'Near Limit';
	} else {
		return 'On Track';
	}
};

const getBudgetStatusColor = (budget: Budget): string => {
	const today = new Date();
	const endDate = new Date(budget.endDate);

	if (endDate < today) {
		return 'text-gray-500 dark:text-gray-400';
	}

	const percentSpent = ((budget.spent || 0) / budget.amount) * 100;

	if (percentSpent >= 100) {
		return 'text-red-600 dark:text-red-400';
	} else if (percentSpent >= 90) {
		return 'text-yellow-600 dark:text-yellow-400';
	} else {
		return 'text-green-600 dark:text-green-400';
	}
};

export default BudgetList;
