import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
	fetchExpenses,
	selectRecentExpenses,
	selectTotalExpensesByCategory,
	selectExpensesByMonth,
} from '../store/slices/expensesSlice';
import {
	fetchBudgets,
	selectBudgets,
	selectBudgetStatus,
} from '../store/slices/budgetsSlice';
import { selectCurrentAccount } from '../store/slices/accountsSlice';
import { selectUser } from '../store/slices/authSlice';

// Components
import LoadingScreen from '../components/common/LoadingScreen';
import ExpenseCard from '../components/expenses/ExpenseCard';
import BudgetSummary from '../components/budgets/BudgetSummary';
import ExpenseChart from '../components/insights/ExpenseChart';
import InsightsCard from '../components/insights/InsightsCard';
import QuickExpenseForm from '../components/expenses/QuickExpenseForm';
import AccountSummary from '../components/accounts/AccountSummary';
import EmptyState from '../components/common/EmptyState';

const Dashboard = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const currentUser = useSelector(selectUser);
	const currentAccount = useSelector(selectCurrentAccount);
	const recentExpenses = useSelector(selectRecentExpenses);
	const expensesByCategory = useSelector(selectTotalExpensesByCategory);
	const expensesByMonth = useSelector(selectExpensesByMonth);
	const budgets = useSelector(selectBudgets);
	const budgetStatus = useSelector(selectBudgetStatus);

	const [isLoading, setIsLoading] = useState(true);
	const [quickAddOpen, setQuickAddOpen] = useState(false);

	useEffect(() => {
		// Redirect if no account is selected
		if (!currentAccount) {
			navigate('/accounts');
			return;
		}

		const loadDashboardData = async () => {
			try {
				// Fetch expenses and budgets for the current account
				await Promise.all([
					dispatch(fetchExpenses(currentAccount.id)),
					dispatch(fetchBudgets(currentAccount.id)),
				]);
				setIsLoading(false);
			} catch (error) {
				console.error('Failed to load dashboard data:', error);
				setIsLoading(false);
			}
		};

		loadDashboardData();
	}, [dispatch, currentAccount, navigate]);

	if (isLoading) {
		return <LoadingScreen />;
	}

	if (!currentAccount) {
		return (
			<EmptyState
				title='No Account Selected'
				description='Please select or create an account to view your financial dashboard.'
				actionText='Go to Accounts'
				onAction={() => navigate('/accounts')}
			/>
		);
	}

	return (
		<div className='container mx-auto px-4 py-6'>
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Left Column - Account Summary & Quick Add */}
				<div className='lg:col-span-1'>
					<AccountSummary account={currentAccount} />

					<div className='mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
						<h2 className='text-lg font-semibold mb-4'>Quick Add Expense</h2>
						<button
							onClick={() => setQuickAddOpen(true)}
							className='w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200'>
							+ Add New Expense
						</button>

						{quickAddOpen && (
							<QuickExpenseForm
								accountId={currentAccount.id}
								onClose={() => setQuickAddOpen(false)}
							/>
						)}
					</div>

					{/* Budget Summary Widget */}
					<div className='mt-6'>
						<h2 className='text-lg font-semibold mb-4'>Budget Status</h2>
						{budgets && budgets.length > 0 ? (
							<BudgetSummary budgets={budgets} />
						) : (
							<EmptyState
								title='No Budgets Yet'
								description='Create your first budget to track your spending.'
								actionText='Create Budget'
								onAction={() => navigate('/budgets/new')}
								compact
							/>
						)}
					</div>
				</div>

				{/* Middle Column - Expense Chart & Stats */}
				<div className='lg:col-span-1'>
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-full'>
						<h2 className='text-lg font-semibold mb-4'>Spending Overview</h2>
						{expensesByCategory &&
						Object.keys(expensesByCategory).length > 0 ? (
							<ExpenseChart
								expensesByCategory={expensesByCategory}
								expensesByMonth={expensesByMonth}
							/>
						) : (
							<div className='h-64 flex items-center justify-center'>
								<p className='text-gray-500 dark:text-gray-400 text-center'>
									Add expenses to see your spending breakdown
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Right Column - Insights & Recent Expenses */}
				<div className='lg:col-span-1'>
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
						<h2 className='text-lg font-semibold mb-4'>Insights</h2>
						<InsightsCard
							expenses={recentExpenses}
							budgets={budgets}
							accountId={currentAccount.id}
						/>
					</div>

					<div className='mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
						<div className='flex justify-between items-center mb-4'>
							<h2 className='text-lg font-semibold'>Recent Expenses</h2>
							<button
								onClick={() => navigate('/expenses')}
								className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium'>
								View All
							</button>
						</div>

						{recentExpenses && recentExpenses.length > 0 ? (
							<div className='space-y-4'>
								{recentExpenses.slice(0, 5).map((expense) => (
									<ExpenseCard
										key={expense.id}
										expense={expense}
										onClick={() => navigate(`/expenses/${expense.id}`)}
									/>
								))}
							</div>
						) : (
							<EmptyState
								title='No Expenses Yet'
								description='Start tracking your spending by adding your first expense.'
								actionText='Add Expense'
								onAction={() => navigate('/expenses/new')}
								compact
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
