import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Wallet,
	CreditCard,
	PiggyBank,
	TrendingUp,
	ArrowUpRight,
	ArrowDownRight,
	Edit,
	Trash2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';
import { DateUtils } from '@/utils/dateUtils';
import { useNotification } from '@/contexts/NotificationContext';
import { apiService } from '@/services/api';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

// Interfaces for detailed account data
interface AccountDetail {
	id: string;
	name: string;
	type: 'checking' | 'savings' | 'credit' | 'investment';
	balance: number;
	currency: string;
	openingBalance: number;
	institution?: string;
	accountNumber?: string;
}

interface Transaction {
	id: string;
	date: Date;
	amount: number;
	type: 'income' | 'expense';
	category: string;
	description?: string;
}

interface BalanceHistory {
	date: string;
	balance: number;
}

export const AccountDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { formatCurrency } = useCurrency();
	const { addNotification } = useNotification();

	const [account, setAccount] = useState<AccountDetail | null>(null);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [transactionFilter, setTransactionFilter] = useState<
		'all' | 'income' | 'expense'
	>('all');
	const [timeRange, setTimeRange] = useState<'1M' | '3M' | '1Y'>('1M');

	// Fetch account details and transactions
	useEffect(() => {
		const fetchAccountDetails = async () => {
			if (!id) return;

			try {
				setIsLoading(true);
				// Fetch account details
				const accountDetails = await apiService.getAccountById(id);
				setAccount(accountDetails);

				// Fetch transactions
				const fetchedTransactions = await apiService.getAccountTransactions(
					id,
					{
						timeRange,
					}
				);
				setTransactions(fetchedTransactions);

				// Fetch balance history
				const balanceHistoryData = await apiService.getAccountBalanceHistory(
					id,
					{
						timeRange,
					}
				);
				setBalanceHistory(balanceHistoryData);
			} catch (error) {
				addNotification('Failed to load account details', 'error');
				navigate('/accounts');
			} finally {
				setIsLoading(false);
			}
		};

		fetchAccountDetails();
	}, [id, navigate, addNotification, timeRange]);

	// Get account type icon
	const getAccountIcon = (type: AccountDetail['type']) => {
		const iconProps = { className: 'w-8 h-8 mr-2 text-muted-foreground' };
		switch (type) {
			case 'checking':
				return <Wallet {...iconProps} />;
			case 'savings':
				return <PiggyBank {...iconProps} />;
			case 'credit':
				return <CreditCard {...iconProps} />;
			case 'investment':
				return <TrendingUp {...iconProps} />;
		}
	};

	// Filter transactions based on selected filter
	const filteredTransactions = transactions.filter(
		(transaction) =>
			transactionFilter === 'all' || transaction.type === transactionFilter
	);

	// Handle account deletion
	const handleDeleteAccount = async () => {
		if (!account) return;

		try {
			await apiService.deleteAccount(account.id);
			addNotification('Account deleted successfully', 'success');
			navigate('/accounts');
		} catch (error) {
			addNotification('Failed to delete account', 'error');
		}
	};

	// Render account summary card
	const renderAccountSummaryCard = () => {
		if (!account) return null;

		const isNegative = account.balance < 0;
		const balanceChange = account.balance - account.openingBalance;
		const percentageChange = (balanceChange / account.openingBalance) * 100;

		return (
			<Card>
				<CardHeader className='flex flex-row items-center justify-between'>
					<div className='flex items-center'>
						{getAccountIcon(account.type)}
						<div>
							<h2 className='text-xl font-bold'>{account.name}</h2>
							<p className='text-sm text-muted-foreground capitalize'>
								{account.type} Account
							</p>
						</div>
					</div>
					<div className='flex space-x-2'>
						<Button
							variant='outline'
							size='icon'
							onClick={() => navigate(`/accounts/edit/${account.id}`)}>
							<Edit className='h-4 w-4' />
						</Button>
						<Button
							variant='destructive'
							size='icon'
							onClick={() => setIsDeleteDialogOpen(true)}>
							<Trash2 className='h-4 w-4' />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className='grid md:grid-cols-2 gap-4'>
						<div>
							<p className='text-sm text-muted-foreground'>Current Balance</p>
							<p
								className={`text-2xl font-bold ${
									isNegative ? 'text-red-600' : ''
								}`}>
								{formatCurrency(account.balance, {
									currency: account.currency,
								})}
							</p>
						</div>
						<div>
							<p className='text-sm text-muted-foreground'>Balance Change</p>
							<div className='flex items-center'>
								{balanceChange >= 0 ? (
									<ArrowUpRight className='mr-2 text-green-500' />
								) : (
									<ArrowDownRight className='mr-2 text-red-500' />
								)}
								<p
									className={`text-lg font-semibold ${
										balanceChange >= 0 ? 'text-green-600' : 'text-red-600'
									}`}>
									{formatCurrency(Math.abs(balanceChange))} (
									{percentageChange.toFixed(2)}%)
								</p>
							</div>
						</div>
						{account.institution && (
							<div>
								<p className='text-sm text-muted-foreground'>Institution</p>
								<p>{account.institution}</p>
							</div>
						)}
						{account.accountNumber && (
							<div>
								<p className='text-sm text-muted-foreground'>Account Number</p>
								<p>**** **** **** {account.accountNumber.slice(-4)}</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		);
	};

	// Render balance history chart
	const renderBalanceHistoryChart = () => (
		<Card>
			<CardHeader>
				<div className='flex justify-between items-center'>
					<CardTitle>Balance History</CardTitle>
					<Select
						value={timeRange}
						onValueChange={(value: '1M' | '3M' | '1Y') => setTimeRange(value)}>
						<SelectTrigger className='w-[100px]'>
							<SelectValue placeholder='Time Range' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='1M'>1 Month</SelectItem>
							<SelectItem value='3M'>3 Months</SelectItem>
							<SelectItem value='1Y'>1 Year</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer
					width='100%'
					height={300}>
					<LineChart data={balanceHistory}>
						<CartesianGrid strokeDasharray='3 3' />
						<XAxis dataKey='date' />
						<YAxis
							tickFormatter={(value) =>
								formatCurrency(value, { currency: account?.currency })
							}
						/>
						<Tooltip
							formatter={(value) =>
								formatCurrency(value as number, { currency: account?.currency })
							}
						/>
						<Line
							type='monotone'
							dataKey='balance'
							stroke='#8884d8'
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);

	// Render transactions section
	const renderTransactionsSection = () => (
		<Card>
			<CardHeader>
				<div className='flex justify-between items-center'>
					<CardTitle>Transactions</CardTitle>
					<div className='flex space-x-2'>
						<Select
							value={transactionFilter}
							onValueChange={(value: 'all' | 'income' | 'expense') =>
								setTransactionFilter(value)
							}>
							<SelectTrigger className='w-[120px]'>
								<SelectValue placeholder='Filter' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Transactions</SelectItem>
								<SelectItem value='income'>Income</SelectItem>
								<SelectItem value='expense'>Expenses</SelectItem>
							</SelectContent>
						</Select>
						<Button variant='outline'>Export</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{filteredTransactions.length > 0 ? (
					<div className='divide-y'>
						{filteredTransactions.map((transaction) => (
							<div
								key={transaction.id}
								className='flex justify-between items-center py-3'>
								<div>
									<p className='font-medium'>{transaction.category}</p>
									<p className='text-sm text-muted-foreground'>
										{transaction.description || ''}
									</p>
									<p className='text-xs text-muted-foreground'>
										{DateUtils.formatDate(transaction.date)}
									</p>
								</div>
								<span
									className={`font-bold ${
										transaction.type === 'income'
											? 'text-green-600'
											: 'text-red-600'
									}`}>
									{formatCurrency(transaction.amount)}
								</span>
							</div>
						))}
					</div>
				) : (
					<p className='text-center text-muted-foreground'>
						No transactions found
					</p>
				)}
			</CardContent>
		</Card>
	);

	if (isLoading) {
		return <div className='text-center'>Loading account details...</div>;
	}

	if (!account) {
		return <div className='text-center'>Account not found</div>;
	}

	return (
		<div className='container mx-auto p-4 space-y-6'>
			{renderAccountSummaryCard()}

			<Tabs defaultValue='balance'>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='balance'>Balance History</TabsTrigger>
					<TabsTrigger value='transactions'>Transactions</TabsTrigger>
				</TabsList>
				<TabsContent value='balance'>{renderBalanceHistoryChart()}</TabsContent>
				<TabsContent value='transactions'>
					{renderTransactionsSection()}
				</TabsContent>
			</Tabs>

			{/* Confirmation Dialog for Account Deletion */}
			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleDeleteAccount}
				title='Delete Account'
				message='Are you sure you want to delete this account? This action cannot be undone.'
				confirmText='Delete'
				variant='destructive'
			/>
		</div>
	);
};
