// src/components/budgets/BudgetDetail.tsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
	fetchBudget,
	fetchBudgetStatus,
	selectBudgetStatus,
	removeBudget,
} from '../features/budgets/budgetsSlice';
import { addNotification } from '../features/ui/uiSlice';
import { selectCurrentAccount } from '../features/accounts/accountsSlice';
import { RootState, AppDispatch } from '../store';

// Components
import LoadingScreen from '../components/common/LoadingScreen';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BudgetProgressBar from '../components/budgets/BudgetProgressBar';

// Charts
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
} from 'recharts';

const BudgetDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const { isLoading, error } = useSelector((state: RootState) => state.budgets);
	const currentAccount = useSelector(selectCurrentAccount);
	const budgetStatus = useSelector(selectBudgetStatus);

	const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>(
		'overview'
	);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

	useEffect(() => {
		if (id && currentAccount) {
			dispatch(fetchBudget(id));
			dispatch(fetchBudgetStatus(id));
		}
	}, [dispatch, id, currentAccount]);

	const handleDeleteBudget = async () => {
		if (id) {
			try {
				await dispatch(removeBudget(id)).unwrap();
				dispatch(
					addNotification({
						type: 'success',
						message: 'Budget deleted successfully',
					})
				);
				navigate('/budgets');
			} catch (err) {
				dispatch(
					addNotification({
						type: 'error',
						message: 'Failed to delete budget',
					})
				);
			}
		}
	};

	// Format currency
	const formatCurrency = (amount: number): string => {
		if (!currentAccount) return '$0';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currentAccount.baseCurrency,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	// Format date range
	const formatDateRange = (startDate: string, endDate: string): string => {
		try {
			return `${format(new Date(startDate), 'MMM d, yyyy')} - ${format(
				new Date(endDate),
				'MMM d, yyyy'
			)}`;
		} catch (e) {
			return 'Invalid date range';
		}
	};

	// Get status badge color and text
	const getStatusBadge = () => {
		if (!budgetStatus?.budget) return { color: 'gray', text: 'Unknown' };

		const percentUsed = (budgetStatus.spent / budgetStatus.budget.amount) * 100;
		const isActive = new Date(budgetStatus.budget.endDate) >= new Date();

		if (!isActive) {
			return { color: 'gray', text: 'Expired' };
		} else if (percentUsed >= 100) {
			return { color: 'red', text: 'Over Budget' };
		} else if (percentUsed >= 90) {
			return { color: 'yellow', text: 'Near Limit' };
		} else if (percentUsed >= 75) {
			return { color: 'orange', text: 'On Track' };
		} else {
			return { color: 'green', text: 'Under Budget' };
		}
	};

	// Prepare chart data
	const getCategoryData = () => {
		if (!budgetStatus?.expenses) return [];

		// Group expenses by category
		const categoryMap: Record<string, number> = {};

		budgetStatus.expenses.forEach((expense) => {
			if (!categoryMap[expense.category]) {
				categoryMap[expense.category] = 0;
			}
			categoryMap[expense.category] += expense.amount;
		});

		// Convert to array and sort by amount (descending)
		const categoryData = Object.entries(categoryMap)
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value);

		// Take top 5 categories and group the rest as "Other"
		if (categoryData.length > 5) {
			const topCategories = categoryData.slice(0, 4);
			const otherValue = categoryData
				.slice(4)
				.reduce((sum, item) => sum + item.value, 0);

			return [...topCategories, { name: 'Other', value: otherValue }];
		}

		return categoryData;
	};

	// Chart colors
	const COLORS = [
		'#4299E1', // blue-500
		'#48BB78', // green-500
		'#F6AD55', // orange-400
		'#9F7AEA', // purple-500
		'#F56565', // red-500
	];

	// Custom tooltip for charts
	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className='bg-white dark:bg-gray-800 p-2 shadow rounded border border-gray-200 dark:border-gray-700'>
					<p className='font-medium'>{data.name}</p>
					<p className='text-sm'>
						<span className='font-medium'>{formatCurrency(data.value)}</span> (
						{((data.value / budgetStatus!.spent) * 100).toFixed(1)}%)
					</p>
				</div>
			);
		}
		return null;
	};

	if (isLoading || !budgetStatus?.budget) {
		return <LoadingScreen />;
	}

	if (error) {
		return (
			<div className='bg-red-50 dark:bg-red-900/20 p-4 rounded-md'>
				<h2 className='text-lg font-semibold text-red-800 dark:text-red-200'>
					Error
				</h2>
				<p className='mt-1 text-sm text-red-700 dark:text-red-300'>{error}</p>
				<button
					onClick={() => navigate('/budgets')}
					className='mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700'>
					Back to Budgets
				</button>
			</div>
		);
	}

	const { budget, spent, remaining, percentUsed, expenses } = budgetStatus;
	const categoryData = getCategoryData();
	const statusBadge = getStatusBadge();

	return (
		<div className='space-y-6'>
			{/* Budget Header */}
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6'>
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4'>
					<div>
						<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
							{budget.name}
						</h1>
						<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
							{formatDateRange(budget.startDate, budget.endDate)}
						</p>
					</div>

					<div className='flex space-x-2 mt-4 sm:mt-0'>
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusBadge.color}-100 text-${statusBadge.color}-800 dark:bg-${statusBadge.color}-800/30 dark:text-${statusBadge.color}-300`}>
							{statusBadge.text}
						</span>

						<button
							onClick={() => navigate(`/budgets/${budget.id}/edit`)}
							className='inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'>
							<svg
								className='h-4 w-4 mr-1'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
								/>
							</svg>
							Edit
						</button>

						<button
							onClick={() => setShowDeleteConfirm(true)}
							className='inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'>
							<svg
								className='h-4 w-4 mr-1'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
								/>
							</svg>
							Delete
						</button>
					</div>
				</div>

				{/* Budget Progress */}
				<div className='mt-6'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-4'>
						<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
							<p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
								Budget Amount
							</p>
							<p className='mt-1 text-3xl font-semibold text-gray-900 dark:text-white'>
								{formatCurrency(budget.amount)}
							</p>
						</div>

						<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
							<p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
								Spent
							</p>
							<p className='mt-1 text-3xl font-semibold text-gray-900 dark:text-white'>
								{formatCurrency(spent)}
							</p>
						</div>

						<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
							<p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
								Remaining
							</p>
							<p
								className={`mt-1 text-3xl font-semibold ${
									remaining < 0
										? 'text-red-600 dark:text-red-400'
										: 'text-gray-900 dark:text-white'
								}`}>
								{formatCurrency(remaining)}
							</p>
						</div>
					</div>

					<div className='mt-6'>
						<BudgetProgressBar budget={budget} />
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
				<div className='border-b border-gray-200 dark:border-gray-700'>
					<nav className='-mb-px flex'>
						<button
							onClick={() => setActiveTab('overview')}
							className={`py-4 px-6 text-sm font-medium ${
								activeTab === 'overview'
									? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
									: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
							}`}>
							Overview
						</button>
						<button
							onClick={() => setActiveTab('transactions')}
							className={`py-4 px-6 text-sm font-medium ${
								activeTab === 'transactions'
									? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
									: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
							}`}>
							Transactions ({expenses.length})
						</button>
					</nav>
				</div>

				<div className='p-4 sm:p-6'>
					{activeTab === 'overview' ? (
						<div>
							<div className='mb-6 flex justify-between items-center'>
								<h3 className='text-lg font-medium text-gray-900 dark:text-white'>
									Spending by Category
								</h3>

								{/* Chart type toggle */}
								<div className='inline-flex rounded-md shadow-sm'>
									<button
										onClick={() => setChartType('pie')}
										className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
											chartType === 'pie'
												? 'bg-blue-600 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
										}`}>
										Pie
									</button>
									<button
										onClick={() => setChartType('bar')}
										className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
											chartType === 'bar'
												? 'bg-blue-600 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
										}`}>
										Bar
									</button>
								</div>
							</div>

							{categoryData.length === 0 ? (
								<div className='h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg'>
									<p className='text-gray-500 dark:text-gray-400'>
										No expense data available
									</p>
								</div>
							) : (
								<div className='h-80'>
									<ResponsiveContainer
										width='100%'
										height='100%'>
										{chartType === 'pie' ? (
											<PieChart>
												<Pie
													data={categoryData}
													cx='50%'
													cy='50%'
													labelLine={false}
													outerRadius={100}
													fill='#8884d8'
													dataKey='value'
													label={({ name, percent }) =>
														`${name} (${(percent * 100).toFixed(0)}%)`
													}>
													{categoryData.map((entry, index) => (
														<Cell
															key={`cell-${index}`}
															fill={COLORS[index % COLORS.length]}
														/>
													))}
												</Pie>
												<Tooltip content={<CustomTooltip />} />
												<Legend />
											</PieChart>
										) : (
											<BarChart
												data={categoryData}
												layout='vertical'
												margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
												<CartesianGrid
													strokeDasharray='3 3'
													horizontal={true}
													vertical={false}
												/>
												<XAxis type='number' />
												<YAxis
													type='category'
													dataKey='name'
													width={90}
												/>
												<Tooltip content={<CustomTooltip />} />
												<Bar
													dataKey='value'
													fill='#4299E1'>
													{categoryData.map((entry, index) => (
														<Cell
															key={`cell-${index}`}
															fill={COLORS[index % COLORS.length]}
														/>
													))}
												</Bar>
											</BarChart>
										)}
									</ResponsiveContainer>
								</div>
							)}

							{/* Budget Details */}
							<div className='mt-8'>
								<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
									Budget Details
								</h3>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div>
										<dl className='space-y-4'>
											<div>
												<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
													Category
												</dt>
												<dd className='mt-1 text-sm text-gray-900 dark:text-white'>
													{budget.category === 'All'
														? 'All Categories'
														: budget.category}
												</dd>
											</div>

											<div>
												<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
													Period
												</dt>
												<dd className='mt-1 text-sm text-gray-900 dark:text-white capitalize'>
													{budget.period || 'Custom'}
												</dd>
											</div>

											<div>
												<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
													Status
												</dt>
												<dd className='mt-1 text-sm text-gray-900 dark:text-white'>
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusBadge.color}-100 text-${statusBadge.color}-800 dark:bg-${statusBadge.color}-800/30 dark:text-${statusBadge.color}-300`}>
														{statusBadge.text}
													</span>
												</dd>
											</div>
										</dl>
									</div>

									<div>
										<dl className='space-y-4'>
											<div>
												<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
													Start Date
												</dt>
												<dd className='mt-1 text-sm text-gray-900 dark:text-white'>
													{format(new Date(budget.startDate), 'MMM d, yyyy')}
												</dd>
											</div>

											<div>
												<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
													End Date
												</dt>
												<dd className='mt-1 text-sm text-gray-900 dark:text-white'>
													{format(new Date(budget.endDate), 'MMM d, yyyy')}
												</dd>
											</div>

											{budget.notes && (
												<div>
													<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
														Notes
													</dt>
													<dd className='mt-1 text-sm text-gray-900 dark:text-white'>
														{budget.notes}
													</dd>
												</div>
											)}
										</dl>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div>
							<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
								Budget Expenses
							</h3>

							{expenses.length === 0 ? (
								<div className='rounded-md bg-gray-50 dark:bg-gray-700 p-6 text-center'>
									<p className='text-gray-500 dark:text-gray-400'>
										No expenses found for this budget period
									</p>
									<button
										onClick={() => navigate('/expenses/new')}
										className='mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'>
										Add Expense
									</button>
								</div>
							) : (
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
												<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
													Amount
												</th>
											</tr>
										</thead>
										<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
											{expenses.map((expense) => (
												<tr
													key={expense.id}
													className='hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
													onClick={() => navigate(`/expenses/${expense.id}`)}>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200'>
														{format(new Date(expense.date), 'MMM d, yyyy')}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200'>
														{expense.description}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200'>
														{expense.category}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-200'>
														{formatCurrency(expense.amount)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Confirmation Dialog for Delete */}
			<ConfirmDialog
				isOpen={showDeleteConfirm}
				title='Delete Budget'
				message={`Are you sure you want to delete the "${budget.name}" budget? This action cannot be undone.`}
				confirmText='Delete'
				cancelText='Cancel'
				confirmButtonClass='bg-red-600 hover:bg-red-700'
				onConfirm={handleDeleteBudget}
				onCancel={() => setShowDeleteConfirm(false)}
			/>
		</div>
	);
};

export default BudgetDetail;
