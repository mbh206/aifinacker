import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
	fetchExpenses,
	selectAllExpenses,
	selectExpensesStatus,
} from '../store/slices/expensesSlice';
import {
	fetchBudgets,
	selectBudgets,
	selectBudgetStatus,
} from '../store/slices/budgetsSlice';
import { selectCurrentAccount } from '../store/slices/accountsSlice';

// Components
import LoadingScreen from '../components/common/LoadingScreen';
import EmptyState from '../components/common/EmptyState';
import ExpenseChart from '../components/insights/ExpenseChart';
import BudgetOverviewChart from '../components/insights/BudgetOverviewChart';
import SpendingTrendsChart from '../components/insights/SpendingTrendsChart';
import InsightCard from '../components/insights/InsightsCard';

// Types
import { Expense, Budget } from '../types';

const Insights = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const expenses = useSelector(selectAllExpenses);
	const expensesStatus = useSelector(selectExpensesStatus);
	const budgets = useSelector(selectBudgets);
	const budgetStatus = useSelector(selectBudgetStatus);
	const currentAccount = useSelector(selectCurrentAccount);

	const [insights, setInsights] = useState<
		Array<{
			id: string;
			type: 'success' | 'warning' | 'info' | 'tip';
			title: string;
			message: string;
			actionText?: string;
			action?: () => void;
		}>
	>([]);

	const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');

	// Load data when component mounts
	useEffect(() => {
		if (currentAccount) {
			dispatch(fetchExpenses(currentAccount.id));
			dispatch(fetchBudgets(currentAccount.id));
		}
	}, [dispatch, currentAccount]);

	// Generate insights based on expenses and budgets
	useEffect(() => {
		if (!expenses || !budgets || expenses.length === 0) return;

		const newInsights = [];

		// 1. Check for over-budget categories
		const overBudgetCategories = getOverBudgetCategories(expenses, budgets);
		if (overBudgetCategories.length > 0) {
			newInsights.push({
				id: 'over-budget',
				type: 'warning',
				title: 'Budget Alert',
				message: `You're over budget in ${overBudgetCategories.length} ${
					overBudgetCategories.length === 1 ? 'category' : 'categories'
				}: ${overBudgetCategories.join(', ')}`,
				actionText: 'View Budgets',
				action: () => navigate('/budgets'),
			});
		}

		// 2. Identify spending trends
		const { unusualIncrease, topCategory } = analyzeSpendingTrends(expenses);
		if (unusualIncrease) {
			newInsights.push({
				id: 'spending-increase',
				type: 'info',
				title: 'Spending Trend',
				message: `Your spending in ${unusualIncrease.category} has increased by ${unusualIncrease.percentage}% compared to last month.`,
			});
		}

		if (topCategory) {
			newInsights.push({
				id: 'top-category',
				type: 'info',
				title: 'Top Spending Category',
				message: `Your highest spending category is ${topCategory.category} (${topCategory.percentage}% of total).`,
			});
		}

		// 3. Savings opportunities
		const savingsOpportunities = findSavingsOpportunities(expenses);
		if (savingsOpportunities.length > 0) {
			savingsOpportunities.forEach((opportunity, index) => {
				newInsights.push({
					id: `savings-${index}`,
					type: 'tip',
					title: 'Savings Opportunity',
					message: opportunity,
				});
			});
		}

		// 4. Budget recommendation if no budgets
		if (budgets.length === 0) {
			newInsights.push({
				id: 'create-budget',
				type: 'tip',
				title: 'Create Your First Budget',
				message:
					'Start tracking your spending against budgets to better manage your finances.',
				actionText: 'Create Budget',
				action: () => navigate('/budgets/new'),
			});
		}

		// Set the insights
		setInsights(newInsights);
	}, [expenses, budgets, navigate]);

	// Filter expenses based on selected time range
	const getFilteredExpenses = (): Expense[] => {
		if (!expenses) return [];

		const today = new Date();
		let startDate: Date;

		switch (timeRange) {
			case '1m':
				startDate = new Date(today);
				startDate.setMonth(today.getMonth() - 1);
				break;
			case '3m':
				startDate = new Date(today);
				startDate.setMonth(today.getMonth() - 3);
				break;
			case '6m':
				startDate = new Date(today);
				startDate.setMonth(today.getMonth() - 6);
				break;
			case '1y':
				startDate = new Date(today);
				startDate.setFullYear(today.getFullYear() - 1);
				break;
			default:
				startDate = new Date(today);
				startDate.setMonth(today.getMonth() - 3);
		}

		return expenses.filter((expense) => new Date(expense.date) >= startDate);
	};

	// Loading state
	const isLoading = expensesStatus === 'loading' || budgetStatus === 'loading';

	if (isLoading) {
		return <LoadingScreen />;
	}

	if (!currentAccount) {
		return (
			<EmptyState
				title='No Account Selected'
				description='Please select or create an account to view insights.'
				actionText='Go to Accounts'
				onAction={() => navigate('/accounts')}
			/>
		);
	}

	if (!expenses || expenses.length === 0) {
		return (
			<EmptyState
				title='Not Enough Data'
				description='Add expenses to see insights and spending analysis.'
				actionText='Add Expense'
				onAction={() => navigate('/expenses/new')}
			/>
		);
	}

	const filteredExpenses = getFilteredExpenses();

	return (
		<div className='container mx-auto px-4 py-6'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
				<h1 className='text-2xl font-bold mb-4 md:mb-0'>Financial Insights</h1>

				{/* Time Range Selector */}
				<div className='inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg'>
					{['1m', '3m', '6m', '1y'].map((range) => (
						<button
							key={range}
							onClick={() => setTimeRange(range as '1m' | '3m' | '6m' | '1y')}
							className={`px-4 py-2 text-sm font-medium ${
								timeRange === range
									? 'bg-blue-600 text-white'
									: 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
							} ${range === '1m' ? 'rounded-l-lg' : ''} ${
								range === '1y' ? 'rounded-r-lg' : ''
							}`}>
							{range}
						</button>
					))}
				</div>
			</div>

			{/* Insights and Charts Grid */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Left Column - Charts */}
				<div className='lg:col-span-2 space-y-6'>
					{/* Expense by Category */}
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
						<h2 className='text-lg font-semibold mb-4'>Expense Breakdown</h2>
						<ExpenseChart expenses={filteredExpenses} />
					</div>

					{/* Budget Overview */}
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
						<h2 className='text-lg font-semibold mb-4'>Budget Overview</h2>
						{budgets && budgets.length > 0 ? (
							<BudgetOverviewChart budgets={budgets} />
						) : (
							<div className='flex flex-col items-center justify-center py-8'>
								<p className='text-gray-500 dark:text-gray-400 text-center mb-4'>
									No budgets created yet. Create a budget to track your
									spending.
								</p>
								<button
									onClick={() => navigate('/budgets/new')}
									className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200'>
									Create Your First Budget
								</button>
							</div>
						)}
					</div>

					{/* Spending Trends */}
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
						<h2 className='text-lg font-semibold mb-4'>Spending Trends</h2>
						<SpendingTrendsChart expenses={filteredExpenses} />
					</div>
				</div>

				{/* Right Column - AI Insights */}
				<div className='lg:col-span-1 space-y-4'>
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
						<h2 className='text-lg font-semibold mb-4'>
							AI Financial Insights
						</h2>
						{insights.length > 0 ? (
							<div className='space-y-4'>
								{insights.map((insight) => (
									<InsightCard
										key={insight.id}
										type={insight.type}
										title={insight.title}
										message={insight.message}
										actionText={insight.actionText}
										onAction={insight.action}
									/>
								))}
							</div>
						) : (
							<p className='text-gray-500 dark:text-gray-400 text-center py-4'>
								Add more transactions to get personalized insights.
							</p>
						)}
					</div>

					{/* Quick Summary */}
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
						<h2 className='text-lg font-semibold mb-4'>Financial Summary</h2>
						<div className='space-y-3'>
							<div className='flex justify-between items-center'>
								<span className='text-gray-600 dark:text-gray-400'>
									Total Spending
								</span>
								<span className='font-medium text-gray-900 dark:text-gray-100'>
									{formatCurrency(
										filteredExpenses.reduce(
											(sum, expense) => sum + expense.amount,
											0
										),
										currentAccount.baseCurrency
									)}
								</span>
							</div>
							<div className='flex justify-between items-center'>
								<span className='text-gray-600 dark:text-gray-400'>
									Average Monthly
								</span>
								<span className='font-medium text-gray-900 dark:text-gray-100'>
									{formatCurrency(
										calculateAverageMonthlySpending(filteredExpenses),
										currentAccount.baseCurrency
									)}
								</span>
							</div>
							<div className='flex justify-between items-center'>
								<span className='text-gray-600 dark:text-gray-400'>
									Largest Expense
								</span>
								<span className='font-medium text-gray-900 dark:text-gray-100'>
									{formatCurrency(
										Math.max(
											...filteredExpenses.map((expense) => expense.amount)
										),
										currentAccount.baseCurrency
									)}
								</span>
							</div>
							<div className='flex justify-between items-center'>
								<span className='text-gray-600 dark:text-gray-400'>
									Total Transactions
								</span>
								<span className='font-medium text-gray-900 dark:text-gray-100'>
									{filteredExpenses.length}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Helper Functions

// Check which categories are over budget
const getOverBudgetCategories = (
	expenses: Expense[],
	budgets: Budget[]
): string[] => {
	const overBudgetCategories: string[] = [];

	// Get active budgets
	const activeBudgets = budgets.filter(
		(budget) => new Date(budget.endDate) >= new Date()
	);

	activeBudgets.forEach((budget) => {
		let categoryExpenses = 0;

		// For "All" category budget, sum all expenses within budget period
		if (budget.category === 'All') {
			categoryExpenses = expenses
				.filter(
					(expense) =>
						new Date(expense.date) >= new Date(budget.startDate) &&
						new Date(expense.date) <= new Date(budget.endDate)
				)
				.reduce((sum, expense) => sum + expense.amount, 0);
		} else {
			// For specific category, sum expenses in that category within budget period
			categoryExpenses = expenses
				.filter(
					(expense) =>
						expense.category === budget.category &&
						new Date(expense.date) >= new Date(budget.startDate) &&
						new Date(expense.date) <= new Date(budget.endDate)
				)
				.reduce((sum, expense) => sum + expense.amount, 0);
		}

		// Check if over budget
		if (categoryExpenses > budget.amount) {
			overBudgetCategories.push(
				budget.category === 'All' ? 'Overall' : budget.category
			);
		}
	});

	return overBudgetCategories;
};

// Find savings opportunities based on spending patterns
const findSavingsOpportunities = (expenses: Expense[]): string[] => {
	const opportunities: string[] = [];

	// Analyze recurring expenses
	const recurringExpenseCategories = [
		'Subscriptions',
		'Entertainment',
		'Utilities',
		'Food',
	];
	const today = new Date();
	const threeMonthsAgo = new Date(today);
	threeMonthsAgo.setMonth(today.getMonth() - 3);

	// Calculate monthly averages by category
	const categoryMonthlyAvg: Record<string, number> = {};
	const categoryCount: Record<string, number> = {};

	expenses.forEach((expense) => {
		const date = new Date(expense.date);
		if (date >= threeMonthsAgo) {
			categoryMonthlyAvg[expense.category] =
				(categoryMonthlyAvg[expense.category] || 0) + expense.amount;
			categoryCount[expense.category] =
				(categoryCount[expense.category] || 0) + 1;
		}
	});

	// Check for high spending in subscription-like categories
	recurringExpenseCategories.forEach((category) => {
		if (
			categoryMonthlyAvg[category] &&
			categoryMonthlyAvg[category] > 200 &&
			categoryCount[category] > 3
		) {
			opportunities.push(
				`Consider reviewing your ${category.toLowerCase()} expenses - you're spending an average of ${formatCurrency(
					categoryMonthlyAvg[category] / 3,
					'USD'
				)} per month.`
			);
		}
	});

	// Check for spending patterns
	if (
		opportunities.length === 0 &&
		Object.keys(categoryMonthlyAvg).length > 0
	) {
		// Identify category with highest average if nothing else was found
		let highestAvg = 0;
		let highestCategory = '';

		Object.entries(categoryMonthlyAvg).forEach(([category, total]) => {
			const monthlyAvg = total / 3;
			if (monthlyAvg > highestAvg) {
				highestAvg = monthlyAvg;
				highestCategory = category;
			}
		});

		if (highestAvg > 300) {
			opportunities.push(
				`Your highest spending category is ${highestCategory}. Consider setting a budget to track and potentially reduce these expenses.`
			);
		}
	}

	return opportunities;
};

// Calculate average monthly spending
const calculateAverageMonthlySpending = (expenses: Expense[]): number => {
	if (expenses.length === 0) return 0;

	// Get date range
	const dates = expenses.map((expense) => new Date(expense.date));
	const minDate = new Date(Math.min(...dates.map((date) => date.getTime())));
	const maxDate = new Date(Math.max(...dates.map((date) => date.getTime())));

	// Calculate total months (min 1)
	const monthsDiff =
		(maxDate.getFullYear() - minDate.getFullYear()) * 12 +
		(maxDate.getMonth() - minDate.getMonth());
	const months = Math.max(1, monthsDiff === 0 ? 1 : monthsDiff);

	// Calculate total spending
	const totalSpending = expenses.reduce(
		(sum, expense) => sum + expense.amount,
		0
	);

	return totalSpending / months;
};

// Format currency
const formatCurrency = (amount: number, currency: string): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency,
	}).format(amount);
};

// Analyze spending trends
const analyzeSpendingTrends = (
	expenses: Expense[]
): {
	unusualIncrease: { category: string; percentage: number } | null;
	topCategory: { category: string; percentage: number } | null;
} => {
	// Get current and last month
	const today = new Date();
	const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
	const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
	const twoMonthsAgoStart = new Date(
		today.getFullYear(),
		today.getMonth() - 2,
		1
	);

	// Filter expenses for current and last month
	const currentMonthExpenses = expenses.filter(
		(expense) =>
			new Date(expense.date) >= currentMonthStart &&
			new Date(expense.date) < today
	);

	const lastMonthExpenses = expenses.filter(
		(expense) =>
			new Date(expense.date) >= lastMonthStart &&
			new Date(expense.date) < currentMonthStart
	);

	// Group expenses by category
	const currentMonthByCategory: Record<string, number> = {};
	const lastMonthByCategory: Record<string, number> = {};

	currentMonthExpenses.forEach((expense) => {
		currentMonthByCategory[expense.category] =
			(currentMonthByCategory[expense.category] || 0) + expense.amount;
	});

	lastMonthExpenses.forEach((expense) => {
		lastMonthByCategory[expense.category] =
			(lastMonthByCategory[expense.category] || 0) + expense.amount;
	});

	// Find unusual increases (>25%)
	let unusualIncrease: { category: string; percentage: number } | null = null;

	Object.keys(currentMonthByCategory).forEach((category) => {
		if (lastMonthByCategory[category] && lastMonthByCategory[category] > 0) {
			const increase =
				((currentMonthByCategory[category] - lastMonthByCategory[category]) /
					lastMonthByCategory[category]) *
				100;

			if (increase > 25 && currentMonthByCategory[category] > 100) {
				// Only flag significant increases on non-trivial amounts
				if (!unusualIncrease || increase > unusualIncrease.percentage) {
					unusualIncrease = {
						category,
						percentage: Math.round(increase),
					};
				}
			}
		}
	});

	// Find top spending category
	let topCategory: { category: string; percentage: number } | null = null;
	const totalSpent = Object.values(currentMonthByCategory).reduce(
		(sum, amount) => sum + amount,
		0
	);

	if (totalSpent > 0) {
		let maxSpent = 0;
		let maxCategory = '';

		Object.entries(currentMonthByCategory).forEach(([category, amount]) => {
			if (amount > maxSpent) {
				maxSpent = amount;
				maxCategory = category;
			}
		});

		const percentage = (maxSpent / totalSpent) * 100;

		if (percentage > 25) {
			// Only flag if it's a significant portion of spending
			topCategory = {
				category: maxCategory,
				percentage: Math.round(percentage),
			};
		}
	}

	return { unusualIncrease, topCategory };
};

export default Insights;
